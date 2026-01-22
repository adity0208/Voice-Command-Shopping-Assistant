# app.py
import re
import json
import os
import datetime
import inflect
import io
from rapidfuzz import fuzz, process
from flask import Flask, request, jsonify
from flask_cors import CORS
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
        
        self.all_action_keywords = [keyword for sublist in self.action_phrases.values() for keyword in sublist]
        self.all_known_items = set(self.category_map.keys()) | set(self.synonym_map.keys()) | set(self.hindi_item_map.values())

        self.load_list()

    def normalize_command(self, input_str: str) -> tuple[str, str, list]:
        """
        Determines intent (action) and cleans the string of keywords.
        Returns (action, item_details, warnings).
        """
        warnings = []
        s = input_str.lower().strip()
        action = "add" 

        for act, phrases in self.action_phrases.items():
            for ph in phrases:
                if ph in s:
                    action = act
                    break
            if action != "add": break

        item_details = s
        for keyword in self.all_action_keywords:
            item_details = item_details.replace(keyword, " ")
        
        item_details = re.sub(r"\b(mujhe|list se|from list|please|under|below|rupees)\b", " ", item_details)
        item_details = re.sub(r"\s+", " ", item_details).strip()
        
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
            fallback_item = re.sub(r'\d+', '', text_for_parsing).strip()
            for unit in self.unit_map.keys(): fallback_item = fallback_item.replace(unit, "")
            command_dict["display_name"] = fallback_item.strip()
            command_dict["item_key"] = fallback_item.strip()
            
        return command_dict

    def process_command(self, command: dict) -> dict:
        """
        Executes the command and returns a response dict with message and updated data.
        """
        action, item_key, max_price = command.get("action"), command.get("item_key"), command.get("max_price")
        
        response = {"status": "success", "message": "", "data": {}}

        if action == "add" and item_key:
            response["message"] = self.add_item(item_key, command.get("display_name"), command.get("quantity"), command.get("unit"))
        elif action == "remove" and item_key:
            response["message"] = self.remove_item(item_key)
        elif action == "find" and item_key:
            response["message"] = self.find_item(item_key)
        elif action == "find" and max_price:
            response["message"] = self.find_items_by_price(max_price)
        elif action == "clear":
            response["message"] = self.clear_list()
        elif action == "suggest":
            suggestions = self.get_suggestions()
            if suggestions: 
                response["message"] = "Here are some suggestions."
                response["data"]["suggestions"] = suggestions
            else:
                response["message"] = "No suggestions right now!"
        elif not item_key and action in ["add", "remove", "find"]:
             response["status"] = "error"
             response["message"] = "Please specify an item for this action."
        else:
            response["status"] = "error"
            response["message"] = "Unrecognized command."
            
        return response

    def add_item(self, item_key: str, display_name: str, quantity: int, unit: str) -> str:
        category = self.get_category(item_key)
        if category not in self.shopping_list: self.shopping_list[category] = {}
        quantity_str = f"{quantity} {unit}".strip()
        self.shopping_list[category][item_key.lower()] = {"display_name": display_name.capitalize(), "quantity": quantity_str}
        self.shopping_history[item_key.lower()] = self.shopping_history.get(item_key.lower(), 0) + 1
        self.save_list()
        message = f"Added {quantity_str} {display_name.capitalize()} to {category}."
        substitutes = self.get_substitutes(item_key)
        if substitutes: message += f" (Try also: {', '.join(substitutes)})"
        return message

    def remove_item(self, item_key: str) -> str:
        item_key_to_remove = item_key.lower()
        for category, items in self.shopping_list.items():
            if item_key_to_remove in items:
                display_name = items[item_key_to_remove]['display_name']
                del self.shopping_list[category][item_key_to_remove]
                if not self.shopping_list[category]: del self.shopping_list[category]
                self.save_list()
                return f"Removed {display_name} from {category}."
        return f"Item '{item_key}' not found in the list."

    def find_items_by_price(self, max_price: float) -> str:
        found_items = [f"{item.capitalize()} (₹{price})" for item, price in self.mock_prices.items() if price <= max_price]
        if found_items: return f"Items under ₹{max_price}: {', '.join(found_items)}"
        return f"No items found under ₹{max_price}."

    def find_item(self, item_key: str) -> str:
        item_key_to_find = item_key.lower()
        for category, items in self.shopping_list.items():
            if item_key_to_find in items:
                data = items[item_key_to_find]
                return f"Found: {data['quantity']} {data['display_name']} (in {category})."
        return f"Item '{item_key}' not in the shopping list."

    def clear_list(self) -> str:
        self.shopping_list.clear()
        self.save_list()
        return "Cleared the shopping list."
    
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


