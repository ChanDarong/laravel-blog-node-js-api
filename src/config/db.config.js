const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.DATABASE_URL;
const dbName = process.env.DATABASE_NAME || 'blog_api';

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      dbName: dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB using Mongoose');
    return mongoose.connection;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

module.exports = { connectDB, mongoose };