const express = require('express');
const router = express.Router();
const Tweet = require('../models/Tweet');

// ==========================================
// 1. GET: Fetch all tweets
router.get('/', async (req, res) => {
  try {
    const tweets = await Tweet.find()
    .sort({ createdAt: -1 });
 
    return res.status(200).json(tweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return res.status(500).json({ message: 'Error fetching tweets',error: error.message });
  }
});
// ==========================================
// 2. POST: Create a new tweet
router.post('/', async (req, res) => {
  try {
    const { text, image, video,  authorName, username, avatar} = req.body;

    if (!text && !image && !video) {
      return res.status(400).json({message: 'Tweet must contain text, an image, or a video'}); 
    }
    const newTweet = new Tweet({
      text: text || '',
      image: image || null,
      video: video || null, 
      authorName: authorName || 'Anonymous',
      username: username || 'guest_user',
      avatar: avatar || null,
      likes: 0,
      likedBy: []
    });

    const savedTweet = await newTweet.save();

    console.log('Tweet saved:', {
      id: savedTweet._id,
      username: savedTweet.username,
      hasVideo: !!savedTweet.video});

    return res.status(201).json(savedTweet);

  } catch (error) {
    console.error('Error creating tweet:', error);
    return res.status(500).json({message: 'Error creating tweet',error: error.message });
  }
});

// ==========================================
// 3. DELETE: Delete a tweet

router.delete('/:id', async (req, res) => {
  try {
    const tweetId = req.params.id;
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
      return res.status(404).json({message: 'Tweet not found'});
    }

    return res.status(200).json({message: 'Tweet deleted successfully', id: tweetId});

  } catch (error) {
    console.error('Error deleting tweet:', error);
    return res.status(500).json({message: 'Error deleting tweet', error: error.message });
  }
});
// ==========================================
// 4. PUT: Toggle Like / Unlike
router.put('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const tweetId = req.params.id;
    const currentUserId = userId || 'guest_user';
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({message: 'Tweet not found' });
    }
    const likedArray = Array.isArray(tweet.likedBy)
      ? tweet.likedBy
      : [];
    const isLiked = likedArray.includes(currentUserId);
    let updatedTweet;
    if (isLiked) {
      // Unlike
      updatedTweet = await Tweet.findByIdAndUpdate( tweetId, {
          $pull: {
            likedBy: currentUserId
          },
          $inc: {
            likes: -1
          }
        },
        {
          new: true
        }
      );

    } else {

      // Like
      updatedTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
          $addToSet: {
            likedBy: currentUserId
          },
          $inc: {
            likes: 1
          }
        },
        {
          new: true
        }
      );
    }

    return res.status(200).json(updatedTweet);

  } catch (error) {
    console.error('Error toggling like:', error);

    return res.status(500).json({message: 'Error toggling like', error: error.message});
  }
});

module.exports = router;