# --- Flask Application ---
app = Flask(__name__)
# Enable CORS for all routes, allowing requests from localhost:3000 or the Vite default port 5173
CORS(app, resources={r"/*": {"origins": "*"}}) 

assistant = ShoppingAssistant()

@app.route('/api/shopping-list', methods=['GET'])
def get_list():
    """Returns the current shopping list."""
    return jsonify(assistant.shopping_list)

@app.route('/api/command', methods=['POST'])
def handle_command():
    """Handles text commands."""
    try:
        data = request.get_json()
        command_text = data.get('command')
        
        if not command_text:
            return jsonify({"status": "error", "message": "No command provided"}), 400

        action, item_details, warnings = assistant.normalize_command(command_text)
        command_data = assistant.parse_command(action, item_details)
        result = assistant.process_command(command_data)
        
        # Merge warnings
        all_warnings = warnings + command_data.get("warnings", [])
        
        return jsonify({
            "status": result["status"],
            "message": result["message"],
            "warnings": all_warnings,
            "shopping_list": assistant.shopping_list, # Return updated list for optimistic UI update confirmation
            "data": result.get("data", {})
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/recognize', methods=['POST'])
def recognize_speech():
    """Handles audio file uploads for speech recognition."""
    import shutil
    try:
        # Check for FFmpeg dependency
        if not shutil.which("ffmpeg"):
            print("🚨 ERROR: FFmpeg is not installed or not in the system PATH.")
            return jsonify({
                "status": "error", 
                "message": "Server Configuration Error: FFmpeg is missing. Please install FFmpeg to use voice features."
            }), 500

        if 'audio' not in request.files:
            return jsonify({"status": "error", "message": "No audio file found"}), 400
            
        audio_file = request.files['audio']
        recognizer = sr.Recognizer()
        
        # Convert audio to wav in-memory using ffmpeg
        try:
            print("Processing audio with FFmpeg...")
            process = (ffmpeg.input('pipe:0', format='webm')
                       .output('pipe:1', format='wav')
                       .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True))
            wav_data, stderr = process.communicate(input=audio_file.read())
            
            if process.returncode != 0:
                print(f"FFmpeg Error: {stderr.decode()}")
                return jsonify({"status": "error", "message": "Audio conversion failed."}), 500
                
        except ffmpeg.Error as e:
             print(f"FFmpeg Exception: {str(e)}")
             return jsonify({"status": "error", "message": "Audio conversion failed. Ensure ffmpeg is installed."}), 500

        with io.BytesIO(wav_data) as wav_buffer:
            with sr.AudioFile(wav_buffer) as source:
                audio_data = recognizer.record(source)
        
        # Recognize speech (English - India)
        transcript = recognizer.recognize_google(audio_data, language='en-IN')
        print(f"Transcript: {transcript}")
        return jsonify({"status": "success", "transcript": transcript})
        
    except sr.UnknownValueError:
        return jsonify({"status": "error", "message": "Could not understand audio. Please try again."}), 400
    except Exception as e:
        print(f"General Error in /recognize: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": f"Recognition error: {str(e)}"}), 500

@app.route('/api/suggest', methods=['GET'])
def get_suggestions_route():
    """Returns a list of suggestions."""
    suggestions = assistant.get_suggestions()
    return jsonify({"suggestions": suggestions})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=True)