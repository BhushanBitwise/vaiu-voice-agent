import React from "react";
import VoiceBookingAgent from "./components/VoiceBookingAgent";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-violet-950 text-slate-50 font-sans">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-semibold tracking-tight">
              Vaiu <span className="text-violet-400">AI Restaurant Agent</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Voice-powered table booking with weather-aware seating suggestions
            </p>
          </div>
          <span className="hidden md:inline-flex text-xs px-3 py-1 rounded-full bg-violet-500/15 text-violet-200 border border-violet-400/40">
            Internship Assignment · MERN + AI
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <VoiceBookingAgent />
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/90">
        <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2025 BhushanBitwise · Built for Vaiu AI SDE Intern Assignment</span>
          <span>Stack: React · Node · MongoDB · OpenWeather · Web Speech API</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
