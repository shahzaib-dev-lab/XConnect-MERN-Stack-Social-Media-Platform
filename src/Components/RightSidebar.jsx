import React from 'react';
import { BiSearch } from 'react-icons/bi';

const RightSidebar = ({ searchTerm, setSearchTerm, followSuggestions = [] }) => {
  return (
    <div className="hidden lg:block w-[350px] pl-8 py-3 select-none">
      {/* Search Bar Input */}
      <div className="sticky top-0 bg-black pt-1 pb-3 z-10">
        <div className="flex items-center gap-3 bg-[#202327] px-4 py-2.5 rounded-full text-gray-400 focus-within:text-[#1d9bf0] focus-within:bg-black focus-within:border-[#1d9bf0] border border-transparent">
          <BiSearch className="text-xl flex-shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // <-- Ensure this line is present
            className="bg-transparent text-white text-sm focus:outline-none w-full placeholder-gray-500"
          />
        </div>
      </div>

      {/* Subscribe & Trends Box */}
      <div className="bg-[#16181c] rounded-2xl p-4 mb-4 border border-[#2f3336]">
        <h2 className="font-bold text-xl text-white mb-2">Subscribe to Premium</h2>
        <p className="text-gray-500 text-sm mb-3 leading-snug">
          Subscribe to unlock new features and if eligible, receive a share of ads revenue.
        </p>
        <button className="bg-[#1d9bf0] font-bold text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition cursor-pointer">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;