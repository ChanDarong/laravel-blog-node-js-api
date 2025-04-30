const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Remove the deprecated options
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DATABASE_NAME
    });
    console.log('Connected to MongoDB using Mongoose');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };