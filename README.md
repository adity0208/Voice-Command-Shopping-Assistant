# 🎙️ Voice-Command Shopping Assistant

![Project Banner](client/src/constants/banner_placeholder.png) <!-- Ideally placeholder or remove if no image -->

A futuristic **Quick Commerce** application that lets you shop using natural language voice commands. Built with a modern **React** frontend and a powerful **Python/Flask** backend for speech processing.

## ✨ Features

- **🗣️ Voice-First Shopping**: Just say *"Add 5 apples and 2 cartons of milk"* or *"Remove the spicy chips"*.
- **🛒 Smart Cart**: Real-time updates as you speak. The assistant understands quantity, units, and Hindi/English mix (*"Ek kilo aalu add karo"*).
- **🎨 Quick Commerce Design**: sleek **White & Orange** aesthetics inspired by modern delivery apps (Blinkit/Zepto).
- **📦 Visual Catalog**: Integrated Unsplash images for a rich browsing experience.
- **🛡️ Noise Gate**: Smart audio filtering prevents accidental commands from background noise.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Python, Flask, Species Recognition (Google API), FFmpeg
- **Audio**: Web Audio API, MediaRecorder

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- FFmpeg (System PATH)

### 1. Backend Setup (Python)
```bash
cd server
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
*App runs on http://localhost:5173*

## 🗣️ Voice Commands to Try
- **Add Items**: "I need 2 packets of bread and 1 amul butter"
- **Remove Items**: "Remove the eggs"
- **Clear List**: "Clear my entire list"
- **Natural Language**: "Daal do 5 kilo aatta aur 2 litre doodh"

## 📂 Project Structure
- **/client**: React frontend code.
  - `src/components`: UI Components (VoiceWave, ProductCard).
  - `src/hooks`: Custom hooks for interactions.
- **/server**: Flask backend code.
  - `app.py`: Main logic for NLP and Shopping List management.

---
*Built with ❤️ by [Your Name]*
