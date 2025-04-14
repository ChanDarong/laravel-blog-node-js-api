const Category = require('../models/category');

class CategoryController {
  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.find().sort({ name: 1 });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get category by ID
  async getCategoryById(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create category
  async createCategory(req, res) {
    try {
      const category = new Category({
        name: req.body.name,
        description: req.body.description
      });
      
      const savedCategory = await category.save();
      res.status(201).json(savedCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update category
  async updateCategory(req, res) {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete category
  async deleteCategory(req, res) {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json({ message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = CategoryController;