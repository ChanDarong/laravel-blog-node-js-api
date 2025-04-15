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
    content: {
        type: String,
        require: true
    },
    // Reference to author
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Author'
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
    image: {
        type: String
    },
    readTime: {
        type: String
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [String]
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },  // Enable virtuals when converting to JSON
    toObject: { virtuals: true } // Enable virtuals when converting to object
});

// Pre-save hook to generate slug from title
postSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    next();
});

// Add a virtual for the full image URL
postSchema.virtual('imageUrl').get(function () {
    if (this.image && !this.image.startsWith('http')) {
        const baseUrl = global.baseUrl || 'http://localhost:3000';
        const imagePath = this.image.startsWith('/') ? this.image : `/${this.image}`;
        return `${baseUrl}${imagePath}`; // We'll transform this in the toJSON method
    }
    return this.image;
});

// Transform method to add full URLs
postSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret, options) {
        // Don't modify id format
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        return ret;
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;