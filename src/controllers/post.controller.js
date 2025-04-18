const Post = require('../models/post');
const fs = require('fs');
const path = require('path');

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

      // Define projection for fields we want (only include these fields)
      const projection = {
        title: 1,
        slug: 1,
        excerpt: 1,
        image: 1,
        createdAt: 1,
        category: 1,
        author: 1,
        readTime: 1
        // Not including content to reduce payload size
      };
      
      // Create query
      let query = Post.find(filter, projection);
      
      // Add population if requested
      if (shouldPopulateCategory) {
        query = query.populate({
          path: 'category',
          select: 'name slug'
        });
      }
      if (shouldPopulateAuthor) {
        query = query.populate({
          path: 'author',
          select: 'name avatar'
        });
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

  // Get a single post by slug
  async getPostBySlug(req, res) {
    try {
      // Define projection for fields we want
      const projection = {
        title: 1,
        slug: 1,
        excerpt: 1,
        image: 1,
        createdAt: 1,
        category: 1,
        author: 1,
        content: 1,
        tags: 1,
        readTime: 1
      };

      // Create and execute query with chaining
      const post = await Post.findOne({ slug: req.params.slug }, projection)
        .populate({
          path: 'category',
          select: 'name slug'
        })
        .populate({
          path: 'author',
          select: 'name avatar'
        }); // Use lean() for better performance

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
      // Find the existing post
      const existingPost = await Post.findById(req.params.id);

      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const updateData = { ...req.body };
      // Handle image if it's being updated
      if (req.file) {
        // Set the new image path
        updateData.image = `public/uploads/posts/${req.file.filename}`;

        // Delete old image if it exists and isn't a URL
        if (existingPost.image && 
          !existingPost.image.startsWith('http') && 
          fs.existsSync(existingPost.image)) {
          try {
            fs.unlinkSync(path.resolve(existingPost.image));
            console.log(`Deleted old image: ${existingPost.image}`);
          } catch (err) {
            console.error(`Failed to delete old image: ${err.message}`);
            // Continue execution even if file deletion fails
          }
        }

      }

      // Update the post
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      res.json(updatedPost);
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