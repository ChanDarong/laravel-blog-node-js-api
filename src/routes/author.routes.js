const express = require('express');
const router = express.Router();
const uploaders = require('../middleware/upload');

module.exports = (authorController) => {
    // GET All author
    router.get('/', authorController.getAllAuthors);

    // GET a single author
    router.get('/:id', authorController.getAuthorById);

    // POST create a new author with image upload
    router.post('/', uploaders.authors.single('avatar'), authorController.createAuthor);

    return router;
};