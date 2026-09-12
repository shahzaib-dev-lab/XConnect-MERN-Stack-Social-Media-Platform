import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BiCalendar } from 'react-icons/bi';
import { FiEdit3 } from 'react-icons/fi';
import TweetCard from './TweetCard';

const API_TWEETS_URL = 'http://localhost:5000/api/tweets';
const API_AUTH_URL = 'http://localhost:5000/api/auth';

const Profile = ({ currentUser, onUserUpdate, onLike, onDelete }) => {
  const [userProfile, setUserProfile] = useState(currentUser);
  const [userTweets, setUserTweets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [loading, setLoading] = useState(false);

  const activeUsername = typeof currentUser === 'string' ? currentUser : currentUser?.username;

  useEffect(() => {
    if (currentUser) {
      setUserProfile(currentUser);
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
    }
  }, [currentUser]);

  // Fetch Profile & Tweets
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!activeUsername) return;
      try {
        const profileRes = await axios.get(`${API_AUTH_URL}/profile/${activeUsername}`);
        if (profileRes.data) {
          setUserProfile(profileRes.data);
          setName(profileRes.data.name || '');
          setBio(profileRes.data.bio || '');
        }

        const tweetsRes = await axios.get(API_TWEETS_URL);
        const filtered = tweetsRes.data.filter(
          (tweet) => tweet.username?.toLowerCase() === activeUsername.toLowerCase()
        );
        setUserTweets(filtered);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    fetchProfileData();
  }, [activeUsername]);

  // Submit Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!activeUsername) {
      alert('User session not found!');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(`${API_AUTH_URL}/profile/update`, {
        username: activeUsername,
        name: name,
        bio: bio
      });

      if (res.data) {
        setUserProfile(res.data);
        if (onUserUpdate) {
          onUserUpdate(res.data);
        } else {
          localStorage.setItem('user', JSON.stringify(res.data));
        }
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Save Error:', err.response?.data || err);
      alert('Error saving profile: ' + (err.response?.data?.message || 'Check Console'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black border-x border-[#2f3336] select-none">
      {/* Profile Header */}
      <div className="p-3 border-b border-[#2f3336] sticky top-0 bg-black/80 backdrop-blur-md z-10">
        <h2 className="text-xl font-bold text-white leading-tight">{userProfile?.name}</h2>
        <p className="text-xs text-gray-500">{userTweets.length} Tweets</p>
      </div>

      {/* Cover Banner */}
      <div className="h-32 bg-[#333639] w-full relative">
        <div className="absolute -bottom-12 left-4">
          <div className="w-24 h-24 rounded-full bg-[#1d9bf0] border-4 border-black flex items-center justify-center text-3xl font-bold text-white uppercase">
            {userProfile?.name ? userProfile.name.charAt(0) : 'U'}
          </div>
        </div>
      </div>

      {/* Edit Profile Action */}
      <div className="flex justify-end p-4">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="border border-[#536471] hover:bg-white/10 text-white font-bold px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 cursor-pointer"
        >
          <FiEdit3 className="text-sm" /> Edit profile
        </button>
      </div>

      {/* Profile Details */}
      <div className="px-4 pb-4 border-b border-[#2f3336]">
        <h1 className="text-xl font-bold text-white leading-tight">{userProfile?.name}</h1>
        <p className="text-sm text-gray-500">@{userProfile?.username}</p>

        <p className="text-sm text-white mt-3">{userProfile?.bio || 'No bio provided yet.'}</p>

        <div className="flex items-center gap-2 text-gray-500 text-xs mt-3">
          <BiCalendar className="text-base" />
          <span>Joined September 2026</span>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditing && (
        <div className="p-4 bg-[#16181c] border-b border-[#2f3336]">
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black border border-[#2f3336] p-2 rounded text-white text-sm focus:outline-none focus:border-[#1d9bf0]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-black border border-[#2f3336] p-2 rounded text-white text-sm focus:outline-none focus:border-[#1d9bf0]"
                rows="3"
                placeholder="Write your bio..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 bg-gray-700 text-xs text-white rounded-full hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-1.5 bg-[#1d9bf0] text-xs font-bold text-white rounded-full hover:bg-blue-600 cursor-pointer transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User's Posted Tweets */}
      <div>
        <div className="p-3 border-b border-[#2f3336] font-bold text-sm text-[#1d9bf0] border-b-2 border-[#1d9bf0] inline-block px-6">
          Your Posts
        </div>
        <div>
          {userTweets.length > 0 ? (
            userTweets.map((post) => (
              <TweetCard
                key={post._id || post.id}
                post={post}
                onDelete={onDelete}
                onLike={onLike}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              You haven't posted any tweets yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;