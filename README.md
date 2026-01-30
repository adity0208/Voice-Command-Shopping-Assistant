# 🎙️ Voice-Command Shopping List Assistant

![Project Banner](client/src/constants/banner_placeholder.png) <!-- Ideally placeholder or remove if no image -->

A **mobile-first** voice-controlled shopping list utility designed for quick, natural interactions. It excels at capturing grocery lists spoken in **Hinglish** (Hindi + English) with support for Indian measurement units, making it perfect for digitizing parental voice instructions.

## ✨ Key Features

- **🗣️ Voice-First Input**: Just tap and speak naturally. *"Add 2kg potatoes, adha kilo pyaaz and 1 packet milk"*
- **🇮🇳 Hindi Measurement Support**: Understands phonetic Hindi quantities like:
    - *"Pau"* (0.25)
    - *"Aadha"* (0.5)
    - *"Pauna"* (0.75)
    - *"Sawa"* (1.25)
    - *"Dedh"* (1.5)
    - *"Dhai"* (2.5)
    - *"Saadhe"* logic (e.g., *"Saadhe teen"* -> 3.5)
- **📝 Real-time Transcription**: See exactly what the assistant heard with "Heard: ..." context for every item.
- **📱 Mobile-First Design**: Optimized for smartphones with:
    - **Bottom Sheet Cart**: Slide-up access to your list.
    - **Safe Area Support**: Respects notch and gesture bar areas on iPhone/Android.
    - **Touch-Friendly UI**: Large buttons (44px+) and responsive grids.
- **� WhatsApp Integration**: Share your compiled list directly to WhatsApp with a single tap.
- **➕ Custom Items**: Manually add items that aren't in the voice catalog.
- **🎨 Modern UI**: Sleek Glassmorphism design with Dark Mode support.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (Mobile-Optimized)
- **Backend**: Python, Flask, Google Speech Recognition
- **Audio Processing**: FFmpeg, rapidfuzz (fuzzy matching), inflect
- **Storage**: JSON-based persistent storage for lists and history

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- FFmpeg (Must be in System PATH)

### 1. Backend Setup (Python)
```bash
# In the root directory
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*Server runs on http://localhost:8080*

### 2. Frontend Setup (React)
```bash
cd client
npm install
npm run dev
```
*App runs on http://localhost:5173 (or your local IP for mobile testing)*

## 🗣️ Voice Commands to Try

- **Standard**: "Add 5 apples and 2 cartons of milk"
- **Hindi Units**: "Ek pau adrak aur dedh kilo aalu likho"
- **Complex**: "Paanch kilo aatta, do litre tel, aur aadha kilo chini"
- **List Management**: "Remove the eggs", "Clear my list", "Show suggestions"

## 📂 Project Structure

- **/client**: React frontend code.
  - `src/components`: UI Components (ProductCard, CartDrawer, TranscriptionHeader).
  - `src/App.jsx`: Main application logic.
- **/server** (Root): Flask backend code.
  - `app.py`: Main logic for NLP, Hindi parsing, and List management.
  - `shopping_list.json`: Persistent storage.

---
*Built for the [Voice-Command Shopping Assistant] Project*
