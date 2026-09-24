import React from 'react';
import {
  FaRegComment,
  FaRetweet,
  FaRegHeart,
  FaHeart,
  FaRegBookmark,
  FaTrashAlt
} from 'react-icons/fa';
import { FiShare } from 'react-icons/fi';

const TweetCard = ({
  post,
  currentUser,
  onDelete,
  onLike,
  hideActions = false
}) => {

  const isOwner = currentUser && (
    (post.username &&
      currentUser.username &&
      post.username.toLowerCase() ===
      currentUser.username.toLowerCase()) ||

    (post.authorName &&
      currentUser.name &&
      post.authorName.toLowerCase() ===
      currentUser.name.toLowerCase())
  );


  // ======================================================
  // MEDIA
  // ======================================================

  // New media system
  const mediaUrl = post.mediaUrl || null;
  const mediaType = post.mediaType || null;

  // Old posts compatibility
  const oldImage = post.image || null;


  return (

    <div className="border-b border-[#2f3336] p-3 sm:p-4 hover:bg-white/[0.02] transition duration-200 bg-black">

      <div className="flex gap-3">


        {/* ==================================================
            USER AVATAR
        ================================================== */}

        <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center font-bold text-white uppercase flex-shrink-0 text-sm overflow-hidden">

          {(post.avatar ||
            (isOwner && currentUser?.avatar)) ? (

            <img
              src={
                post.avatar ||
                currentUser?.avatar
              }
              alt={post.authorName}
              className="w-full h-full object-cover"
            />

          ) : (

            post.authorName
              ? post.authorName.charAt(0)
              : 'U'

          )}

        </div>


        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="flex-1 min-w-0">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-1.5 flex-wrap text-sm">

              <span className="font-bold text-white hover:underline cursor-pointer">

                {post.authorName || 'Anonymous'}

              </span>


              <span className="text-gray-500 text-xs">

                @{post.username || 'user'}

              </span>


              <span className="text-gray-500 text-xs">
                ·
              </span>


              <span className="text-gray-500 text-xs">

                {post.createdAt
                  ? new Date(
                      post.createdAt
                    ).toLocaleDateString()
                  : 'Just now'}

              </span>

            </div>


            {/* DELETE */}

            {hideActions && isOwner && (

              <button

                onClick={() =>
                  onDelete(
                    post._id || post.id
                  )
                }

                className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-red-500/10 transition cursor-pointer"

                title="Delete Tweet"

              >

                <FaTrashAlt className="text-sm" />

              </button>

            )}

          </div>


          {/* ==================================================
              TEXT
          ================================================== */}

          {post.text && (

            <p className="text-white text-sm sm:text-base mt-1 whitespace-pre-line leading-normal break-words">

              {post.text}

            </p>

          )}


          {/* ==================================================
              NEW VIDEO
          ================================================== */}

          {mediaUrl &&
            mediaType === 'video' && (

              <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336] bg-black">

                <video

                  src={mediaUrl}

                  controls

                  playsInline

                  preload="metadata"

                  className="w-full max-h-[500px] object-contain"

                />

              </div>

          )}


          {/* ==================================================
              NEW IMAGE
          ================================================== */}

          {mediaUrl &&
            mediaType === 'image' && (

              <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336] max-h-[500px]">

                <img

                  src={mediaUrl}

                  alt="Post attachment"

                  className="w-full h-auto max-h-[500px] object-contain"

                />

              </div>

          )}


          {/* ==================================================
              OLD IMAGE POSTS
              Backward compatibility
          ================================================== */}

          {!mediaUrl && oldImage && (

            <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336] max-h-[500px]">

              <img

                src={oldImage}

                alt="Tweet Attachment"

                className="w-full h-auto max-h-[500px] object-contain"

              />

            </div>

          )}


          {/* ==================================================
              ACTIONS
          ================================================== */}

          {!hideActions && (

            <div className="flex items-center justify-between text-gray-500 text-xs sm:text-sm mt-3 pt-1 max-w-md pr-4">


              {/* COMMENT */}

              <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition cursor-pointer group">

                <FaRegComment className="group-hover:bg-[#1d9bf0]/10 rounded-full p-1 text-2xl" />

                <span>0</span>

              </button>


              {/* RETWEET */}

              <button className="flex items-center gap-1.5 hover:text-green-500 transition cursor-pointer group">

                <FaRetweet className="group-hover:bg-green-500/10 rounded-full p-1 text-2xl" />

                <span>0</span>

              </button>


              {/* LIKE */}

              <button

                onClick={() =>
                  onLike(
                    post._id || post.id
                  )
                }

                className={`flex items-center gap-1.5 transition cursor-pointer group ${
                  post.isLikedByMe
                    ? 'text-pink-600'
                    : 'hover:text-pink-600'
                }`}

              >

                {post.isLikedByMe ? (

                  <FaHeart className="text-pink-600 text-sm sm:text-base" />

                ) : (

                  <FaRegHeart className="group-hover:bg-pink-600/10 rounded-full p-1 text-2xl" />

                )}


                <span
                  className={
                    post.isLikedByMe
                      ? 'text-pink-600 font-semibold'
                      : ''
                  }
                >

                  {post.likes || 0}

                </span>

              </button>


              {/* BOOKMARK */}

              <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition cursor-pointer group">

                <FaRegBookmark className="group-hover:bg-[#1d9bf0]/10 rounded-full p-1 text-2xl" />

              </button>


              {/* SHARE */}

              <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition cursor-pointer group">

                <FiShare className="group-hover:bg-[#1d9bf0]/10 rounded-full p-1 text-2xl" />

              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );

};

export default TweetCard;