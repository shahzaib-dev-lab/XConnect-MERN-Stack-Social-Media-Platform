import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TweetCard from './TweetCard';
import { BiX, BiArrowBack, BiCamera } from 'react-icons/bi';

const API_URL = 'https://xconnect-mern-stack-social-media-platform-production.up.railway.app/api/tweets';

const Profile = ({ currentUser, onUserUpdate, onLike, onDelete, setCurrentView }) => {
  const [userTweets, setUserTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || null);
  const [coverPhoto, setCoverPhoto] = useState(currentUser?.coverPhoto || null);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditUsername(currentUser.username || '');
      setEditBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || null);
      setCoverPhoto(currentUser.coverPhoto || null);
    }
  }, [currentUser]);

  const fetchProfileTweets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      const allTweets = Array.isArray(response.data) ? response.data : [];

      const currentHandle = currentUser?.username?.toLowerCase() || '';
      const currentName = currentUser?.name?.toLowerCase() || '';

      const filtered = allTweets.filter((tweet) => {
        const tweetUsername = tweet.username ? tweet.username.toLowerCase() : '';
        const tweetAuthor = tweet.authorName ? tweet.authorName.toLowerCase() : '';

        return (
          (currentHandle && tweetUsername === currentHandle) ||
          (currentName && tweetAuthor === currentName)
        );
      });

      setUserTweets(filtered);
    } catch (error) {
      console.error('Error fetching profile tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProfileTweets();
    }
  }, [currentUser]);

  const handleDelete = (id) => {
    setUserTweets((prev) => prev.filter((t) => t._id !== id && t.id !== id));
    if (onDelete) onDelete(id);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name: editName,
      username: editUsername,
      bio: editBio,
      avatar: avatar,
      coverPhoto: coverPhoto
    };

    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
    setIsEditOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white w-full overflow-y-auto relative">
      {/* Top Header */}
      <div className="p-3 border-b border-[#2f3336] bg-black/80 backdrop-blur-md sticky top-0 z-10 flex items-center gap-6">
        <button onClick={() => setCurrentView && setCurrentView('home')} className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-white" title="Back to Home">
          <BiArrowBack className="text-xl" />
        </button>
        <div>
          <h2 className="text-lg font-bold leading-tight">{currentUser?.name || 'User Profile'}</h2>
          <p className="text-xs text-gray-500">{userTweets.length} Posts</p>
        </div>
      </div>

      {/* Main Profile Header Banner & Avatar */}
      <div className="relative mb-12">
        <div className="h-36 sm:h-48 bg-[#202327] w-full overflow-hidden">
          {currentUser?.coverPhoto ? (
            <img src={currentUser.coverPhoto} alt="Cover Header" className="w-full h-full object-cover"/>
          ) : (
            <div className="w-full h-full bg-[#202327]" />
          )}
        </div>

        <div className="absolute -bottom-10 left-4 z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#1d9bf0] border-4 border-black flex items-center justify-center font-bold text-3xl uppercase overflow-hidden shadow-xl">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              currentUser?.name ? currentUser.name.charAt(0) : 'U')}
          </div>
        </div>
      </div>
      {/* Edit Profile Action Button */}
      <div className="flex justify-end pr-4">
        <button onClick={() => setIsEditOpen(true)} className="border border-gray-600 hover:bg-white/10 text-white font-bold px-4 py-1.5 rounded-full text-sm transition cursor-pointer">
          Edit Profile
        </button>
      </div>

      {/* User Info Details */}
      <div className="mt-2 px-4 pb-4 border-b border-[#2f3336]">
        <h3 className="text-xl font-bold">{currentUser?.name}</h3>
        <p className="text-sm text-gray-500">@{currentUser?.username}</p>
        <p className="text-sm mt-2">{currentUser?.bio || 'MERN Stack Developer | Building Pulse Twitter Clone'}</p>
      </div>

      {/* Feed Tab */}
      <div className="border-b border-[#2f3336]">
        <div className="w-24  text-center py-3 font-bold border-b-4 border-[#1d9bf0]">
          Posts
        </div>
      </div>

      {/* Posts Section */}
      <div className="flex-1 pb-16 sm:pb-0">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading posts...</div>
        ) : userTweets.length > 0 ? (
          userTweets.map((tweet) => (
            <TweetCard key={tweet._id || tweet.id} post={tweet} currentUser={currentUser} onDelete={handleDelete} onLike={onLike} hideActions={true} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No posts yet. Post something from Home tab!
          </div>
        )}
      </div>

      {/* RESPONSIVE EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[#15181c] border border-[#2f3336] rounded-2xl w-full max-w-lg p-4 sm:p-6 text-white shadow-2xl relative max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2f3336] pb-3 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold">Edit Profile</h3>
              <button type="button" onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white cursor-pointer">
                <BiX className="text-xl sm:text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 overflow-y-auto pr-1">
              
              {/* Cover & Avatar Header Section */}
              <div className="relative mb-12 sm:mb-14">
                {/* Cover Photo Box */}
                <div className="relative h-28 sm:h-36 bg-[#202327] rounded-xl overflow-hidden border border-[#2f3336] flex items-center justify-center">
                  {coverPhoto && (
                    <img src={coverPhoto} alt="Cover Preview" className="w-full h-full object-cover" />
                  )}
                  
                  <label htmlFor="cover-pic-input" className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/60 transition cursor-pointer">
                    <div className="bg-black/60 p-2 rounded-full border border-gray-600">
                      <BiCamera className="text-xl sm:text-2xl text-white" />
                    </div>
                  </label>
                  <input id="cover-pic-input" type="file" accept="image/*" onChange={handleCoverPhotoChange} className="hidden" />
                </div>
                {/* Overlapping Avatar Box */}
                <div className="absolute -bottom-8 sm:-bottom-10 left-4">
                  <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-[#1d9bf0] border-4 border-[#15181c] overflow-hidden flex items-center justify-center shadow-lg">
                    {avatar ? (
                      <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl sm:text-2xl font-bold uppercase">{editName.charAt(0) || 'U'}</span>
                    )}

                    <label htmlFor="profile-pic-input" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-80 hover:opacity-100 transition cursor-pointer">
                    <BiCamera className="text-lg sm:text-xl text-white" />
                    </label>
                    <input id="profile-pic-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden"/>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-black border border-[#2f3336] rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#1d9bf0]" required />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">Username</label>
                <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="w-full bg-black border border-[#2f3336] rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#1d9bf0]" required />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">Bio</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-black border border-[#2f3336] rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#1d9bf0] resize-none h-20 sm:h-24"/>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-white text-black font-bold px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm hover:bg-gray-200 transition cursor-pointer" > Save </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;