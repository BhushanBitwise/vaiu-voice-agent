import React, { useEffect, useRef, useState, useMemo } from "react";
import { createBooking, getAllBookings, getWeather } from "../api";
import BookingSummary from "./BookingSummary";

/**
 * Step-wise questions for voice flow
 */
const QUESTIONS = [
  { key: "customerName", prompt: "What is your name?" },
  { key: "numberOfGuests", prompt: "How many guests are you booking for?" },
  {
    key: "bookingDate",
    prompt:
      "On which date would you like to book the table? For example, say 25 December 2025.",
  },
  { key: "bookingTime", prompt: "At what time should I book the table?" },
  {
    key: "cuisinePreference",
    prompt:
      "What type of cuisine do you prefer? Indian, Italian or Chinese?",
  },
  {
    key: "specialRequests",
    prompt:
      "Any special requests such as birthday celebration or dietary restrictions?",
  },
  {
    key: "location",
    prompt: "Which city are you in? I will check the weather for that location.",
  },
];

const VoiceBookingAgent = () => {
  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    numberOfGuests: "",
    bookingDate: "",
    bookingTime: "",
    cuisinePreference: "",
    specialRequests: "",
    location: "",
    seatingPreference: "unspecified",
    weatherInfo: null,
  });
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const recognitionRef = useRef(null);

  const lastLogTs = useMemo(
    () => (logs.length ? logs[logs.length - 1].ts : null),
    [logs]
  );

  const pushLog = (tag, message) =>
    setLogs((prev) => [...prev, { tag, message, ts: Date.now() }]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    window.speechSynthesis.speak(u);
    pushLog("agent", text);
  };

  // Init SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupportsSpeech(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListening(true);
      pushLog("system", "Listening…");
    };

    rec.onerror = (e) => {
      pushLog("system", `Speech error: ${e.error}`);
      setIsListening(false);
    };

    rec.onend = () => setIsListening(false);

    // IMPORTANT: stop recognition before processing result
    rec.onresult = (event) => {
      const text = event.results[0][0].transcript.trim();
      rec.stop();
      pushLog("user", text);

      setTimeout(() => {
        handleAnswer(text);
      }, 300);
    };

    recognitionRef.current = rec;
    setSupportsSpeech(true);
  }, []);

  // Load existing bookings
  useEffect(() => {
    (async () => {
      try {
        const list = await getAllBookings();
        setBookings(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Whenever question index changes → speak the question / fetch weather
  useEffect(() => {
    if (currentQuestionIndex < 0) return;

    if (currentQuestionIndex < QUESTIONS.length) {
      const q = QUESTIONS[currentQuestionIndex];
      speak(q.prompt);
    } else if (currentQuestionIndex === QUESTIONS.length) {
      handleWeatherAndSuggestion();
    }
  }, [currentQuestionIndex]);

  const startConversation = () => {
    setError("");
    setStatus("");
    setLogs([]);
    setForm({
      customerName: "",
      numberOfGuests: "",
      bookingDate: "",
      bookingTime: "",
      cuisinePreference: "",
      specialRequests: "",
      location: "",
      seatingPreference: "unspecified",
      weatherInfo: null,
    });

    speak("Hello! I am your AI assistant. I will help you book a table.");
    setCurrentQuestionIndex(0);
  };

  const startListening = () => recognitionRef.current?.start();
  const stopListening = () => recognitionRef.current?.stop();

  const handleAnswer = (rawText) => {
    const index = currentQuestionIndex;
    if (index < 0 || index >= QUESTIONS.length) return;

    const key = QUESTIONS[index].key;
    let value = rawText.trim();

    if (key === "customerName") {
      value = value
        .replace(/my name is/i, "")
        .replace(/this is/i, "")
        .replace(/i am/i, "")
        .replace(/mera naam/i, "")
        .trim()
        .replace(/[^a-zA-Z ]/g, "");
      value = value.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    if (key === "numberOfGuests") {
      const num = parseInt(value.match(/\d+/)?.[0] || "1", 10);
      value = String(num);
    }

    setForm((prev) => ({ ...prev, [key]: value }));

    setTimeout(() => {
      setCurrentQuestionIndex((prev) => prev + 1);
    }, 300);
  };

  const handleWeatherAndSuggestion = async () => {
    try {
      if (!form.bookingDate || !form.location) {
        speak(
          "Some details like date or city are missing. Please fill them and then save the booking."
        );
        setStatus("Fill missing fields and save manually.");
        return;
      }

      setStatus("Fetching weather…");
      const dateISO = new Date(form.bookingDate).toISOString();
      const w = await getWeather(dateISO, form.location);

      setForm((prev) => ({
        ...prev,
        weatherInfo: w.weatherInfo,
        seatingPreference: w.seatingSuggestion || "unspecified",
      }));

      speak(w.suggestionText);
      speak("You can now review details and hit save booking.");
      setStatus("Weather fetched, suggestion applied.");
    } catch (err) {
      console.error(err);
      setError("Weather fetch failed. You can still save the booking.");
      speak(
        "I could not fetch the weather. You can still review details and save the booking."
      );
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBooking = async () => {
    setError("");
    setStatus("");
    setIsSaving(true);
    try {
      const payload = {
        customerName: form.customerName,
        numberOfGuests: Number(form.numberOfGuests || 1),
        bookingDate: form.bookingDate
          ? new Date(form.bookingDate).toISOString()
          : null,
        bookingTime: form.bookingTime,
        cuisinePreference: form.cuisinePreference,
        specialRequests: form.specialRequests,
        location: form.location,
        seatingPreference: form.seatingPreference,
        weatherInfo: form.weatherInfo,
        status: "confirmed",
      };

      const created = await createBooking(payload);
      speak(
        `Your table is booked, ${created.customerName}. Your booking ID is ${created.bookingId}.`
      );
      setStatus("Booking created.");

      const list = await getAllBookings();
      setBookings(list);
    } catch (err) {
      console.error(err);
      setError("Failed to create booking.");
    } finally {
      setIsSaving(false);
    }
  };

  const statusLabel =
    status ||
    (supportsSpeech
      ? "Ready for voice booking."
      : "Voice not available. Use the form.");

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)]">
      {/* LEFT: AI Voice Agent Panel */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-500/40 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 p-6 shadow-[0_0_45px_rgba(139,92,246,0.65)]">
        {/* Gradient blobs */}
        <div className="pointer-events-none absolute -top-32 -left-20 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />

        <div className="relative flex items-start gap-4">
          {/* AI Avatar */}
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/50">
            🤖
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-50">
              Restaurant Voice Agent
            </h2>
            <p className="text-xs md:text-sm text-slate-300/80">
              Talk with your AI assistant to book tables, check weather and set
              seating preferences.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="relative mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startConversation}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/40 hover:from-violet-400 hover:to-indigo-400 transition"
          >
            🎙 Start Voice Booking
          </button>

          {supportsSpeech && (
            <>
              <button
                type="button"
                onClick={startListening}
                disabled={isListening}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 hover:bg-emerald-400 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white shadow-md shadow-emerald-500/40 transition"
              >
                ⏺ Listen
              </button>

              <button
                type="button"
                onClick={stopListening}
                disabled={!isListening}
                className="inline-flex items-center gap-2 rounded-full bg-slate-800/90 hover:bg-slate-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-slate-100"
              >
                ⏹ Stop
              </button>
            </>
          )}

          {!supportsSpeech && (
            <span className="text-[11px] md:text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-200 border border-amber-400/40">
              Web Speech API not supported in this browser.
            </span>
          )}
        </div>

        {/* Status */}
        <div className="relative mt-4 flex items-center justify-between text-[11px] md:text-xs text-slate-300">
          <span>
            <span className="inline-flex items-center rounded-full bg-slate-900/70 px-2 py-0.5 mr-2 text-[10px] uppercase tracking-wide text-slate-200">
              Status
            </span>
            {statusLabel}
          </span>
          {lastLogTs && (
            <span className="text-slate-400">
              Last interaction{" "}
              {new Date(lastLogTs).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
        </div>

        {error && (
          <p className="relative mt-3 text-[11px] md:text-xs text-rose-200 bg-rose-500/15 border border-rose-400/50 px-3 py-2 rounded-2xl">
            ⚠ {error}
          </p>
        )}

        {status && !error && (
          <p className="relative mt-3 text-[11px] md:text-xs text-emerald-200 bg-emerald-500/15 border border-emerald-400/50 px-3 py-2 rounded-2xl">
            ✓ {status}
          </p>
        )}

        {/* Logs */}
        <div className="relative mt-4 bg-slate-950/60 border border-violet-500/40 rounded-2xl p-3 md:p-4 font-mono text-[11px] md:text-xs text-slate-100 max-h-56 overflow-auto log-scroll">
          {logs.length === 0 && (
            <div className="text-slate-500">
              [SYSTEM] Conversation log will appear here.
            </div>
          )}

          {logs.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap">
              <span className="font-semibold text-violet-300">
                [{log.tag.toUpperCase()}]
              </span>{" "}
              {log.message}
            </div>
          ))}
        </div>
      </section>

      {/* RIGHT: Form + Bookings */}
      <section className="flex flex-col gap-5">
        {/* Booking Form Card */}
        <div className="rounded-3xl bg-slate-950/90 border border-slate-800/80 shadow-[0_22px_40px_rgba(15,23,42,0.9)] p-5 md:p-6">
          <h2 className="text-base md:text-lg font-semibold mb-1 text-slate-50">
            Booking Details
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mb-4">
            Voice se auto-fill hoga, but you can always edit fields manually.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="field-label">Name</label>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleFieldChange}
                className="field-input"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="field-label">Guests</label>
              <input
                name="numberOfGuests"
                value={form.numberOfGuests}
                onChange={handleFieldChange}
                className="field-input"
                placeholder="2"
                type="number"
                min="1"
              />
            </div>

            <div>
              <label className="field-label">Date</label>
              <input
                name="bookingDate"
                type="date"
                value={form.bookingDate}
                onChange={handleFieldChange}
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label">Time</label>
              <input
                name="bookingTime"
                value={form.bookingTime}
                onChange={handleFieldChange}
                className="field-input"
                placeholder="19:30"
              />
            </div>

            <div>
              <label className="field-label">Cuisine Preference</label>
              <input
                name="cuisinePreference"
                value={form.cuisinePreference}
                onChange={handleFieldChange}
                className="field-input"
                placeholder="Indian / Italian / Chinese"
              />
            </div>

            <div>
              <label className="field-label">City / Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleFieldChange}
                className="field-input"
                placeholder="Mumbai,IN"
              />
            </div>

            <div>
              <label className="field-label">Seating Preference</label>
              <select
                name="seatingPreference"
                value={form.seatingPreference}
                onChange={handleFieldChange}
                className="field-input bg-slate-900"
              >
                <option value="unspecified">Let AI decide</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="field-label">Special Requests</label>
              <textarea
                name="specialRequests"
                value={form.specialRequests}
                onChange={handleFieldChange}
                rows={3}
                className="field-input resize-y"
                placeholder="Birthday, anniversary, dietary restrictions..."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="button"
              onClick={handleSaveBooking}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white shadow-md shadow-violet-500/40 transition"
            >
              💾 Save Booking
            </button>

            <button
              type="button"
              onClick={async () => {
                const list = await getAllBookings();
                setBookings(list);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100"
            >
              🔄 Refresh Bookings
            </button>
          </div>
        </div>

        {/* Bookings List Card */}
        <div className="rounded-3xl bg-slate-950/90 border border-slate-800/80 shadow-[0_22px_40px_rgba(15,23,42,0.9)] p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-semibold text-slate-50">
              Recent Bookings
            </h2>
            <span className="text-xs text-slate-400">
              {bookings.length || 0} records
            </span>
          </div>

          {bookings.length === 0 && (
            <p className="text-sm text-slate-500">
              No bookings yet. Use voice or form to create one.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <BookingSummary key={b._id} booking={b} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VoiceBookingAgent;
