require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config_db');

const bookingsRouter = require('./routes/bookings');
const weatherRouter = require('./routes/weather');

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- Healthcheck route ---
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Vaiu Restaurant Booking Voice Agent API'
  });
});

// --- API routes ---
app.use('/api/bookings', bookingsRouter);
app.use('/api/weather', weatherRouter);

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Unexpected server error.' });
});

// --- Start server after DB connection ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vaiu_voice_booking';

(async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
})();
