const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to generate slug from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;