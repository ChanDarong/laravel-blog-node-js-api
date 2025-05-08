// Vercel Blob storage utilities
const { put } = require('@vercel/blob');
const path = require('path');

/**
 * Uploads a file to Vercel Blob storage
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} originalFilename - The original filename
 * @param {string} entityType - The entity type (e.g., 'authors', 'posts')
 * @returns {Promise<Object>} The upload result containing the URL
 */
async function uploadToBlob(buffer, originalFilename, entityType) {
  if (!buffer) {
    throw new Error('No file buffer provided');
  }

  try {
    // Generate a unique filename to prevent collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(originalFilename || '.jpg');
    const filename = `${entityType}/${uniqueSuffix}${ext}`;

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: getContentType(ext),
    });

    return {
      url: blob.url,
      size: blob.size,
      pathname: filename
    };
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw error;
  }
}

/**
 * Gets the content type based on file extension
 * @param {string} ext - The file extension
 * @returns {string} The content type
 */
function getContentType(ext) {
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  
  return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
}

module.exports = {
  uploadToBlob
};