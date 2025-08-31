# app.py
import re
import json
import os
import datetime
import inflect
import io
from rapidfuzz import fuzz, process
from flask import Flask, request, render_template_string, redirect, url_for, jsonify, session, flash
import speech_recognition as sr
import ffmpeg

class ShoppingAssistant:
    def __init__(self, filename="shopping_list.json"):
        self.shopping_list = {}
        self.shopping_history = {}
        self.filename = filename
        self.inflector = inflect.engine()
        self.action_phrases = {
            "add": ["chahiye", "leni hai", "i want", "i need", "please add", "get me", "daal do", "add"],
            "remove": ["hatao", "hatana", "nikal do", "delete", "remove", "take out"],
            "find": ["dhoondo", "dhundo", "khojo", "find", "search for", "look for"],
            "clear": ["clear list", "sab hatao", "list khali karo", "clear the list"],
            "suggest": ["get suggestions", "suggest something"]
        }
        self.hindi_item_map = {
            "doodh": "milk", "cheeni": "sugar", "anda": "egg", "ande": "egg", "chawal": "rice",
            "atta": "flour", "namak": "salt", "mirchi": "chili", "aloo": "potato",
            "tamatar": "tomato", "pyaaz": "onion"
        }
        self.synonym_map = {"soda": "cold drink", "biscuits": "biscuit", "curd": "yogurt", "bun": "bread"}
        self.category_map = {
            "milk": "Dairy & Eggs", "cheese": "Dairy & Eggs", "yogurt": "Dairy & Eggs", "butter": "Dairy & Eggs", "paneer": "Dairy & Eggs", "egg": "Dairy & Eggs",
            "apple": "Produce", "banana": "Produce", "onion": "Produce", "potato": "Produce", "tomato": "Produce", "sabzi": "Produce", "mango": "Produce", "orange": "Produce", "carrot": "Produce", "radish": "Produce", "corn": "Produce",
            "bread": "Bakery & Breads", "roti": "Bakery & Breads", "cake": "Bakery & Breads",
            "sugar": "Pantry Staples", "flour": "Pantry Staples", "rice": "Pantry Staples", "salt": "Pantry Staples", "oil": "Pantry Staples", "atta": "Pantry Staples", "jaggery": "Pantry Staples", "honey": "Pantry Staples", "quinoa": "Pantry Staples", "millets": "Pantry Staples", "ghee": "Pantry Staples",
            "chips": "Snacks", "biscuit": "Snacks", "chocolate": "Snacks", "pakora": "Snacks",
            "cold drink": "Beverages", "coconut water": "Beverages", "buttermilk": "Beverages", "tea": "Beverages",
        }
        self.unit_map = {
            "liter": "liter", "liters": "liter", "litre": "liter", "litres": "liter", "ltr": "liter", "ltrs": "liter",
            "kg": "kg", "kgs": "kg", "kilo": "kg", "kilos": "kg", "kilogram": "kg", "kilograms": "kg",
            "packet": "packet", "packets": "packet", "pckt": "packet", "dozen": "dozen", "dozens": "dozen"
        }
        self.seasonal_items = { "summer": ["mango", "coconut water", "buttermilk"], "monsoon": ["corn", "tea", "pakora"], "winter": ["orange", "carrot", "radish", "jaggery"] }
        self.substitutes = { "milk": ["almond milk", "soy milk"], "sugar": ["jaggery", "honey"], "butter": ["ghee", "margarine"], "rice": ["quinoa", "millets"] }
        self.mock_prices = { "milk": 55, "egg": 8, "bread": 35, "apple": 120, "tomato": 40, "sugar": 45, "rice": 60, "potato": 30, "onion": 25, "flour": 50, "jaggery": 80, "honey": 150, "mango": 100 }
        
        # [MODIFIED] Create a flat list of all action keywords for easier stripping
        self.all_action_keywords = [keyword for sublist in self.action_phrases.values() for keyword in sublist]
        self.all_known_items = set(self.category_map.keys()) | set(self.synonym_map.keys()) | set(self.hindi_item_map.values())

        self.load_list()

    # [CRITICAL FIX] Upgraded normalization and parsing logic to reliably separate items from commands.
    def normalize_command(self, input_str: str) -> tuple[str, str, list]:
        """
        Determines the user's intent (action) and cleans the string of all command-related keywords,
        leaving only the item details. Returns (action, item_details, warnings).
        """
        warnings = []
        s = input_str.lower().strip()
        action = "add" # Default action

        # Determine the primary action
        for act, phrases in self.action_phrases.items():
            for ph in phrases:
                if ph in s:
                    action = act
                    break
            if action != "add": break # If found, stop searching

        # Create a clean string of item details by removing all action keywords
        item_details = s
        for keyword in self.all_action_keywords:
            item_details = item_details.replace(keyword, " ")
        
        # Also remove filler words
        item_details = re.sub(r"\b(mujhe|list se|from list|please|under|below|rupees)\b", " ", item_details)
        item_details = re.sub(r"\s+", " ", item_details).strip()
        
        # Fuzzy match Hindi words in the item details
        tokens, normalized_tokens = item_details.split(), []
        for token in tokens:
            if token.isdigit():
                normalized_tokens.append(token)
                continue
            if token in self.hindi_item_map:
                normalized_tokens.append(self.hindi_item_map[token])
            else:
                match = process.extractOne(token, self.hindi_item_map.keys(), scorer=fuzz.WRatio, score_cutoff=78)
                if match:
                    best_match_word = match[0]
                    normalized_tokens.append(self.hindi_item_map[best_match_word])
                    warnings.append(f"Did you mean '{self.hindi_item_map[best_match_word]}' instead of '{token}'?")
                else:
                    normalized_tokens.append(token)
        
        cleaned_item_details = " ".join(normalized_tokens)
        
        return action, cleaned_item_details, warnings

    def parse_command(self, action: str, item_details: str) -> dict:
        """
        Takes a clean string of item details and extracts the item, quantity, and unit.
        """
        command_dict = {"action": action, "item_key": "", "display_name": "", "quantity": 1, "unit": "", "warnings": []}
        
        if action in ["clear", "suggest"]: return command_dict

        text_for_parsing = item_details
        
        price_match = re.search(r'(\d+)', text_for_parsing)
        if action == "find" and price_match:
            command_dict["max_price"] = float(price_match.group(1))
            return command_dict

        quantity_match = re.search(r'(\d+)', text_for_parsing)
        if quantity_match:
            command_dict["quantity"] = int(quantity_match.group(1))
        
        unit_match = process.extractOne(text_for_parsing, self.unit_map.keys(), scorer=fuzz.partial_ratio, score_cutoff=90)
        if unit_match:
            command_dict["unit"] = self.unit_map[unit_match[0]]

        best_item_match = None
        best_score = 0
        for known_item in sorted(list(self.all_known_items), key=len, reverse=True):
             score = fuzz.partial_ratio(known_item, text_for_parsing)
             if score > best_score and score > 75:
                 best_score = score
                 best_item_match = known_item
        
        if best_item_match:
             command_dict["display_name"] = best_item_match
             canonical_item = self.synonym_map.get(best_item_match, best_item_match)
             if canonical_item != best_item_match:
                 command_dict["warnings"].append(f"Interpreting '{best_item_match}' as '{canonical_item}'.")
             singular_item = self.inflector.singular_noun(canonical_item)
             command_dict["item_key"] = singular_item if singular_item else canonical_item
        else:
            # Fallback for completely unknown items by removing numbers and known units
            fallback_item = re.sub(r'\d+', '', text_for_parsing).strip()
            for unit in self.unit_map.keys(): fallback_item = fallback_item.replace(unit, "")
            command_dict["display_name"] = fallback_item.strip()
            command_dict["item_key"] = fallback_item.strip()
            
        return command_dict

    def process_command(self, command: dict) -> str:
        # ... (This method remains the same)
        action, item_key, max_price = command.get("action"), command.get("item_key"), command.get("max_price")
        if action == "add" and item_key:
            return self.add_item(item_key, command.get("display_name"), command.get("quantity"), command.get("unit"))
        elif action == "remove" and item_key:
            return self.remove_item(item_key)
        elif action == "find" and item_key:
            return self.find_item(item_key)
        elif action == "find" and max_price:
            return self.find_items_by_price(max_price)
        elif action == "clear":
            return self.clear_list()
        elif action == "suggest":
            suggestions = self.get_suggestions()
            if suggestions: return f"🤔 You might need: {', '.join(suggestions)}"
            return "✨ No suggestions right now!"
        if not item_key and action in ["add", "remove", "find"]:
             return "⚠️ Please specify an item for this action."
        return "❓ Unrecognized command."

    # ... (The rest of the class methods: add_item, find_item, save_list, etc. remain the same)
    def add_item(self, item_key: str, display_name: str, quantity: int, unit: str) -> str:
        category = self.get_category(item_key)
        if category not in self.shopping_list: self.shopping_list[category] = {}
        quantity_str = f"{quantity} {unit}".strip()
        self.shopping_list[category][item_key.lower()] = {"display_name": display_name.capitalize(), "quantity": quantity_str}
        self.shopping_history[item_key.lower()] = self.shopping_history.get(item_key.lower(), 0) + 1
        self.save_list()
        message = f"✅ Added {quantity_str} {display_name.capitalize()} to {category}."
        substitutes = self.get_substitutes(item_key)
        if substitutes: message += f"<br>⚡ You could also try: {', '.join(substitutes)}."
        return message
        
    def find_items_by_price(self, max_price: float) -> str:
        found_items = [f"{item.capitalize()} (₹{price})" for item, price in self.mock_prices.items() if price <= max_price]
        if found_items: return f"🔍 Items under ₹{max_price}: {', '.join(found_items)}"
        return f"❓ No items found under ₹{max_price}."

    def remove_item(self, item_key: str) -> str:
        item_key_to_remove = item_key.lower()
        for category, items in self.shopping_list.items():
            if item_key_to_remove in items:
                display_name = items[item_key_to_remove]['display_name']
                del self.shopping_list[category][item_key_to_remove]
                if not self.shopping_list[category]: del self.shopping_list[category]
                self.save_list()
                return f"🗑️ Removed {display_name} from {category}."
        return f"⚠️ Item '{item_key}' not found in the list."

    def find_item(self, item_key: str) -> str:
        item_key_to_find = item_key.lower()
        for category, items in self.shopping_list.items():
            if item_key_to_find in items:
                data = items[item_key_to_find]
                return f"🔍 Found: {data['quantity']} {data['display_name']} (in {category})."
        return f"❓ Item '{item_key}' not in the shopping list."

    def clear_list(self) -> str:
        self.shopping_list.clear()
        self.save_list()
        return "🧹 Cleared the shopping list."
    
    def save_list(self):
        with open(self.filename, 'w') as f: json.dump({"shopping_list": self.shopping_list, "shopping_history": self.shopping_history}, f, indent=4)
    def load_list(self):
        try:
            with open(self.filename, 'r') as f: data = json.load(f)
            self.shopping_list = data.get("shopping_list", {})
            self.shopping_history = data.get("shopping_history", {})
        except (FileNotFoundError, json.JSONDecodeError): self.shopping_list, self.shopping_history = {}, {}
    def get_category(self, item_name: str) -> str:
        for keyword, category in self.category_map.items():
            if keyword in item_name.lower(): return category
        return "Miscellaneous"
    def get_substitutes(self, item_key: str) -> list:
        return self.substitutes.get(item_key.lower(), [])
    def get_seasonal_suggestions(self) -> list:
        current_month = datetime.datetime.now().month
        if 3 <= current_month <= 6: season = "summer"
        elif 7 <= current_month <= 9: season = "monsoon"
        else: season = "winter"
        seasonal_options = self.seasonal_items.get(season, [])
        current_items = {key for items in self.shopping_list.values() for key in items}
        return [item for item in seasonal_options if item not in current_items]
    def get_suggestions(self, count=5) -> list:
        current_items = {key for items in self.shopping_list.values() for key in items}
        sorted_history = sorted(self.shopping_history.items(), key=lambda item: item[1], reverse=True)
        history_suggestions = [item for item, freq in sorted_history if item not in current_items]
        seasonal_suggestions = self.get_seasonal_suggestions()
        combined = list(dict.fromkeys(history_suggestions + seasonal_suggestions))
        return combined[:count]

