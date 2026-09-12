import React from 'react';
import { RiTwitterXLine } from 'react-icons/ri';
import { BiHomeCircle, BiUser, BiLogOut, BiGame } from 'react-icons/bi';
import { FiMail } from 'react-icons/fi';

const Sidebar = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    // Mobile screen par completely 'hidden' rakha hai. Only 'sm:' (640px+) screen se show hoga.
    <div className="hidden sm:flex flex-col justify-between h-screen sticky top-0 w-16 xl:w-64 p-2 xl:p-4 select-none flex-shrink-0">
      <div className="flex flex-col items-center xl:items-start space-y-2">
        {/* Twitter/X Logo */}
        <div 
          onClick={() => setCurrentView('home')} 
          className="p-3 hover:bg-white/10 rounded-full cursor-pointer text-2xl text-white my-1"
        >
          <RiTwitterXLine />
        </div>

        {/* Home Navigation */}
        <div
          onClick={() => setCurrentView('home')}
          className={`flex items-center gap-4 p-3 hover:bg-white/10 rounded-full cursor-pointer w-full text-xl transition ${
            currentView === 'home' ? 'font-bold text-white' : 'text-gray-400'
          }`}
        >
          <BiHomeCircle className="text-2xl flex-shrink-0" />
          <span className="hidden xl:inline text-base">Home</span>
        </div>

        {/* Messages Navigation */}
        <div
          onClick={() => setCurrentView('messages')}
          className={`flex items-center gap-4 p-3 hover:bg-white/10 rounded-full cursor-pointer w-full text-xl transition ${
            currentView === 'messages' ? 'font-bold text-white' : 'text-gray-400'
          }`}
        >
          <FiMail className="text-2xl flex-shrink-0" />
          <span className="hidden xl:inline text-base">Messages</span>
        </div>

        {/* Games Navigation (Fixed to setCurrentView) */}
        <div
          onClick={() => setCurrentView('games')}
          className={`flex items-center gap-4 p-3 hover:bg-white/10 rounded-full cursor-pointer w-full text-xl transition ${
            currentView === 'games' ? 'font-bold text-white' : 'text-gray-400'
          }`}
        >
          <BiGame className="text-2xl flex-shrink-0" />
          <span className="hidden xl:inline text-base">Games</span>
        </div>

        {/* Profile Navigation */}
        <div
          onClick={() => setCurrentView('profile')}
          className={`flex items-center gap-4 p-3 hover:bg-white/10 rounded-full cursor-pointer w-full text-xl transition ${
            currentView === 'profile' ? 'font-bold text-white' : 'text-gray-400'
          }`}
        >
          <BiUser className="text-2xl flex-shrink-0" />
          <span className="hidden xl:inline text-base">Profile</span>
        </div>
      </div>

      {/* Logged in User Footer & Logout */}
      {user && (
        <div className="flex items-center justify-between p-2 hover:bg-white/10 rounded-full w-full">
          <div 
            onClick={() => setCurrentView('profile')}
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center font-bold text-white uppercase text-sm flex-shrink-0">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden xl:block truncate">
              <p className="font-bold text-sm text-white truncate leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log out"
            className="text-gray-400 hover:text-red-500 p-2 transition cursor-pointer"
          >
            <BiLogOut className="text-xl" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;