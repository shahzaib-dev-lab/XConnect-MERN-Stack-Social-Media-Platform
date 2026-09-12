const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, default: 'User' },
  senderUsername: { type: String, required: true },
  receiverUsername: { type: String, required: true },
  text: { type: String, required: true },
  deletedFor: [{ type: String }], //  Track usernames who deleted this message for themselves
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);