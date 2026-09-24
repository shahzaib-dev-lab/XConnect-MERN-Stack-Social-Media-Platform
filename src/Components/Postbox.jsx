import React, { useState } from 'react';
import { CiImageOn } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";

const Postbox = ({ onAddTweet, user }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!text && !image)
    return;
    onAddTweet({ text, image });
    setText('');
    setImage(null);
  };

  // Check Local Storage or Prop Avatar
  const userAvatar = user?.avatar || JSON.parse(localStorage.getItem('user'))?.avatar;

  return (
    <div className="p-3 sm:p-4 border-b border-[#2f3336] bg-black">
      <div className="flex gap-3">
        {/* 📸 User Avatar Circle */}
        <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center font-bold text-white uppercase flex-shrink-0 overflow-hidden text-sm">

          {userAvatar ? (
            <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.name ? user.name.charAt(0) : 'U'
          )}
        </div>

        <div className="flex-1">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What's on your mind ?" className="w-full bg-transparent text-white text-base sm:text-lg focus:outline-none resize-none min-h-[60px]"/>

          {image && (
            <div className="relative mb-3 rounded-xl overflow-hidden max-h-60 border border-[#2f3336]">
              <img src={image} alt="Upload preview" className="w-full h-full object-cover" />
              <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 text-xs">✕</button>
            </div>
          )}
          
          <div className="flex justify-between items-center border-t border-[#2f3336] pt-3">
            <div className="flex gap-3 text-[#1d9bf0] text-xl">
              <label className="cursor-pointer hover:bg-[#1d9bf0]/10 p-1.5 rounded-full transition">
                <CiImageOn />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /> </label>
              <button className="hover:bg-[#1d9bf0]/10 p-1.5 rounded-full transition cursor-pointer"> <IoLocationOutline /> </button>
            </div>
            <button onClick={handleSubmit} disabled={!text && !image} className="bg-[#1d9bf0] text-white font-bold px-4 py-1.5 rounded-full hover:bg-[#1a8cd8] transition disabled:opacity-50 cursor-pointer text-sm">Post</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Postbox;