import React from "react";

const BookingSummary = ({ booking }) => {
  if (!booking) return null;

  const date = new Date(booking.bookingDate);
  const dateLabel = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
          {booking.status || "confirmed"}
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          {booking.bookingId}
        </span>
      </div>

      <div className="mt-1 font-semibold text-slate-700">
        {booking.customerName} · {booking.numberOfGuests} guests
      </div>

      <div className="text-sm text-slate-500">
        {dateLabel} · {booking.cuisinePreference} · {booking.location}
      </div>

      {booking.weatherInfo && (
        <div className="text-xs text-blue-600 mt-1">
          Weather: {booking.weatherInfo.description} (
          {booking.weatherInfo.temperature}°C)
        </div>
      )}

      {booking.specialRequests && (
        <div className="text-xs text-purple-600 mt-1">
          Special: {booking.specialRequests}
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
