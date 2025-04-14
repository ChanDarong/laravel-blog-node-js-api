const express = require('express');
const router = express.Router();

module.exports = () => {
  // Import controllers
  const PostController = require('../controllers/post.controller');
  const CategoryController = require('../controllers/category.controller');
  
  // Create controller instances
  const postController = new PostController();
  const categoryController = new CategoryController();
  
  // Import routes
  const postRoutes = require('./post.routes')(postController);
  const categoryRoutes = require('./category.routes')(categoryController);
  
  // API version
  const apiVersion = process.env.API_VERSION || 'v1';
  
  // Register routes
  router.use(`/${apiVersion}/posts`, postRoutes);
  router.use(`/${apiVersion}/categories`, categoryRoutes);
  
  return router;
};