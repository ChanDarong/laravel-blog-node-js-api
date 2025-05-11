const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Creates a multer upload middleware for a specific entity type
 * @param {string} entityType - The entity type (e.g., 'authors', 'posts', 'avatars')
 * @returns {object} Multer middleware
 */
const createUploader = (entityType) => {
  // Always use memory storage for Vercel environments and blob storage
  // This will store files in memory instead of on disk
  const storage = multer.memoryStorage();
  
  // If we're not in Vercel, we'll create the directories for local development
  if (process.env.VERCEL !== '1') {
    const uploadDir = `public/uploads/${entityType}`;
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (error) {
      console.error(`Error creating upload directory: ${error.message}`);
    }
  }

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
  posts: createUploader('posts'),
  avatars: createUploader('avatars')
};

module.exports = uploaders;