const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * @route   GET /api/weather
 * @desc    Get weather forecast for a given date and location using OpenWeatherMap
 * @query   date (ISO string), location (city name, e.g. "Mumbai,IN")
 * @access  Public
 */
router.get('/', async (req, res) => {
  const { date, location } = req.query;

  if (!date || !location) {
    return res.status(400).json({ message: 'date and location are required query params.' });
  }

  const targetDate = new Date(date);
  if (Number.isNaN(targetDate.getTime())) {
    return res.status(400).json({ message: 'Invalid date format.' });
  }

  const apiKey = process.env.WEATHER_API_KEY;
  const baseUrl = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';

  if (!apiKey) {
    return res.status(500).json({ message: 'Weather API key not configured on server.' });
  }

  try {
    // For simplicity we use 5-day/3-hour forecast endpoint
    const url = `${baseUrl}/forecast`;
    const response = await axios.get(url, {
      params: {
        q: location,
        appid: apiKey,
        units: 'metric'
      }
    });

    const forecasts = response.data.list || [];

    // Find forecast closest to noon of target date
    const targetMidday = new Date(targetDate);
    targetMidday.setHours(12, 0, 0, 0);

    let best = null;
    let bestDiff = Infinity;

    for (const entry of forecasts) {
      const ts = new Date(entry.dt * 1000);
      const diff = Math.abs(ts - targetMidday);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = entry;
      }
    }

    if (!best) {
      return res.status(404).json({ message: 'No forecast data available for the given date.' });
    }

    const mainWeather = best.weather && best.weather[0] ? best.weather[0] : {};
    const temp = best.main ? best.main.temp : null;

    // Simple condition mapping (sunny/rainy/other)
    let condition = 'other';
    const description = (mainWeather.description || '').toLowerCase();
    if (description.includes('sun') || description.includes('clear')) {
      condition = 'sunny';
    } else if (description.includes('rain') || description.includes('storm')) {
      condition = 'rainy';
    }

    const weatherInfo = {
      raw: best,
      condition,
      description: mainWeather.description || 'N/A',
      temperature: temp
    };

    // Seating suggestion based on condition
    let seatingSuggestion = 'indoor';
    let suggestionText = 'I recommend indoor seating.';

    if (condition === 'sunny') {
      seatingSuggestion = 'outdoor';
      suggestionText = 'The weather looks great! Outdoor seating should be perfect.';
    } else if (condition === 'rainy') {
      seatingSuggestion = 'indoor';
      suggestionText = 'It might rain. Indoor seating would be more comfortable.';
    }

    return res.json({
      weatherInfo,
      seatingSuggestion,
      suggestionText
    });
  } catch (err) {
    console.error('Error fetching weather:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to fetch weather data.' });
  }
});

module.exports = router;
