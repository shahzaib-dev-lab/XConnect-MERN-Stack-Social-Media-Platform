const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// ROOM ID
// ======================================================
const getRoomId = (user1, user2) => {
  return [
    user1.toLowerCase().trim(),
    user2.toLowerCase().trim(),
  ]
    .sort().join('_');
};
// ======================================================
// GET ALL CONVERSATIONS FOR USER
router.get('/conversations/:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();

    if (!username) {
      return res.status(400).json({
        message: 'Username is required',
      });
    }

    const messages = await Message.find({$or: [
        {
          senderUsername: username,
        },
        {
          receiverUsername: username,
        },],

    deletedFor: {$ne: username,},}).sort({createdAt: -1,}).lean();
    const conversationMap = new Map();

    for (const message of messages) {
      const isCurrentUserSender =
        message.senderUsername === username;

      const partner = isCurrentUserSender
        ? message.receiverUsername
        : message.senderUsername;

      // Latest message for this conversation
      if (!conversationMap.has(partner)) {

        // IMPORTANT:
        //If the current user is sender,
        //receiverAvatar will use.
        //If the current user is receiver,
        //senderAvatar will use.

        const partnerAvatar = isCurrentUserSender
          ? message.receiverAvatar || null
          : message.senderAvatar || null;

        const partnerName = isCurrentUserSender
          ? message.receiverUsername
          : message.sender || message.senderUsername;

        conversationMap.set(partner, {
          username: partner,
          name: partnerName,
          avatar: partnerAvatar,
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          lastMessageId: message._id,
        });
      }
    }

    const conversations = Array.from(conversationMap.values());
    return res.json(conversations);

  } catch (error) {
    console.error('GET CONVERSATIONS ERROR:',error);

    return res.status(500).json({
      message: 'Failed to load conversations',
      error: error.message,
    });
  }
});
// ======================================================
// GET CONVERSATION MESSAGES
router.get(
  '/conversation/:user1/:user2',
  async (req, res) => {
    try {
      const user1 =
        req.params.user1.toLowerCase().trim();

      const user2 =
        req.params.user2.toLowerCase().trim();

      const messages = await Message.find({
        $or: [
          {
            senderUsername: user1,
            receiverUsername: user2,
          },
          {
            senderUsername: user2,
            receiverUsername: user1,
          },
        ],

      deletedFor: {$ne: user1,},}).sort({createdAt: 1,});
      return res.json(messages);
    } catch (error) {
      console.error('GET CONVERSATION ERROR:',error );

      return res.status(500).json({message: 'Failed to load messages',error: error.message,});
    }
  }
);
// =====================================================
// SEND MESSAGE
router.post('/', async (req, res) => {
  try {
    const {
      sender,
      senderUsername,
      senderAvatar,
      receiverUsername,
      receiverAvatar,
      text,
    } = req.body;

    if (!senderUsername || !receiverUsername) {
      return res.status(400).json({message:'Sender and receiver usernames are required',});
    }

    if (!text || !text.trim()) {
      return res.status(400).json({message: 'Message text cannot be empty',});
    }

    const normalizedSender = senderUsername.toLowerCase().trim();

    const normalizedReceiver = receiverUsername.toLowerCase().trim();
    // ==================================================
    // CREATE MESSAGE
    const newMessage = new Message({
      sender: sender || senderUsername,

      senderUsername: normalizedSender,

      // SAVE SENDER PFP
      senderAvatar: senderAvatar || null,

      receiverUsername: normalizedReceiver,

      // SAVE RECEIVER PFP
      receiverAvatar: receiverAvatar || null,

      text: text.trim(),

      deletedFor: [], });

    const savedMessage = await newMessage.save();

    console.log('MESSAGE SAVED:', {
      id: savedMessage._id,
      sender: savedMessage.senderUsername,
      receiver: savedMessage.receiverUsername,
      senderAvatar:
        savedMessage.senderAvatar
          ? 'YES'
          : 'NO',
      receiverAvatar:
        savedMessage.receiverAvatar
          ? 'YES'
          : 'NO',
    });
    // ==================================================
    // SOCKET ROOM
    const roomId = getRoomId(normalizedSender, normalizedReceiver);
    const io = req.app.get('socketio');

    if (io) {
      io.to(roomId).emit('receive_message', savedMessage.toObject());
    }

    return res.status(201).json(savedMessage);

  } catch (error) {
    console.error('SEND MESSAGE ERROR:', error);
    return res.status(500).json({ message: 'Failed to send message', error: error.message,});
  }
});
// ======================================================
// DELETE ENTIRE CONVERSATION FOR CURRENT USER
router.delete(
  '/conversation/:user1/:user2',
  async (req, res) => {
    try {
      const user1 = req.params.user1.toLowerCase().trim();

      const user2 = req.params.user2.toLowerCase().trim();

      if (!user1 || !user2) {
        return res.status(400).json({
          message:'Both usernames are required', });
      }

      await Message.updateMany(
        {
          $or: [
            {
              senderUsername: user1,
              receiverUsername: user2,
            },
            {
              senderUsername: user2,
              receiverUsername: user1,
            },
          ],
        },
        {
          $addToSet: {
            deletedFor: user1,
          },
        }
      );

      return res.json({success: true, message: 'Conversation deleted for you', });

    } catch (error) {
      console.error(
        'DELETE CONVERSATION ERROR:',
        error
      );

      return res.status(500).json({
        message:
          'Failed to delete conversation',
        error: error.message,
      });
    }
  }
);
// ======================================================
// DELETE SINGLE MESSAGE FOR CURRENT USER
router.delete(
  '/delete-for-me/:id',
  async (req, res) => {
    try {
      const { username } = req.query;

      if (!username) {
        return res.status(400).json({ message: 'Username is required', });
      }

      const normalizedUsername = username.toLowerCase().trim();

      const updatedMessage = await Message.findByIdAndUpdate( req.params.id, { $addToSet: { deletedFor: normalizedUsername, },
          },
          {
            new: true,
          }
        );

      if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found', });
      }

      return res.json({success: true, message: updatedMessage,});
    } catch (error) {
      console.error('DELETE MESSAGE ERROR:', error);
      return res.status(500).json({message: 'Failed to delete message', error: error.message,});
    }
  }
);
module.exports = router;