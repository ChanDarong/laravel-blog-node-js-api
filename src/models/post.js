const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String, 
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  // Reference to category
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  // You can add more fields like:
  published: {
    type: Boolean,
    default: true
  },
  featuredImage: {
    type: String
  },
  tags: [String]
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to generate slug from title
postSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;