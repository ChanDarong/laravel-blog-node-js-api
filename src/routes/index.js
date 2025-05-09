const express = require('express');
const router = express.Router();

module.exports = () => {
  // Import controllers
  const PostController = require('../controllers/post.controller');
  const CategoryController = require('../controllers/category.controller');
  const AuthorController = require('../controllers/author.controller');
  const AuthController = require('../controllers/auth/auth.controller');
  
  // Create controller instances
  const postController = new PostController();
  const categoryController = new CategoryController();
  const authorController = new AuthorController();
  const authController = new AuthController();
  
  // Import routes
  const postRoutes = require('./post.routes')(postController);
  const categoryRoutes = require('./category.routes')(categoryController);
  const authorRoutes = require('./author.routes')(authorController);
  const authRoutes = require('./auth.routes')(authController);
  
  // API version
  const apiVersion = process.env.API_VERSION || 'v1';
  
  // Register routes
  router.use(`/${apiVersion}/posts`, postRoutes);
  router.use(`/${apiVersion}/categories`, categoryRoutes);
  router.use(`/${apiVersion}/authors`, authorRoutes);
  router.use(`/${apiVersion}/auth`, authRoutes);
  
  return router;
};