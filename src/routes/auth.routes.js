const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const uploaders = require('../middleware/upload')

module.exports = (authController) => {
  // Register a new user
  router.post('/register', authController.register);
  
  // Login user
  router.post('/login', authController.login);

  // Logout user (protected route)
  router.post('/logout', auth, authController.logout);
  
  // Get current user's profile (protected route)
  router.get('/profile', auth, authController.getProfile);
  
  // Update user's profile (protected route)
  router.put('/profile', [auth, uploaders.avatars.single('avatar')], authController.updateProfile);
  
  return router;
};