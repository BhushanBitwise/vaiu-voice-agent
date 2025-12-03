const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Utility to generate a human-readable bookingId
function generateBookingId() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `BK-${timestamp}-${random}`;
}

/**
 * @route   POST /api/bookings
 * @desc    Create a new restaurant booking
 * @access  Public (for assignment)
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      specialRequests,
      location,
      weatherInfo,
      seatingPreference,
      status
    } = req.body;

    if (!customerName || !numberOfGuests || !bookingDate || !bookingTime || !cuisinePreference || !location) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const booking = new Booking({
      bookingId: generateBookingId(),
      customerName,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      specialRequests,
      location,
      weatherInfo,
      seatingPreference,
      status
    });

    const saved = await booking.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by Mongo _id or bookingId
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let booking = await Booking.findById(id);
    if (!booking) {
      booking = await Booking.findOne({ bookingId: id });
    }
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    return res.json(booking);
  } catch (err) {
    console.error('Error fetching booking:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel (delete) a booking
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let booking = await Booking.findById(id);
    if (!booking) {
      booking = await Booking.findOne({ bookingId: id });
    }
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
