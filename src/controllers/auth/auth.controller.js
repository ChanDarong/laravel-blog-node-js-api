const User = require('../../models/user');
const BlacklistedToken = require('../../models/blacklistedToken');
const jwt = require('jsonwebtoken');

class AuthController {
    // Register a new user
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Check if required field are present
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            // Create a new user
            const user = new User({
                name,
                email,
                password
            });

            // Save the user
            await user.save();

            // Generate JWT toke
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            // Return user info and token (without password)
            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token: token
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Check if email and password are provide
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check if password is correct
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create JWT token
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            // Return user info and token
            res.json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token: token
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get current user's profile
    async getProfile(req, res) {
        try {
            // User is already attached to request by auth middleware
            const user = await User.findById(req.user.userId).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Update user's profile
    async updateProfile(req, res) {
        try {
            const { name, email, role } = req.body;
            const updates = {};

            // Only update field that were provided
            if (name) updates.name = name;
            if (email) updates.email = email;
            if (role) updates.role = role;

            // Update password if provided
            if (req.body.password) {
                // Will be hashed by pre-save hook
                updates.password = req.body.password;

                // When updating with password, don't user findByIdAndUpdate
                // because we need the password hashing middleware to run
                const user = await User.findById(req.user.userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                Object.assign(user, updates);
                await user.save();

                // Return updated user (without password)
                return res.json({
                    message: 'Profile updated successfully',
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }

            // If no password update, use findByIdAndUpdate
            const updatedUser = await User.findByIdAndUpdate(
                req.user.userId,
                updates,
                { new: true, runValidators: true }
            ).select('-password');

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                message: 'Profile updated successfully',
                user: updatedUser
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Logout user
    async logout(req, res) {
        try {
            const authHeader = req.header('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(400).json({ message: 'No token provided' });
            }
            
            const token = authHeader.replace('Bearer ', '');
            
            // Verify token to get its expiration
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                
                // Calculate expiration date
                const expiresAt = new Date(decoded.exp * 1000);
                
                // Add token to blacklist
                await BlacklistedToken.create({
                    token,
                    expiresAt
                });
                
                res.json({ message: 'Logged out successfully' });
            } catch (err) {
                // If token verification fails, it's already invalid
                res.json({ message: 'Token already expired or invalid' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AuthController;