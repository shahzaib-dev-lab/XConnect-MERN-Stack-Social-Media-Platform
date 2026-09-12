import React, { useState, useRef } from 'react';
import { 
  RiImage2Line, 
  RiFileGifLine, 
  RiBarChartGroupedLine, 
  RiEmotionLine, 
  RiCalendarScheduleLine, 
  RiMapPinLine,
  RiCloseLine
} from 'react-icons/ri';

const PostBox = ({ onAddTweet }) => {
  const [tweetText, setTweetText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Compressed Image Converter (Canvas Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleFactor = MAX_WIDTH / img.width;
          
          if (img.width > MAX_WIDTH) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleFactor;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Compress image to JPEG quality 0.7
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tweetText.trim() && !imagePreview) return;
    
    onAddTweet({
      text: tweetText.trim(),
      image: imagePreview || null,
    });

    setTweetText('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="border-b border-[#2f3336] p-3 sm:p-4 select-none bg-black">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center font-bold text-white uppercase flex-shrink-0 text-sm">
          SS
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            placeholder="What's on your mind ?"
            className="w-full bg-transparent text-white text-base sm:text-lg focus:outline-none resize-none placeholder-gray-500 min-h-[60px]"
            rows="2"
          />

          {imagePreview && (
            <div className="relative mb-3 rounded-2xl overflow-hidden max-h-80 border border-[#2f3336]">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full transition cursor-pointer"
              >
                <RiCloseLine className="text-xl" />
              </button>
              <img src={imagePreview} alt="Upload preview" className="w-full h-auto max-h-80 object-cover" />
            </div>
          )}

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
          />

          <div className="flex items-center justify-between border-t border-[#2f3336] pt-3 mt-1 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3 text-[#1d9bf0] text-lg overflow-x-auto no-scrollbar">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-[#1d9bf0]/10 rounded-full transition cursor-pointer text-[#1d9bf0]"
              >
                <RiImage2Line />
              </button>
              <button type="button" className="p-1.5 hover:bg-[#1d9bf0]/10 rounded-full transition"><RiFileGifLine /></button>
              <button type="button" className="p-1.5 hover:bg-[#1d9bf0]/10 rounded-full transition"><RiBarChartGroupedLine /></button>
              <button type="button" className="p-1.5 hover:bg-[#1d9bf0]/10 rounded-full transition"><RiEmotionLine /></button>
              <button type="button" className="p-1.5 hover:bg-[#1d9bf0]/10 rounded-full transition"><RiCalendarScheduleLine /></button>
              <button type="button" className="p-1.5 hover:bg-[#1d9bf0]/10 rounded-full transition opacity-50 cursor-not-allowed"><RiMapPinLine /></button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!tweetText.trim() && !imagePreview}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition ${
                tweetText.trim() || imagePreview
                  ? 'bg-[#1d9bf0] text-white hover:bg-blue-600 cursor-pointer'
                  : 'bg-[#1d9bf0]/50 text-white/50 cursor-not-allowed'
              }`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostBox;