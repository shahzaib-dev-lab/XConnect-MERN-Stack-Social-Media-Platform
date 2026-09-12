const express = require('express');
const router = express.Router();
const Tweet = require('../models/Tweet');

// PUT: Toggle Like / Unlike
router.put('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const tweetId = req.params.id;
    const currentUserId = userId || 'guest_user';

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const likedArray = Array.isArray(tweet.likedBy) ? tweet.likedBy : [];
    const isLiked = likedArray.includes(currentUserId);

    let updatedTweet;

    if (isLiked) {
      // User has already liked -> Remove from array & Decrement (-1)
      updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
          $pull: { likedBy: currentUserId },
          $inc: { likes: -1 }
        },
        { new: true }
      );
    } else {
      // User hasn't liked -> Add to array & Increment (+1)
      updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
          $addToSet: { likedBy: currentUserId },
          $inc: { likes: 1 }
        },
        { new: true }
      );
    }

    return res.status(200).json(updatedTweet);
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
});

module.exports = router;