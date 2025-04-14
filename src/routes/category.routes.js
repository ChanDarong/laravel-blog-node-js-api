const express = require('express');
const router = express.Router();

module.exports = (categoryController) => {
  // GET all categories
  router.get('/', categoryController.getAllCategories);
  
  // GET a single category
  router.get('/:id', categoryController.getCategoryById);
  
  // POST a new category
  router.post('/', categoryController.createCategory);
  
  // PUT update a category
  router.put('/:id', categoryController.updateCategory);
  
  // DELETE a category
  router.delete('/:id', categoryController.deleteCategory);

  return router;
};