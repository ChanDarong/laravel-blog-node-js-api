const express = require('express');
const router = express.Router();

module.exports = () => {
  // Import controllers
  const PostController = require('../controllers/post.controller');
  const CategoryController = require('../controllers/category.controller');
  const AuthorController = require('../controllers/author.controller');
  
  // Create controller instances
  const postController = new PostController();
  const categoryController = new CategoryController();
  const authorController = new AuthorController();
  
  // Import routes
  const postRoutes = require('./post.routes')(postController);
  const categoryRoutes = require('./category.routes')(categoryController);
  const authorRoutes = require('./author.routes')(authorController);
  
  // API version
  const apiVersion = process.env.API_VERSION || 'v1';
  
  // Register routes
  router.use(`/${apiVersion}/posts`, postRoutes);
  router.use(`/${apiVersion}/categories`, categoryRoutes);
  router.use(`/${apiVersion}/authors`, authorRoutes);
  
  return router;
};