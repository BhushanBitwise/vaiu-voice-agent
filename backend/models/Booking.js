const mongoose = require('mongoose');

const WeatherInfoSchema = new mongoose.Schema(
  {
    raw: { type: Object }, // store full response for debugging/analytics
    condition: { type: String },
    description: { type: String },
    temperature: { type: Number }, // in Celsius
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1
    },
    bookingDate: {
      type: Date,
      required: true
    },
    bookingTime: {
      type: String,
      required: true,
      trim: true
    },
    cuisinePreference: {
      type: String,
      required: true,
      trim: true
    },
    specialRequests: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    weatherInfo: {
      type: WeatherInfoSchema,
      default: null
    },
    seatingPreference: {
      type: String,
      enum: ['indoor', 'outdoor', 'unspecified'],
      default: 'unspecified'
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'confirmed'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', BookingSchema);
