// Simple MongoDB connection helper using Mongoose
const mongoose = require('mongoose');

async function connectDB(mongoUri) {
  try {
    await mongoose.connect(mongoUri, {
      // useNewUrlParser & useUnifiedTopology are default true in latest mongoose
    });
    console.log(' MongoDB connected');
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
