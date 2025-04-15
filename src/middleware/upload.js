const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Creates a multer upload middleware for a specific entity type
 * @param {string} entityType - The entity type (e.g., 'authors', 'posts')
 * @returns {object} Multer middleware
 */
const createUploader = (entityType) => {
  // Create entity-specific uploads directory
  const uploadDir = `public/uploads/${entityType}`;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configure storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Create unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    }
  });

  // File filter to only allow image files
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  };

  // Create the multer instance
  return multer({ 
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter: fileFilter
  });
};

// Create specific uploaders for different entity types
const uploaders = {
  authors: createUploader('authors'),
  posts: createUploader('posts')
};

module.exports = uploaders;