# --- Flask Web Application ---
app = Flask(__name__)
app.secret_key = 'a-random-secret-key-for-flashing'
assistant = ShoppingAssistant()

# ... (HTML Template and other Flask routes remain the same)
HTML_TEMPLATE = """
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🛒 Shopping Assistant</title>
<style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; background-color: #f9f9f9; }
    h1, h2, h3 { color: #333; }
    .container { background-color: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .message { border-left: 6px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px; background-color: #e7f3fe; }
    form { display: flex; gap: 10px; }
    input[type="text"] { flex-grow: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
    button { padding: 10px 15px; border: none; background-color: #2196F3; color: white; border-radius: 4px; cursor: pointer; font-size: 16px; }
    button#recordButton { background-color: #4CAF50; }
    button:disabled { background-color: #ccc; cursor: not-allowed; }
    h3 { border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 30px; }
    ul { list-style: none; padding-left: 0; }
    li { background: #f0f0f0; padding: 10px; border-radius: 4px; margin-bottom: 5px; }
    .suggestion-item a { text-decoration: none; color: #0d47a1; font-weight: bold; }
</style>
</head><body>
<div class="container">
    <h1>🛒 Voice Shopping Assistant</h1>
    {% with messages = get_flashed_messages() %}
        {% if messages %}
            <div class="message">{{ messages[0] | safe }}</div>
        {% endif %}
    {% endwith %}
    <form action="/command" method="post" id="commandForm">
        <input type="text" name="command" id="commandInput" placeholder="e.g., 'add 2 kg milk' or 'find under 50'" required>
        <button type="submit">Send</button>
        <button type="button" id="recordButton">🎤 Speak</button>
    </form>
    <form action="/suggest" method="post" style="margin-top:10px;">
        <button type="submit">💡 Get Suggestions</button>
    </form>
    <h2>Your Shopping List</h2>
    {% if shopping_list %}
        {% for category, items in shopping_list.items() | sort %}
            <h3>{{ category }}</h3>
            <ul>{% for item, data in items.items() %}<li>{{ data.display_name }} ({{ data.quantity }})</li>{% endfor %}</ul>
        {% endfor %}
    {% else %}<p>Your list is empty.</p>{% endif %}
    {% if suggestions %}
        <h3>✨ Smart Suggestions</h3>
        <ul>{% for item in suggestions %}<li class="suggestion-item"><a href="/add_suggestion?item={{ item }}">{{ item.capitalize() }}</a></li>{% endfor %}</ul>
    {% endif %}
</div>
<script>
    const recordButton = document.getElementById('recordButton');
    const commandInput = document.getElementById('commandInput');
    const commandForm = document.getElementById('commandForm');
    recordButton.onclick = async () => {
        recordButton.textContent = '🎙️ Listening...';
        recordButton.disabled = true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            let chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', blob);
                const response = await fetch('/recognize', { method: 'POST', body: formData });
                const result = await response.json();
                if (result.transcript) {
                    commandInput.value = result.transcript;
                    commandForm.submit();
                } else {
                    alert(result.error || 'Could not understand audio.');
                    recordButton.textContent = '🎤 Speak';
                    recordButton.disabled = false;
                }
            };
            recorder.start();
            setTimeout(() => { if(recorder.state === 'recording') recorder.stop(); }, 5000);
        } catch (e) {
            console.error(e);
            alert('Microphone access denied or an error occurred.');
            recordButton.textContent = '🎤 Speak';
            recordButton.disabled = false;
        }
    };
</script>
</body></html>
"""

