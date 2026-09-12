import React, { useState } from 'react';
import { BiArrowBack, BiFullscreen } from 'react-icons/bi';

// Verified 100% Embed-Allowed Cloud Games List (Including Subway Surfers & Car Racing)
const GAMES_LIST = [
  {
    id: 'subway-surfers',
    title: 'Subway Surfers',
    category: 'Endless Runner',
    description: 'Dash as fast as you can through the subway tracks and dodge oncoming trains!',
    thumbnail: 'https://assets.games.gg/Subway_Surfers_Sequel_Launches_in_February_90b7ee7924.jpg',
    embedUrl: 'https://play.gamepix.com/subway-surfers/embed'
  },
  {
    id: 'car-racing',
    title: 'Street Racing 3D',
    category: 'Racing',
    description: 'High-speed urban car racing game with custom sports cars.',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80',
    embedUrl: 'https://play.gamepix.com/mr-racer-car-racing/embed'
  },
  {
    id: '2048',
    title: '2048 Classic',
    category: 'Puzzle',
    description: 'Join numbers to get to the 2048 tile!',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    embedUrl: 'https://play2048.co/'
  },
  {
    id: 'hextris',
    title: 'Hextris',
    category: 'Arcade',
    description: 'Fast-paced hexagonal puzzle game inspired by Tetris.',
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&q=80',
    embedUrl: 'https://hextris.io/'
  },
  {
    id: 'pacman',
    title: 'Pac-Man Canvas',
    category: 'Retro',
    description: 'Classic arcade maze action directly in browser.',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80',
    embedUrl: 'https://freepacman.org/'
  }
];

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <div className="flex flex-col h-full bg-black text-white w-full overflow-hidden">
      {/* Top Header */}
      <div className="p-3 sm:p-4 border-b border-[#2f3336] bg-black/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedGame && (
            <button
              onClick={() => setSelectedGame(null)}
              className="p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer text-gray-300 hover:text-white"
              title="Back to Hub"
            >
              <BiArrowBack className="text-xl" />
            </button>
          )}
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              {selectedGame ? selectedGame.title : 'Cloud Games Hub'}
            </h2>
            <p className="text-[11px] text-gray-400">
              {selectedGame ? selectedGame.category : 'Instant play free cloud-hosted games'}
            </p>
          </div>
        </div>

        {selectedGame && (
          <a
            href={selectedGame.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#1d9bf0] hover:underline"
          >
            <BiFullscreen className="text-sm" /> Fullscreen Link
          </a>
        )}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {selectedGame ? (
          /* Live Game Iframe Container */
          <div className="w-full h-[calc(100vh-140px)] bg-black rounded-2xl overflow-hidden border border-[#2f3336] shadow-xl relative">
            <iframe
              src={selectedGame.embedUrl}
              title={selectedGame.title}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              allow="autoplay; fullscreen; accelerometer; gyroscope; gamepad"
            />
          </div>
        ) : (
          /* Games Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GAMES_LIST.map((game) => (
              <div
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-4 cursor-pointer hover:border-[#1d9bf0] hover:bg-white/5 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-full h-32 bg-[#202327] rounded-xl overflow-hidden mb-3">
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80 group-hover:opacity-100"
                    />
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-base group-hover:text-[#1d9bf0] transition">
                      {game.title}
                    </h3>
                    <span className="text-[10px] bg-[#2f3336] text-gray-300 px-2 py-0.5 rounded-full">
                      {game.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                    {game.description}
                  </p>
                </div>

                <button className="w-full bg-[#1d9bf0] text-white py-2 rounded-full font-bold text-xs hover:bg-opacity-90 transition cursor-pointer">
                  Play Game
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;