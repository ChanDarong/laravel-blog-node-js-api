const Author = require('../models/author');
const path = require('path');
const fs = require('fs');
const { uploadToBlob } = require('../utils/blobStorage');

class AuthorController {
    // Get all authors
    async getAllAuthors(req, res) {
        try {
            const authors = await Author.find().sort({ name: 1 });
            res.json(authors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get author by ID
    async getAuthorById(req, res) {
        try {
            const author = await Author.findById(req.params.id);
            if (!author) {
                return res.status(404).json({
                    message: "Author not found"
                });
            }
            res.json(author);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

    // Create author
    async createAuthor(req, res) {
        try {
            // Check if required fields are present
            if (!req.body.name) {
                return res.status(400).json({ message: "Author name is required" });
            }

            const author = new Author({
                name: req.body.name
            });

            // Handle avatar image if present
            if (req.file) {
                try {
                    if (process.env.VERCEL === '1') {
                        // Use Vercel Blob storage in production/Vercel environment
                        const result = await uploadToBlob(
                            req.file.buffer,
                            req.file.originalname,
                            'authors'
                        );
                        author.avatar = result.url;
                    } else {
                        // In local development, save to disk
                        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
                        const filepath = `public/uploads/authors/${filename}`;
                        
                        // Ensure the directory exists
                        if (!fs.existsSync('public/uploads/authors')) {
                            fs.mkdirSync('public/uploads/authors', { recursive: true });
                        }
                        
                        // Write the file
                        fs.writeFileSync(filepath, req.file.buffer);
                        author.avatar = filepath;
                    }
                } catch (error) {
                    console.error('File upload error:', error);
                    return res.status(500).json({ message: 'Error uploading file' });
                }
            } else if (req.body.avatar) {
                // If you're passing a URL directly through the request body
                author.avatar = req.body.avatar;
            }

            // Save the author to database
            const savedAuthor = await author.save();
            
            // Return success response
            res.status(201).json(savedAuthor);

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AuthorController;