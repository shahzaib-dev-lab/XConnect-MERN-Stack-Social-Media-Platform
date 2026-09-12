const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// 1. GET: Fetch private conversation between 2 users
router.get('/conversation/:user1/:user2', async (req, res) => {
  try {
    const user1 = req.params.user1.toLowerCase().trim();
    const user2 = req.params.user2.toLowerCase().trim();

    const messages = await Message.find({
      $or: [
        { senderUsername: user1, receiverUsername: user2 },
        { senderUsername: user2, receiverUsername: user1 }
      ],
      deletedFor: { $ne: user1 } // Hide messages deleted by user1
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
});

// 2. POST: Send Private DM
router.post('/', async (req, res) => {
  try {
    const { sender, senderUsername, receiverUsername, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    if (!receiverUsername || !senderUsername) {
      return res.status(400).json({ message: 'Sender and Receiver usernames are required' });
    }

    const newMessage = new Message({
      sender: sender || senderUsername,
      senderUsername: senderUsername.toLowerCase().trim(),
      receiverUsername: receiverUsername.toLowerCase().trim(),
      text: text.trim(),
      deletedFor: []
    });

    const savedMessage = await newMessage.save();
    return res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// 3. DELETE FOR ME: Per-user Soft Delete
router.delete('/delete-for-me/:id', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: 'Username query parameter is required' });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { deletedFor: username.toLowerCase().trim() } },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.status(200).json({ message: 'Message deleted for you', updatedMessage });
  } catch (error) {
    console.error('Error deleting message for me:', error);
    return res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

module.exports = router;