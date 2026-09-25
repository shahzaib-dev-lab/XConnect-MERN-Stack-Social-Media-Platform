const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({ 
    sender: {type: String,required: true, trim: true,},
    senderUsername: {type: String, required: true, trim: true, lowercase: true, index: true,},
    // Sender profile picture
    senderAvatar: {type: String,default: null,},
    receiverUsername: { type: String, required: true, trim: true, lowercase: true, index: true },

    // Receiver profile picture
    receiverAvatar: {type: String, default: null,},
    text: {type: String, required: true, trim: true,},

    // Message/conversation deleted only for a particular user
    deletedFor: {type: [String], default: [],},},
  {
    timestamps: true,
  }
);

// Faster conversation/history queries
messageSchema.index({
  senderUsername: 1,
  receiverUsername: 1,
  createdAt: 1,
});

messageSchema.index({
  receiverUsername: 1,
  senderUsername: 1,
  createdAt: 1,
});

module.exports = mongoose.model('Message', messageSchema);