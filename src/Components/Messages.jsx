import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BiTrash, BiSend, BiUserPlus, BiX } from 'react-icons/bi';

const API_MESSAGES_URL = 'http://localhost:5000/api/messages';

const Messages = ({ currentUser }) => {
  const currentUsername = (currentUser?.username || currentUser?.name || 'guest_user').toLowerCase().trim();
  const STORAGE_KEY = `pulse_chat_contacts_${currentUsername}`;

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeReceiver, setActiveReceiver] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length > 0 ? parsed[0] : '';
  });

  const [searchUsername, setSearchUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts, STORAGE_KEY]);

  // Fetch Conversation
  const fetchConversation = async (showLoading = false) => {
    if (!activeReceiver || !currentUsername) return;
    try {
      if (showLoading) setLoading(true);
      const response = await axios.get(
        `${API_MESSAGES_URL}/conversation/${currentUsername}/${activeReceiver}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeReceiver) return;

    fetchConversation(true);
    const interval = setInterval(() => {
      fetchConversation(false);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeReceiver, currentUsername]);

  const handleStartNewChat = (e) => {
    e.preventDefault();
    const targetUser = searchUsername.trim().toLowerCase().replace('@', '');

    if (!targetUser) return;
    if (targetUser === currentUsername) {
      alert("You cannot DM yourself!");
      return;
    }

    if (!contacts.includes(targetUser)) {
      setContacts([targetUser, ...contacts]);
    }

    setActiveReceiver(targetUser);
    setSearchUsername('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeReceiver) return;

    try {
      const payload = {
        sender: currentUser?.name || currentUsername,
        senderUsername: currentUsername,
        receiverUsername: activeReceiver,
        text: newMessage.trim()
      };

      const response = await axios.post(API_MESSAGES_URL, payload);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');

      if (!contacts.includes(activeReceiver)) {
        setContacts([activeReceiver, ...contacts]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Delete message for current user only
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete message for you?')) return;
    try {
      await axios.delete(`${API_MESSAGES_URL}/delete-for-me/${messageId}?username=${currentUsername}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId && msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleRemoveContact = (e, contactToRemove) => {
    e.stopPropagation();
    if (window.confirm(`Remove @${contactToRemove} from chat list?`)) {
      const updated = contacts.filter((c) => c !== contactToRemove);
      setContacts(updated);
      if (activeReceiver === contactToRemove) {
        setActiveReceiver(updated.length > 0 ? updated[0] : '');
      }
    }
  };

  return (
    <div className="flex h-full bg-black text-white divide-x divide-[#2f3336]">
      {/* 1. Left Sidebar */}
      <div className="w-1/3 h-full flex flex-col border-r border-[#2f3336]">
        <div className="p-3 border-b border-[#2f3336]">
          <h2 className="text-base font-bold mb-2">Direct Messages</h2>

          <form onSubmit={handleStartNewChat} className="flex gap-1.5">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Add username..."
              className="w-full bg-[#16181c] border border-[#2f3336] rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#1d9bf0]"
            />
            <button
              type="submit"
              className="bg-[#1d9bf0] text-white p-1.5 rounded-full hover:bg-opacity-90 transition cursor-pointer flex-shrink-0"
              title="Add User"
            >
              <BiUserPlus className="text-base" />
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.length > 0 ? (
            contacts.map((usr) => {
              const isSelected = activeReceiver === usr;
              return (
                <div
                  key={usr}
                  onClick={() => setActiveReceiver(usr)}
                  className={`p-3 cursor-pointer border-b border-[#2f3336]/30 flex items-center justify-between hover:bg-white/5 transition group ${
                    isSelected ? 'bg-white/10 border-r-4 border-[#1d9bf0]' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate">@{usr}</h4>
                    <p className="text-[10px] text-gray-500 truncate">Private Chat</p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveContact(e, usr)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 p-1 transition cursor-pointer"
                  >
                    <BiX className="text-base" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-gray-500">
              No chats saved. Type a username above and press **+** to add!
            </div>
          )}
        </div>
      </div>

      {/* 2. Right Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {activeReceiver ? (
          <>
            <div className="p-3 border-b border-[#2f3336] bg-black/80 backdrop-blur-md flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xs">Chatting with @{activeReceiver}</h3>
                <p className="text-[10px] text-gray-500">Logged in as @{currentUsername}</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center text-xs text-gray-500">Loading conversation...</div>
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.senderUsername === currentUsername;

                  return (
                    <div
                      key={msg._id || msg.id}
                      className={`flex items-center gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Trash icon ONLY rendered for My Messages (isMe === true) */}
                      {isMe && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id || msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 p-1 transition cursor-pointer"
                          title="Delete message"
                        >
                          <BiTrash className="text-sm" />
                        </button>
                      )}

                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words ${
                          isMe
                            ? 'bg-[#1d9bf0] text-white rounded-br-xs'
                            : 'bg-[#202327] text-white rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-gray-500 mt-10">
                  No messages with @{activeReceiver} yet. Type below to send!
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2f3336] flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message @${activeReceiver}...`}
                className="flex-1 bg-[#16181c] border border-[#2f3336] rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#1d9bf0]"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2.5 bg-[#1d9bf0] text-white rounded-full disabled:opacity-50 cursor-pointer"
              >
                <BiSend className="text-lg" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
            Type a target username on top left to start messaging.
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;