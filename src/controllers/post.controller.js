const Post = require('../models/post');

class PostController {
  // Get all posts
  async getAllPosts(req, res) {
    try {
      // Check if we should populate categories
      const shouldPopulateCategory = req.query.withCategory === 'true';
      const shouldPopulateAuthor = req.query.withAuthor === 'true';

      // Build filter conditions
      const filter = {};

      // Check if category filter is provided
      if (req.query.category) {
        filter.category = req.query.category;
      }

      // Check if isFeatured
      if (req.query.isFeatured == 1) {
        filter.isFeatured = true;
      }
      
      // Create query
      let query = Post.find(filter);
      
      // Add population if requested
      if (shouldPopulateCategory) {
        query = query.populate('category');
      }
      if (shouldPopulateAuthor) {
        query = query.populate('author');
      }
      
      // Add sorting (newest first)
      query = query.sort({ createdAt: -1 });
      
      // Execute query
      const posts = await query;
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get a single post by ID
  async getPostById(req, res) {
    try {
      // Check if we should populate categories
      const shouldPopulate = req.query.withCategories === 'true';
      
      // Create query
      let query = Post.findById(req.params.id);
      
      // Add population if requested
      if (shouldPopulate) {
        query = query.populate('categories');
      }
      
      // Execute query
      const post = await query;
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create a new post
  async createPost(req, res) {
    try {
      const post = new Post({
        title: req.body.title,
        excerpt: req.body.excerpt,
        content: req.body.content,
        author: req.body.author,
        category: req.body.category,
        readTime: req.body.readTime,
        tags: req.body.tags || [],
        published: req.body.published !== undefined ? req.body.published : true
      });

      // Handle image image if present
      if (req.file) {
        post.image = req.file.path || `/public/uploads/posts/${req.file.filename}`;
      } else if (req.body.image) {
        post.image = req.body.image;
      }

      const savedPost = await post.save();
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update a post
  async updatePost(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete a post
  async deletePost(req, res) {
    try {
      const post = await Post.findByIdAndDelete(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json({ message: 'Post deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Additional methods
  
  // Get posts by category
  async getPostsByCategory(req, res) {
    try {
      const categoryId = req.params.categoryId;
      
      // Find posts that have this category in their categories array
      const posts = await Post.find({ categories: categoryId })
        .populate('categories')
        .sort({ createdAt: -1 });
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Search posts
  async searchPosts(req, res) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      // Create text index for better search (you'd typically do this once in your schema or a migration)
      // await Post.collection.createIndex({ title: "text", content: "text" });
      
      const posts = await Post.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .populate('categories')
        .sort({ score: { $meta: "textScore" } });
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = PostController;