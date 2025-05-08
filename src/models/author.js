const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mongoose schema definition for Author model
 * @typedef {Object} AuthorSchema
 * @property {string} name - The name of the author (required field)
 * @property {string} [avatar] - Optional URL or path to the author's avatar image
 * @property {Date} createdAt - Automatically generated timestamp when document is created
 * @property {Date} updatedAt - Automatically generated timestamp when document is updated
 */
const authorSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    avatar: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },  // Enable virtuals when converting to JSON
    toObject: { virtuals: true } // Enable virtuals when converting to object
});

// Add a virtual for the full avatar URL
authorSchema.virtual('avatarUrl').get(function() {
    if (this.avatar && !this.avatar.startsWith('http')) {
        const baseUrl = global.fileUrl || 'http://localhost:3000';
        const avatarPath = this.avatar.startsWith('/') ? this.avatar : `/${this.avatar}`;
        return `${baseUrl}${avatarPath}`; // We'll transform this in the toJSON method
    }
    return this.avatar;
});

// Transform method to add full URLs
authorSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options) {
        // Don't modify id format
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        
        
        return ret;
    }
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;