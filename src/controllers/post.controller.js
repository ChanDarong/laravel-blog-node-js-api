const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const { uploadToBlob } = require('../utils/blobStorage');

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

      // Handle image if present
      if (req.file) {
        try {
          if (process.env.VERCEL === '1') {
            // Use Vercel Blob storage in production/Vercel environment
            const result = await uploadToBlob(
              req.file.buffer,
              req.file.originalname,
              'posts'
            );
            post.image = result.url;
          } else {
            // In local development, save to disk
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
            const filepath = `public/uploads/posts/${filename}`;
            
            // Ensure the directory exists
            if (!fs.existsSync('public/uploads/posts')) {
              fs.mkdirSync('public/uploads/posts', { recursive: true });
            }
            
            // Write the file
            fs.writeFileSync(filepath, req.file.buffer);
            post.image = filepath;
          }
        } catch (error) {
          console.error('File upload error:', error);
          return res.status(500).json({ message: 'Error uploading file' });
        }
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
        try {
          if (process.env.VERCEL === '1') {
            // Use Vercel Blob storage in production/Vercel environment
            const result = await uploadToBlob(
              req.file.buffer,
              req.file.originalname,
              'posts'
            );
            updateData.image = result.url;
          } else {
            // In local development, save to disk
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
            const filepath = `public/uploads/posts/${filename}`;
            
            // Ensure the directory exists
            if (!fs.existsSync('public/uploads/posts')) {
              fs.mkdirSync('public/uploads/posts', { recursive: true });
            }
            
            // Write the file
            fs.writeFileSync(filepath, req.file.buffer);
            updateData.image = filepath;
            
            // Delete old image if it exists and isn't a URL and isn't a blob URL
            if (existingPost.image && 
                !existingPost.image.startsWith('http') && 
                !existingPost.image.includes('vercel-blob.com') &&
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
        } catch (error) {
          console.error('File upload error:', error);
          return res.status(500).json({ message: 'Error uploading file' });
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