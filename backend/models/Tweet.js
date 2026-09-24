const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({
  authorName: { type: String, default: 'Anonymous' },
  username: { type: String, default: 'user' },
  text: { type: String, default: '' },
  image: { type: String, default: null },
  mediaUrl: { type: String, default: null}, 
  mediaType: { type: String, enum: ['image', 'video', null], default: null},
  avatar: { type: String, default: null },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tweet', TweetSchema);