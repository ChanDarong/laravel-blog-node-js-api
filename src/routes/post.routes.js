const express = require('express');
const router = express.Router();

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
  router.post('/', postController.createPost);
  
  // PUT update a post
  router.put('/:id', postController.updatePost);
  
  // DELETE a post
  router.delete('/:id', postController.deletePost);

  return router;
};