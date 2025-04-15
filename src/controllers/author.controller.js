const Author = require('../models/author');

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
                // If using multer, the file information will be in req.file
                // Store the path or URL to the uploaded file
                author.avatar = req.file.path || `/public/uploads/authors/${req.file.filename}`;
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