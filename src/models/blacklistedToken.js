const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blacklistedTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // This will automatically remove documents when expiresAt is reached
  }
});

const BlacklistedToken = mongoose.model('BlacklistedToken', blacklistedTokenSchema);

module.exports = BlacklistedToken;