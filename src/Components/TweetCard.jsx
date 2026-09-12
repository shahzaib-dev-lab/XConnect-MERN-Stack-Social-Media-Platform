import React from 'react';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { BiTrash, BiMessageRounded, BiRepost, BiShare } from 'react-icons/bi';

const TweetCard = ({ post, onDelete, onLike }) => {
  const isLiked = post.isLikedByMe || false;

  return (
    <div className="p-4 border-b border-[#2f3336] hover:bg-white/[0.02] transition select-none">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center font-bold text-white uppercase text-sm flex-shrink-0">
          {post.authorName ? post.authorName.charAt(0) : 'U'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-white text-sm truncate">{post.authorName || 'User'}</span>
              <span className="text-gray-500 text-xs truncate">@{post.username || 'user'}</span>
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(post._id || post.id)}
                className="text-gray-500 hover:text-red-500 p-1 rounded-full transition cursor-pointer"
              >
                <BiTrash className="text-base" />
              </button>
            )}
          </div>

          {post.text && <p className="text-white text-sm mt-1 leading-normal break-words">{post.text}</p>}

          {post.image && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336] max-h-96">
              <img src={post.image} alt="Tweet media" className="w-full h-auto object-cover max-h-96" />
            </div>
          )}

          <div className="flex justify-between items-center text-gray-500 text-sm mt-3 max-w-md">
            <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition cursor-pointer">
              <BiMessageRounded className="text-lg" />
            </button>

            <button className="flex items-center gap-1.5 hover:text-green-500 transition cursor-pointer">
              <BiRepost className="text-lg" />
            </button>

            {/* Red Heart Toggle Button */}
            <button
              onClick={() => onLike(post._id || post.id)}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                isLiked ? 'text-pink-600' : 'hover:text-pink-600'
              }`}
            >
              {isLiked ? (
                <AiFillHeart className="text-lg text-pink-600" />
              ) : (
                <AiOutlineHeart className="text-lg" />
              )}
              {post.likes > 0 && <span className="text-xs">{post.likes}</span>}
            </button>

            <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition cursor-pointer">
              <BiShare className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetCard;