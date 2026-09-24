import React, { useState } from 'react';
import { CiImageOn } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";

const Postbox = ({ onAddTweet, user }) => {

  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);

  // ======================================================
  // MEDIA UPLOAD
  // ======================================================

  const handleMediaUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;


    // ==========================================
    // ALLOW ONLY IMAGE / VIDEO
    // ==========================================

    if (
      !file.type.startsWith('image/') &&
      !file.type.startsWith('video/')
    ) {

      alert('Please select an image or video.');

      e.target.value = '';

      return;
    }


    // ==========================================
    // VIDEO SIZE LIMIT
    // ==========================================

    if (
      file.type.startsWith('video/') &&
      file.size > 15 * 1024 * 1024
    ) {

      alert('Video size must be 15MB or less.');

      e.target.value = '';

      return;
    }


    // ==========================================
    // IMAGE SIZE LIMIT
    // ==========================================

    if (
      file.type.startsWith('image/') &&
      file.size > 10 * 1024 * 1024
    ) {

      alert('Image size must be 10MB or less.');

      e.target.value = '';

      return;
    }


    // ==========================================
    // FILE READER
    // ==========================================

    const reader = new FileReader();


    reader.onloadend = () => {

      setMedia({

        url: reader.result,

        type: file.type.startsWith('video/')
          ? 'video'
          : 'image',

        name: file.name

      });

    };


    reader.readAsDataURL(file);

  };


  // ======================================================
  // REMOVE MEDIA
  // ======================================================

  const removeMedia = () => {

    setMedia(null);

  };


  // ======================================================
  // SUBMIT POST
  // ======================================================

  const handleSubmit = () => {

    if (!text.trim() && !media) {
      return;
    }


    onAddTweet({

      text: text,

      // New media system
      mediaUrl: media?.url || null,

      mediaType: media?.type || null,

      // Keep image field for compatibility
      image:
        media?.type === 'image'
          ? media.url
          : null

    });


    // Reset
    setText('');
    setMedia(null);

  };


  // ======================================================
  // USER AVATAR
  // ======================================================

  const userAvatar =
    user?.avatar ||
    JSON.parse(
      localStorage.getItem('user')
    )?.avatar;


  // ======================================================
  // UI
  // ======================================================

  return (

    <div className="p-3 sm:p-4 border-b border-[#2f3336] bg-black">

      <div className="flex gap-3">


        {/* USER AVATAR */}

        <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center font-bold text-white uppercase flex-shrink-0 overflow-hidden text-sm">

          {userAvatar ? (

            <img
              src={userAvatar}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />

          ) : (

            user?.name
              ? user.name.charAt(0)
              : 'U'

          )}

        </div>


        <div className="flex-1">


          {/* TEXT AREA */}

          <textarea

            value={text}

            onChange={(e) =>
              setText(e.target.value)
            }

            placeholder="What's on your mind ?"

            className="w-full bg-transparent text-white text-base sm:text-lg focus:outline-none resize-none min-h-[60px]"

          />


          {/* ==================================================
              MEDIA PREVIEW
          ================================================== */}

          {media && (

            <div className="relative mb-3 rounded-xl overflow-hidden border border-[#2f3336] max-h-96 bg-black">


              {/* IMAGE PREVIEW */}

              {media.type === 'image' && (

                <img
                  src={media.url}
                  alt="Upload preview"
                  className="w-full max-h-96 object-contain"
                />

              )}


              {/* VIDEO PREVIEW */}

              {media.type === 'video' && (

                <video
                  src={media.url}
                  controls
                  className="w-full max-h-96 object-contain"
                />

              )}


              {/* REMOVE BUTTON */}

              <button

                onClick={removeMedia}

                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition cursor-pointer"

                title="Remove media"

              >

                ✕

              </button>

            </div>

          )}


          {/* ==================================================
              BOTTOM BAR
          ================================================== */}

          <div className="flex justify-between items-center border-t border-[#2f3336] pt-3">


            {/* MEDIA / LOCATION */}

            <div className="flex gap-3 text-[#1d9bf0] text-xl">


              {/* IMAGE + VIDEO */}

              <label

                className="cursor-pointer hover:bg-[#1d9bf0]/10 p-1.5 rounded-full transition"

                title="Add photo or video"

              >

                <CiImageOn />

                <input

                  type="file"

                  accept="image/*,video/*"

                  onChange={handleMediaUpload}

                  className="hidden"

                />

              </label>


              {/* LOCATION */}

              <button

                className="hover:bg-[#1d9bf0]/10 p-1.5 rounded-full transition cursor-pointer"

                title="Add location"

              >

                <IoLocationOutline />

              </button>

            </div>


            {/* POST BUTTON */}

            <button

              onClick={handleSubmit}

              disabled={!text.trim() && !media}

              className="bg-[#1d9bf0] text-white font-bold px-4 py-1.5 rounded-full hover:bg-[#1a8cd8] transition disabled:opacity-50 cursor-pointer text-sm"

            >

              Post

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default Postbox;