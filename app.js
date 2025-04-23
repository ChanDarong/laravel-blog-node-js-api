const express = require('express');
require('dotenv').config();
const { connectDB } = require('./src/config/db.config');

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files correctly
app.use('/public/uploads', express.static('public/uploads'));

// Connect to database and set up routes
async function initializeApp() {
  try {
    await connectDB();
    
    // Set up global baseUrl for model transforms
    app.use((req, res, next) => {
      // Force HTTPS for production environment
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
      global.baseUrl = `${protocol}://${req.get('host')}`;
      next();
    });
    
    // Import and register routes
    const routes = require('./src/routes')();
    app.use('/api', routes);

    // Simple home route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Blog API',
        version: process.env.API_VERSION 
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

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
}

initializeApp();

// Export the app (useful for testing or if using this file as a module)
module.exports = app;