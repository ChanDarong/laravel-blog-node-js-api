const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
    const user = this;

    // Only has the password if it's modified
    if (!user.isModified('password')) return next();

    try {
        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password)
    } catch (error) {
        throw new Error(error);
    }
}

// Virtual for full name
userSchema.virtual('name').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Transform method for JSON
userSchema.set('toJSON', {
    virtuals: true, // Include virtuals when converting to JSON
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Don't expose password in JSON
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;