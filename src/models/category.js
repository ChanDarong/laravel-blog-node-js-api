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
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

// Transform method _id to id
categorySchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    // Don't modify id format
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    return ret;
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;