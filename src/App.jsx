import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Components/Sidebar';
import { IoMdSettings } from "react-icons/io";
import PostBox from './Components/Postbox';
import TweetCard from './Components/TweetCard';
import RightSidebar from './Components/RightSidebar';
import BottomNav from './Components/BottomNav';
import Messages from './Components/Messages';
import Profile from './Components/Profile';
import AuthModal from './Components/AuthModal';
import Games from './Components/Games';

const API_URL = 'http://localhost:5000/api/tweets';

const App = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('forYou');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 1. Permanent Working Like / Unlike Toggle Handler
  const handleLikeTweet = async (idToLike) => {
    const currentUsername = user?.username || user?.name || 'guest_user';

    // Instant UI Update (+1 / -1 & Red Heart Toggle)
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === idToLike || post.id === idToLike) {
          const isCurrentlyLiked = post.isLikedByMe || false;
          return {
            ...post,
            isLikedByMe: !isCurrentlyLiked,
            likes: isCurrentlyLiked ? Math.max(0, post.likes - 1) : post.likes + 1
          };
        }
        return post;
      })
    );

    // Backend Persistent Sync
    try {
      await axios.put(`${API_URL}/${idToLike}/like`, {
        userId: currentUsername
      });
    } catch (error) {
      console.error('Error syncing like with server:', error);
    }
  };

  const handleDeleteTweet = async (idToDelete) => {
    if (window.confirm("Delete this tweet?")) {
      try {
        await axios.delete(`${API_URL}/${idToDelete}`);
        setPosts((prev) => prev.filter((post) => post._id !== idToDelete && post.id !== idToDelete));
      } catch (error) {
        console.error('Error deleting tweet:', error);
      }
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const fetchTweets = async () => {
    try {
      const response = await axios.get(API_URL);
      const currentUsername = user?.username || user?.name || 'guest_user';
      
      // Keep initial liked state synced
      const formattedPosts = response.data.map((post) => {
        const likedArray = Array.isArray(post.likedBy) ? post.likedBy : [];
        return {
          ...post,
          isLikedByMe: likedArray.includes(currentUsername)
        };
      });
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
  };

  useEffect(() => {
    if (user) fetchTweets();
  }, [user]);

  const handleAddTweet = async (newTweetData) => {
    try {
      const tweetWithUser = {
        ...newTweetData,
        authorName: user.name,
        username: user.username
      };
      const response = await axios.post(API_URL, tweetWithUser);
      setPosts([response.data, ...posts]);
    } catch (error) {
      console.error('Error saving tweet:', error);
    }
  };

  const handleOpenSearch = () => {
    setCurrentView('home');
    setIsSearchOpen(true);
  };

  const displayedPosts = posts.filter((post) => {
    const text = post.text ? post.text.toLowerCase() : '';
    const name = post.authorName ? post.authorName.toLowerCase() : '';
    const username = post.username ? post.username.toLowerCase() : '';
    const query = searchTerm.toLowerCase();

    return text.includes(query) || name.includes(query) || username.includes(query);
  });

  return (
    <div className="bg-black text-white h-screen w-full select-none overflow-hidden">
      {!user ? (
        <AuthModal onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
      ) : (
        <div className="w-full max-w-[1280px] mx-auto flex h-full justify-start">
          <Sidebar 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
            user={user} 
            onLogout={handleLogout} 
          />

          <div className={`h-full border-x border-[#2f3336] ${
            currentView === 'messages' || currentView === 'games'
              ? 'flex-1 overflow-hidden' 
              : 'w-full sm:w-[600px] overflow-y-auto pb-16 md:pb-0'
          }`}>
            {currentView === 'home' && (
              <>
                <div className="flex flex-col bg-black/80 backdrop-blur-md border-b sticky top-0 border-[#2f3336] z-10">
                  <div className="flex">
                    <div 
                      onClick={() => setActiveTab('forYou')} 
                      className="w-1/2 flex justify-center py-3 font-bold cursor-pointer hover:bg-white/10 transition relative"
                    >
                      <span className={activeTab === 'forYou' ? 'text-white' : 'text-gray-500'}>For you</span>
                      {activeTab === 'forYou' && <div className="absolute bottom-0 w-16 h-1 bg-[#1d9bf0] rounded-full"></div>}
                    </div>

                    <div 
                      onClick={() => setActiveTab('following')} 
                      className="w-1/2 flex justify-center py-3 font-bold cursor-pointer hover:bg-white/10 transition relative"
                    >
                      <span className={activeTab === 'following' ? 'text-white' : 'text-gray-500'}>Following</span>
                      {activeTab === 'following' && <div className="absolute bottom-0 w-16 h-1 bg-[#1d9bf0] rounded-full"></div>}
                    </div>

                    <div className="flex items-center px-3 cursor-pointer hover:bg-white/10">
                      <IoMdSettings className="text-xl text-gray-300" />
                    </div>
                  </div>
                </div>

                <PostBox onAddTweet={handleAddTweet} />

                <div className="posts">
                  {displayedPosts.length > 0 ? (
                    displayedPosts.map((post) => (
                      <TweetCard 
                        key={post._id || post.id} 
                        post={post} 
                        currentUser={user}
                        onDelete={handleDeleteTweet} 
                        onLike={handleLikeTweet}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">No tweets found.</div>
                  )}
                </div>
              </>
            )}

            {currentView === 'messages' && (
              <Messages currentUser={user} />
            )}

            {/* 🎮 Cloud Games Hub Tab */}
            {currentView === 'games' && (
              <Games />
            )}

            {currentView === 'profile' && (
              <Profile 
                currentUser={user} 
                onUserUpdate={handleUserUpdate}
                onLike={handleLikeTweet} 
                onDelete={handleDeleteTweet} 
              />
            )}
          </div>

          {currentView !== 'messages' && currentView !== 'games' && (
            <div className="hidden lg:block w-[350px]">
              <RightSidebar 
                followSuggestions={[]} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
            </div>
          )}

          <BottomNav 
            isSearchOpen={isSearchOpen} 
            setIsSearchOpen={setIsSearchOpen} 
            currentView={currentView} 
            setCurrentView={setCurrentView}
            onSearchClick={handleOpenSearch}
          />
        </div>
      )}
    </div>
  );
};

export default App;