const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./src/config/db.config');

// Detect if running on Vercel
const isVercel = process.env.VERCEL || process.env.NOW_REGION;
if (isVercel) {
  process.env.VERCEL = '1';
  console.log('Running in Vercel environment');
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static files correctly
app.use('/public/uploads', express.static('public/uploads'));

// For serverless environments like Vercel, we want to establish the database
// connection with each request rather than just once at startup
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    return res.status(500).json({ 
      message: 'Database connection error', 
      error: process.env.NODE_ENV === 'development' ? error.message : {} 
    });
  }
});

// Set up global baseUrl for model transforms
app.use((req, res, next) => {
  // Force HTTPS for production environment
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  if (process.env.NODE_ENV === 'local') {
    global.baseUrl = `http://${req.get('host')}`;
  } else {
    global.baseUrl = `${protocol}://${req.get('host')}`;
  }
  next();
  global.fileUrl = global.baseUrl;
  if (process.env.VERCEL == '1') {
    global.fileUrl = 'https://852vat8eczkxtknb.public.blob.vercel-storage.com'
  }
});

// Import and register routes
const routes = require('./src/routes')();
app.use('/api', routes);

// Simple home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Blog API',
    version: process.env.API_VERSION || 'v1',
    env: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Only start the server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // Connect once on startup for non-serverless environments
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }).catch(error => {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  });
}

// Export the app (useful for testing or if using this file as a module)
module.exports = app;