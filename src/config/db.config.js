const mongoose = require('mongoose');

// MongoDB connection cache for serverless environment
let cachedDb = null;

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // If we already have a connection, use it
    if (cachedDb) {
      console.log('Using cached MongoDB connection');
      return cachedDb;
    }

    // Set mongoose options for better serverless performance
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DATABASE_NAME,
      // Add these options for better performance in serverless environments
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('Connected to MongoDB using Mongoose');
    cachedDb = mongoose.connection;
    return cachedDb;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Don't exit process immediately in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw err;
  }
};

module.exports = { connectDB };