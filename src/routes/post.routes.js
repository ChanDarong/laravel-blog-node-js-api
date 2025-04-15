const express = require('express');
const router = express.Router();
const uploaders = require('../middleware/upload')

module.exports = (postController) => {
  // GET all posts
  router.get('/', postController.getAllPosts);
  
  // GET posts by category
  router.get('/category/:categoryId', postController.getPostsByCategory);
  
  // GET search posts
  router.get('/search', postController.searchPosts);
  
  // GET a single post
  router.get('/:id', postController.getPostById);
  
  // POST a new post
  router.post('/', uploaders.posts.single('image'), postController.createPost);
  
  // PUT update a post
  router.put('/:id', postController.updatePost);
  
  // DELETE a post
  router.delete('/:id', postController.deletePost);

  return router;
};