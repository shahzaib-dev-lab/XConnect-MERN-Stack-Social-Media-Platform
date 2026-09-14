import React from 'react';
import { BiHomeCircle, BiUser, BiGame } from 'react-icons/bi';
import { FiMail, FiSearch } from 'react-icons/fi';

const BottomNav = ({ currentView, setCurrentView, onSearchClick }) => {
  return (
    // Only visible on small screens (sm:hidden) at bottom of screen
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-[#2f3336] flex justify-around items-center py-2.5 z-50 sm:hidden">
      {/* Home Button */}
      <button
        onClick={() => setCurrentView('home')}
        className={`p-2 transition cursor-pointer ${
        currentView === 'home' ? 'text-[#1d9bf0]' : 'text-gray-400'}`} title="Home"> <BiHomeCircle className="text-2xl" />
      </button>

      {/* Search Button */}
      <button onClick={onSearchClick} className="p-2 text-gray-400 hover:text-white transition cursor-pointer"title="Search"> <FiSearch className="text-2xl" />
      </button>

      {/* Messages Button */}
      <button onClick={() => setCurrentView('messages')} className={`p-2 transition cursor-pointer ${ currentView === 'messages' ? 'text-[#1d9bf0]' : 'text-gray-400'
        }`} title="Messages"> <FiMail className="text-2xl" />
      </button>

      {/*Cloud Games Button */}
      <button onClick={() => setCurrentView('games')} className={`p-2 transition cursor-pointer ${ currentView === 'games' ? 'text-[#1d9bf0]' : 'text-gray-400'}`} title="Games"><BiGame className="text-2xl" />
      </button>

      {/* Profile Button */}
      <button onClick={() => setCurrentView('profile')} className={`p-2 transition cursor-pointer ${ currentView === 'profile' ? 'text-[#1d9bf0]' : 'text-gray-400'}`} title="Profile">
        <BiUser className="text-2xl" />
      </button>
    </div>
  );
};

export default BottomNav;