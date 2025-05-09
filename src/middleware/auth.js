const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BlacklistedToken = require('../models/blacklistedToken');

/**
 * Authentication middleware to verify JWT token
 */
const auth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token missing or invalid format' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        
        // Check if token is blacklisted
        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Token has been invalidated' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Attach user data to request
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

/**
 * Middleware to check if user is admin
 * Must be used after auth middleware
 */
const adminOnly = async (req, res, next) => {
    try {
        // Since auth middleware should run first, we have req.user
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { auth, adminOnly };