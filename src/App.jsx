import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Components/Sidebar';
import { IoMdSettings } from 'react-icons/io';
import PostBox from './Components/Postbox';
import TweetCard from './Components/TweetCard';
import RightSidebar from './Components/RightSidebar';
import BottomNav from './Components/BottomNav';
import Messages from './Components/Messages';
import Profile from './Components/Profile';
import AuthModal from './Components/AuthModal';
import Games from './Components/Games';
import { io } from "socket.io-client";
const API_URL = "https://xconnect-mern-stack-social-media-platform-production.up.railway.app";
const socket = io("https://xconnect-mern-stack-social-media-platform-production.up.railway.app", {
  transports: ["websocket", "polling"],
  withCredentials: true
});
const App = () => {
  // =====================================================
  // USER
  const [user, setUser] = useState(null);
  // =====================================================
  // POSTS
  const [posts, setPosts] = useState([]);

  // UI STATES
  // =====================================================
  const [activeTab, setActiveTab] = useState('forYou');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  // LOAD USER FROM LOCAL STORAGE
  // =====================================================
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading saved user:', error);

      localStorage.removeItem('user');
    }
  }, []);

  // =====================================================
  // FETCH TWEETS

  const fetchTweets = async () => {
    try {
      const response = await axios.get("https://xconnect-mern-stack-social-media-platform-production.up.railway.app/api/tweets");

      const currentUsername =
        user?.username ||
        user?.name ||
        'guest_user';

      const formattedPosts = (
        Array.isArray(response.data)
          ? response.data
          : []
      ).map((post) => {
        const likedArray = Array.isArray(
          post.likedBy
        )
          ? post.likedBy
          : [];

        return {
          ...post,
          isLikedByMe:
            likedArray.includes(currentUsername),
        };
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error(
        'Error fetching tweets:',
        error
      );
      setPosts([]);
    }
  };
  // FETCH TWEETS WHEN USER IS AVAILABLE
  // =====================================================
  useEffect(() => {
    if (user) {
      fetchTweets();
    }
  }, [user]);

  // CREATE TWEET
  // =====================================================
const handleAddTweet = async (newTweetData) => {
  const tweetText = typeof newTweetData === 'string' ? newTweetData : newTweetData?.text || '';
  const tweetImage = typeof newTweetData === 'object' ? newTweetData?.image || null : null;
  const tweetVideo = typeof newTweetData === 'object' ? newTweetData?.video || null : null;

  if (!tweetText.trim() && !tweetVideo && !tweetImage) {
    return;
  }

  const payload = {
    text: tweetText,
    image: tweetImage,
    video:tweetVideo,
    authorName: user?.name || 'Shahzaib',
    username: user?.username || 'shahzaib-dev-lab',
    avatar: user?.avatar || null
  };

  console.log('POST PAYLOAD:', {
    text: payload.text,
    video: payload.video,
    mediaLength: payload.mediaUrl?.length || 0
  });

try {
    const response = await axios.post(`${API_URL}/api/tweets`, payload);
    const newPost = { ...response.data, isLikedByMe: false };
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  } catch (error) {
    console.error('Error saving tweet:', error.response?.data || error);
  }
};

  // LIKE / UNLIKE TWEET
  // =====================================================
  const handleLikeTweet = async ( idToLike ) => {
    const currentUsername =
      user?.username ||
      user?.name ||
      'guest_user';

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (
          post._id === idToLike ||
          post.id === idToLike
        ) {
          const isCurrentlyLiked =
            post.isLikedByMe || false;

          return {
            ...post,

            isLikedByMe: !isCurrentlyLiked,

            likes: isCurrentlyLiked ? Math.max( 0,
              (post.likes || 0) - 1 ) : (post.likes || 0) + 1,
          };
        }

        return post;
      })
    );

    try {
    await axios.put(
  `${API_URL}/api/tweets/${idToLike}/like`,
  {
    userId: currentUsername,
  }
);
    } catch (error) {
      console.error(
        'Error syncing like with server:',
        error
      );
    }
  };

  // =====================================================
  // DELETE TWEET
  const handleDeleteTweet = async ( idToDelete ) => {
    if (
      !window.confirm(
        'Delete this post?'
      )
    ) {
      return;
    }

    try {
     await axios.delete(
  `${API_URL}/api/tweets/${idToDelete}`
);

      setPosts((prev) =>
        prev.filter(
          (post) =>
            post._id !== idToDelete &&
            post.id !== idToDelete
        )
      );
    } catch (error) {
      console.error(
        'Error deleting tweet:',
        error
      );
    }
  };
  // UPDATE USER / PROFILE
  // =====================================================
  const handleUserUpdate = (
    updatedUser
  ) => {
    console.log('Updated user:', updatedUser);
    console.log( 'Updated avatar:', updatedUser?.avatar);
    // React state update
    setUser(updatedUser);
    // Persistent update
    localStorage.setItem('user', JSON.stringify(updatedUser));};
  // LOGIN
  // =====================================================

  const handleLoginSuccess = (
    loggedInUser
  ) => { 
    console.log('Login user:', loggedInUser);
    console.log('Login avatar:', loggedInUser?.avatar);
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));};
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPosts([]);
    setCurrentView('home');
  };
  // SEARCH
  // =====================================================
  const handleOpenSearch = () => {
    setCurrentView('home');
    setIsSearchOpen(true);
  };
  // DISPLAYED POSTS
  // =====================================================

  const displayedPosts = posts.filter((post) => {
      const text =
        post.text ?.toLowerCase() || '';

      const name = post.authorName ?.toLowerCase() || '';
      const username = post.username ?.toLowerCase() || '';
      const query = searchTerm.toLowerCase();
      return ( text.includes(query) || name.includes(query) || username.includes(query));
    });

  // RENDER
  // =====================================================

  return (
    <div className="bg-black text-white h-screen w-full select-none overflow-hidden">
      {!user ? (
         <AuthModal onLoginSuccess={ handleLoginSuccess } />
          ) : (
        <div className="w-full max-w-[1280px] mx-auto flex h-full justify-start">

          {/*SIDEBAR*/}
          <Sidebar currentView={currentView} setCurrentView={ setCurrentView } user={user} onLogout={handleLogout} />

          {/*MAIN CONTENT*/}
          <div className={`h-full border-x border-[#2f3336] ${
             currentView ==='messages' 
             || currentView === 'games' 
             || currentView === 'profile' ? 'flex-1 overflow-hidden' : 'w-full sm:w-[600px] overflow-y-auto no-scrollbar pb-16 md:pb-0'}`}>

            {/*HOME*/}
            {currentView === 'home' && (
              <>
                {/* HEADER */}
                <div className="flex flex-col bg-black/80 backdrop-blur-md border-b sticky top-0 border-[#2f3336] z-10">
                <div className="flex">
                <div onClick={() =>
                  setActiveTab('forYou')} className="w-1/2 flex justify-center py-3 font-bold cursor-pointer hover:bg-white/10 transition relative">
                      <span className={ activeTab ==='forYou'? 'text-white' : 'text-gray-500'}>
                        For you
                      </span>
                      {activeTab === 'forYou' && (
                        <div className="absolute bottom-0 w-16 h-1 bg-[#1d9bf0] rounded-full" />
                        )}
                    </div>
                    <div onClick={() => setActiveTab ('following')}className="w-1/2 flex justify-center py-3 font-bold cursor-pointer hover:bg-white/10 transition relative">
                      <span className={ activeTab ==='following' ? 'text-white' : 'text-gray-500'}>
                        Following
                      </span>
                      {activeTab === 'following' && (
                      <div className="absolute bottom-0 w-16 h-1 bg-[#1d9bf0] rounded-full" />
                      )}
                    </div>

                    <div className="flex items-center px-3 cursor-pointer hover:bg-white/10">
                      <IoMdSettings className="text-xl text-gray-300" />
                    </div>
                  </div>
                </div>

                {/* POST BOX */}

                <PostBox onAddTweet={ handleAddTweet }user={user} />
                {/* POSTS */}
                <div className="posts">{displayedPosts.length > 0 ? (displayedPosts.map((post) => (
                        <TweetCard key={post._id || post.id } post={post}
                         currentUser={user} onDelete={
                         handleDeleteTweet } onLike={ handleLikeTweet}/>
                        ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No Posts found.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* MESSAGES*/}
            {currentView === 'messages' && (
              <Messages currentUser={user} currentUsername = { user?.username || user?.userName || user?.name || ''}/>
            )}
            {/*GAMES*/}
            {currentView === 'games' && <Games />}
            {/*PROFILE */}
            {currentView ===  'profile' && (
              <Profile currentUser={user} onUserUpdate={ handleUserUpdate } onLike={ handleLikeTweet } onDelete={ handleDeleteTweet}
                setCurrentView={setCurrentView }/>
            )}
          </div>
          {/*RIGHT SIDEBAR*/}

          {currentView !=='messages' && currentView !== 'games' && currentView !== 'profile' && (
              <div className="hidden lg:block w-[350px]">
                <RightSidebar followSuggestions={[]} searchTerm={ searchTerm} setSearchTerm={ setSearchTerm }/>
              </div>
            )}
          {/*BOTTOM NAV*/}
          <BottomNav isSearchOpen={ isSearchOpen } setIsSearchOpen={setIsSearchOpen} currentView={currentView } setCurrentView={setCurrentView} onSearchClick={handleOpenSearch } />
        </div>
      )}
    </div>
  );
};

export default App;