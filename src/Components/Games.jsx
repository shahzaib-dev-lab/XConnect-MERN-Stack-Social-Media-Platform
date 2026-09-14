import React, { useState } from 'react';
import { BiArrowBack, BiFullscreen, BiGame } from 'react-icons/bi';
const GAMES_LIST = [
  {
    id: 'subway-surfers',
    title: 'Subway Surfers',
    category: 'Endless Runner',
    description:
      'Run through the subway, dodge trains, collect coins and try to get the highest score.',
    thumbnail:
      'https://assets.games.gg/Subway_Surfers_Sequel_Launches_in_February_90b7ee7924.jpg',
    embedUrl:
      'https://www.madkidgames.com/full/subway-surfers',
    mobile: true,
  },

  {
    id: 'ten-trix',
    title: 'Ten Trix',
    category: 'Puzzle',
    description:
      'Place the blocks smartly, clear the board and try to beat your previous score.',
    thumbnail:
      'https://tcf.admeen.org/game/16500/16404/400x246/tentrix.jpg',
    embedUrl:
      'https://play.gamepix.com/tentrix/embed',
    mobile: true,
  },

  {
    id: '2048',
    title: '2048',
    category: 'Puzzle',
    description:
      'Merge matching numbers and keep the board under control until you reach 2048.',
    thumbnail:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    embedUrl:
      'https://play.gamepix.com/2048/embed',
    mobile: true,
  },

  {
    id: 'hextris',
    title: 'Hextris',
    category: 'Arcade',
    description:
      'Rotate the blocks, match them together and survive for as long as possible.',
    thumbnail:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuUd89_9j0DFag0-MR8Cp1RpiGVkGc9dwmrQGYI1HR0HKbVHvHR77i4aaG&s=100',
    embedUrl:
      'https://play.gamepix.com/hextris/embed',
    mobile: false,
  },

  {
    id: 'car-racing',
    title: 'Car Racing',
    category: 'Racing',
    description:
      'Race around the track, avoid other cars and try to finish without crashing.',
    thumbnail:
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80',
    embedUrl:
      'https://play.gamepix.com/car-racing/embed',
    mobile: false,
  },

  {
    id: 'snake',
    title: 'Snake',
    category: 'Retro',
    description:
      'Eat the food, grow your snake and avoid hitting yourself or the walls.',
    thumbnail:
      'https://agaronline.io/data/image/game/snake-snake.png',
    embedUrl:
      'https://play.gamepix.com/snake-game/embed',
    mobile: false,
  },

  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    category: 'Arcade',
    description:
      'Keep the bird in the air and fly through the pipes without hitting them.',
    thumbnail:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6psDJKVJpUF1uO4fuSC102RJo5m7hdhKaPfujyuEF9w&s=10',
    embedUrl:
      'https://play.gamepix.com/flappybird/embed',
    mobile: true,
  },

  {
    id: 'subway-princess-run',
    title: 'Subway Princess Run',
    category: 'Runner',
    description:
      'Run through the city, dodge obstacles and collect coins while going as far as possible.',
    thumbnail:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    embedUrl:
      'https://play.gamepix.com/subway-princess-run-1/embed',
    mobile: true,
  },
];

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <div className="flex flex-col h-full bg-black text-white w-full overflow-hidden">

      {/* Top bar */}
      <div className="p-3 sm:p-4 border-b border-[#2f3336] bg-black/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedGame && (
            <button
              onClick={() => setSelectedGame(null)}
              className="p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer text-gray-300 hover:text-white"
              title="Back to Games"><BiArrowBack className="text-xl" />
            </button>
          )}
            <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              {!selectedGame && (
                <BiGame className="text-[#1d9bf0] text-xl" />
              )}
              {selectedGame
                ? selectedGame.title
                : 'Cloud Games Hub'}
            </h2>
            <p className="text-[11px] text-gray-400"> 
              {selectedGame
                ? selectedGame.category
                : 'Play free browser games instantly'} </p>
          </div>
        </div>
        {/* Opens the game directly in a new tab */}
        {selectedGame && (
          <a href={selectedGame.embedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#1d9bf0] hover:underline"><BiFullscreen className="text-sm" />Open Game </a>)}
      </div>
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {selectedGame ? (
          // Game screen
          <div className="w-full h-[calc(100vh-140px)] flex items-center justify-center">
            {selectedGame.mobile ? (
              // Portrait layout for mobile-friendly games
              <div
                className="relative h-full max-h-[820px] aspect-[9/16] w-auto  max-w-full  bg-black overflow-hidden rounded-2xl border border-[#2f3336] shadow-2xl">
                <iframe src={selectedGame.embedUrl} title={selectedGame.title} className="absolute inset-0 w-full h-full border-0" allow=" autoplay; fullscreen; accelerometer; gyroscope; gamepad; picture-in-picture; orientation-lock" allowFullScreen/>
              </div>
            ) : (
              // Normal landscape layout for desktop games
              <div
                className="relative w-full h-full  bg-black overflow-hidden rounded-2xl border border-[#2f3336] shadow-2xl">
                <iframe src={selectedGame.embedUrl} title={selectedGame.title} className="absolute inset-0 w-full h-full border-0" allow=" autoplay; fullscreen; accelerometer; gyroscope; gamepad; picture-in-picture" allowFullScreen/>
              </div>
            )}
          </div>
        ) : (
          // Game cards
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-28 sm:pb-8">
            {GAMES_LIST.map((game) => (
              <div key={game.id} className=" bg-[#16181c] border border-[#2f3336] rounded-2xl p-4 hover:border-[#1d9bf0] hover:bg-white/5 transition flex flex-col justify-between group">
                <div>
                {/* Game thumbnail */}
                <div className="w-full h-32 bg-[#202327] rounded-xl overflow-hidden mb-3">
                    <img src={game.thumbnail} alt={game.title} className=" w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80 group-hover:opacity-100"/>
                  </div>
                  {/* Game name and category */}
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-base group-hover:text-[#1d9bf0] transition">{game.title} </h3>
                    <span className="text-[10px] whitespace-nowrap bg-[#2f3336] text-gray-300 px-2 py-0.5 rounded-full"> {game.category} </span>
                  </div>
                  {/* Short description */}
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4"> {game.description}</p>
                </div>
                {/* Start the selected game */}
                <button onClick={() => setSelectedGame(game)} className="w-full  bg-[#1d9bf0]  text-white py-2 rounded-full old text-xs hover:bg-[#168bd5] transition cursor-pointer"> Play Game</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;