@app.route('/', methods=['GET'])
def index():
    suggestions = session.pop('suggestions', None)
    return render_template_string(HTML_TEMPLATE, shopping_list=assistant.shopping_list, suggestions=suggestions)

@app.route('/command', methods=['POST'])
def handle_command():
    try:
        command_text = request.form['command']
        if command_text:
            action, item_details, warnings = assistant.normalize_command(command_text)
            command_data = assistant.parse_command(action, item_details)
            message = assistant.process_command(command_data)
            all_warnings = warnings + command_data.get("warnings", [])
            full_message = " ".join(all_warnings) + " " + message
            flash(full_message.strip())
    except Exception as e:
        flash(f"🚨 An error occurred: {str(e)}")
    return redirect(url_for('index'))

@app.route('/recognize', methods=['POST'])
def recognize_speech():
    try:
        if 'audio' not in request.files: return jsonify(error="No audio file found"), 400
        audio_file = request.files['audio']
        recognizer = sr.Recognizer()
        
        process = (ffmpeg.input('pipe:0', format='webm').output('pipe:1', format='wav').run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True))
        wav_data, _ = process.communicate(input=audio_file.read())

        with io.BytesIO(wav_data) as wav_buffer:
            with sr.AudioFile(wav_buffer) as source:
                audio_data = recognizer.record(source)
        
        transcript = recognizer.recognize_google(audio_data, language='en-IN')
        return jsonify(transcript=transcript)
    except sr.UnknownValueError:
        return jsonify(error="Could not understand audio. Please try again.")
    except Exception as e:
        return jsonify(error=f"Recognition error: {str(e)}"), 500

@app.route('/suggest', methods=['POST'])
def get_suggestions_route():
    session['suggestions'] = assistant.get_suggestions()
    return redirect(url_for('index'))

@app.route('/add_suggestion')
def add_suggestion():
    try:
        item_name = request.args.get('item', '')
        if item_name:
            message = assistant.add_item(item_name, item_name, 1, '')
            flash(message)
    except Exception as e:
        flash(f"🚨 Error adding suggestion: {str(e)}")
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))