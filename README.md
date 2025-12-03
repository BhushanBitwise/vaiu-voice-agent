# Vaiu AI Voice Restaurant Booking Agent (MERN + AI)

This project is a **voice-enabled restaurant booking agent** built using the **MERN stack** with an **AI-style conversational UI**.

User simply talks to the agent:

- Agent asks step-by-step questions (name, guests, date, time, cuisine etc.)
- Uses **Web Speech API** for **speech-to-text (STT)** and **text-to-speech (TTS)**
- Checks weather for the booking location using **OpenWeatherMap**
- Suggests **indoor/outdoor seating** based on weather
- Stores booking in **MongoDB**
- Shows recent bookings in a professional dashboard-style UI

> 🔥 This project is built as per **Vaiu AI Software Developer Internship Assignment** requirements:  
> full-stack (MERN) + voice + external API integrations + clean code + production-ready structure.

---

## 1. Tech Stack

### Frontend
- **React** (Vite or CRA based)
- **Tailwind CSS** for modern, responsive UI
- **Web Speech API**
  - `SpeechRecognition` → converts user speech to text
  - `SpeechSynthesis` → agent speaks responses back

### Backend
- **Node.js + Express**
- **MongoDB + Mongoose** (for booking storage)
- REST APIs:
  - `POST /api/bookings`
  - `GET /api/bookings`
  - `GET /api/weather`

### External Services
- **OpenWeatherMap API**
  - Used to get weather forecast for a given city + date
  - Backend decides seating suggestion (indoor / outdoor) using this

---

## 2. High-Level Architecture

```text
[User Voice]
     ⬇
[Browser] 
  - Web Speech API (STT + TTS)
  - React + Tailwind UI
  - VoiceBookingAgent component
     ⬇
[Backend API - Express]
  - /api/bookings (MongoDB CRUD)
  - /api/weather (OpenWeatherMap)
     ⬇
[MongoDB] & [OpenWeatherMap]
