import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {BiArrowBack, BiSend, BiTrash,BiUser} from 'react-icons/bi';

const API_BASE_URL = 'http://localhost:5000/api/messages';
const SOCKET_URL = 'http://localhost:5000';
// SOCKET
// =====================================================
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

// ROOM ID
// ======================================================

const getRoomId = (user1, user2) => {
  return [
    String(user1 || '').toLowerCase().trim(),
    String(user2 || '').toLowerCase().trim(),
  ]
    .sort()
    .join('_');
};

// SAFE DATE
// ======================================================

const formatMessageTime = (date) => {
  if (!date) return '';

  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) {
    return '';
  }

  return messageDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatConversationTime = (date) => {
  if (!date) return '';

  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) {
    return '';
  }

  const now = new Date();

  const sameDay =
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear();

  if (sameDay) {
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return messageDate.toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
  });
};
// AVATAR COMPONENT
// ======================================================

const Avatar = ({ src,name,size = 'w-11 h-11', textSize = 'text-lg',}) => {
  const firstLetter = name?.charAt(0)?.toUpperCase() || 'U';
  return (
    <div className={`${size} rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0`}>
      {src ? (
        <img src={src} alt={name || 'User'} className="w-full h-full object-cover" onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}/>
      ) : (
        <span className={`${textSize} font-semibold text-white`}>
        {firstLetter}
        </span>
      )}
    </div>
  );
};
// MESSAGE COMPONENT

const Message = ({ currentUser, currentUsername,}) => {
  // CURRENT USER
  const username = useMemo(() => {
    return (
      currentUsername ||
      currentUser?.username ||
      currentUser?.userName ||
      ''
    )
      .toLowerCase()
      .trim();
  }, [
    currentUsername,
    currentUser?.username,
    currentUser?.userName,
  ]);

  const currentUserAvatar = currentUser?.avatar || null;

  const currentUserName = currentUser?.name || currentUser?.username || currentUser?.userName || 'User';
  // STATES


  const [conversations, setConversations] =
    useState([]);

  const [activeChat, setActiveChat] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [newMessage, setNewMessage] =
    useState('');

  const [newUsername, setNewUsername] =
    useState('');

  const [loadingConversations, setLoadingConversations] =
    useState(false);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [isSending, setIsSending] =
    useState(false);

  // LOAD CONVERSATIONS
  // ====================================================

  const loadConversations = async () => {
    if (!username) return;

    try {
      setLoadingConversations(true);

      const response = await axios.get(
        `${API_BASE_URL}/conversations/${encodeURIComponent(
          username
        )}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setConversations(data);
    }
     catch (error) { 
      console.error('LOAD CONVERSATIONS ERROR:', error );
    } finally {
      setLoadingConversations(false);
    }
  };

  // INITIAL LOAD
  // ====================================================
  useEffect(() => {
    if (!username) return;

    loadConversations();
  }, [username]);

  // SOCKET CONNECTION
  // ====================================================

  useEffect(() => {
    if (!username) return;

    if (!socket.connected) {
      socket.connect();
    }

    return () => {};
  }, [username]);

  // OPEN CHAT
  // ====================================================

  const openChat = async (conversation) => {
    if (!conversation?.username || !username) {
      return;
    }
    const partnerUsername = conversation.username.toLowerCase().trim();
    const roomId = getRoomId( username, partnerUsername);
    setActiveChat({
      ...conversation, username: partnerUsername,});
    setMessages([]);

    try {
      setLoadingMessages(true);

      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('join_room', roomId);
      const response = await axios.get(`${API_BASE_URL}/conversation/${encodeURIComponent(username)}/${encodeURIComponent(partnerUsername)}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setMessages(data);
    } 
    catch (error) {
    console.error('LOAD CHAT ERROR:', error);
    } 
    finally {
      setLoadingMessages(false);
    }
  };

  // RECEIVE LIVE MESSAGE
  // ====================================================

  useEffect(() => {
    if (!username) return;

    const handleReceiveMessage = (incomingMessage) => {
      if (!incomingMessage) return;
      const senderUsername = incomingMessage.senderUsername?.toLowerCase().trim();
      const receiverUsername = incomingMessage.receiverUsername?.toLowerCase().trim();

      if ( senderUsername !== username && receiverUsername !== username) {
        return;
      }
      // ACTIVE CHAT MESSAGE
      // ================================================
      setActiveChat((currentActiveChat) => {
        if (!currentActiveChat) {
          return currentActiveChat;
        }
        const activeUsername = currentActiveChat.username?.toLowerCase().trim();
        const partnerUsername = senderUsername === username? receiverUsername : senderUsername;

        if (activeUsername !== partnerUsername) {
          return currentActiveChat;
        }
        setMessages((prevMessages) => {
          const exists = prevMessages.some((message) =>
                String(message._id) === String(incomingMessage._id));
          if (exists) {
            return prevMessages;
          }

          return [
            ...prevMessages,
            incomingMessage,
          ];
        });

        return currentActiveChat;
      });

      // UPDATE CONVERSATION LIST
      // ===============================================

      const isSender = senderUsername === username;
      const partnerUsername = isSender? receiverUsername : senderUsername;
      const partnerAvatar = isSender? incomingMessage.receiverAvatar : incomingMessage.senderAvatar;
      const partnerName = isSender? partnerUsername : incomingMessage.sender || partnerUsername;
      setConversations((prevConversations) => {
        const existingConversation = prevConversations.find((conversation) => 
        conversation.username?.toLowerCase().trim() === partnerUsername);
        const updatedConversation = {username: partnerUsername, name: existingConversation?.name || partnerName,avatar: partnerAvatar ||
        existingConversation?.avatar || null,

          lastMessage:incomingMessage.text || '',
          lastMessageAt:incomingMessage.createdAt || new Date().toISOString(),
          lastMessageId:incomingMessage._id,};

        const filtered = prevConversations.filter((conversation) =>
              conversation.username?.toLowerCase().trim() !== partnerUsername);

        return [
          updatedConversation,
          ...filtered,];
      });
    };
    socket.on(
      'receive_message',
      handleReceiveMessage
    );

    return () => {
      socket.off(
        'receive_message',
        handleReceiveMessage
      );
    };
  }, [username]);
  // SEND MESSAGE
  // ====================================================

  const handleSendMessage = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const text = newMessage.trim();

    if (!text) return;

    if (!username) {
      alert('User not found.');
      return;
    }

    if (!activeChat?.username) {
      alert(
        'Please select a conversation first.'
      );
      return;
    }

    if (isSending) return;

    const receiverUsername =
      activeChat.username.toLowerCase().trim();
    try {
      setIsSending(true);

      const payload = {
        sender: currentUserName,

        senderUsername: username,

        senderAvatar:
          currentUserAvatar,

        receiverUsername,

        receiverAvatar:
          activeChat.avatar || null,

        text,
      };

      const response = await axios.post( API_BASE_URL, payload );
      const savedMessage = response.data;
      setNewMessage('');
      setConversations((prevConversations) => {
        const existingConversation = prevConversations.find((conversation) => 
          conversation.username?.toLowerCase().trim() === receiverUsername);

        const updatedConversation = {
          username: receiverUsername,

          name:
            existingConversation?.name ||
            activeChat.name ||
            receiverUsername,

          avatar:
            activeChat.avatar ||
            existingConversation?.avatar ||
            null,

          lastMessage:
            savedMessage?.text || text,

          lastMessageAt:
            savedMessage?.createdAt ||
            new Date().toISOString(),

          lastMessageId:
            savedMessage?._id || null,
        };

        const filtered = prevConversations.filter((conversation) =>
              conversation.username?.toLowerCase().trim() !== receiverUsername);

        return [
          updatedConversation,
          ...filtered, ];
      });
    } catch (error) {
      console.error('SEND MESSAGE ERROR:', error );

      alert(error?.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  // START NEW CHAT
  // ====================================================
  const handleStartNewChat = async (e) => {
    e.preventDefault();

    const targetUsername = newUsername.trim().toLowerCase();
    if (!targetUsername) return;

    if (targetUsername === username) {
      alert('You cannot start a chat with yourself.');
      return;
    }

    const existingConversation =
      conversations.find((conversation) =>
          conversation.username?.toLowerCase().trim() === targetUsername);

    if (existingConversation) {
      setNewUsername('');
      openChat(existingConversation);
      return;
    }

    const newConversation = {
      username: targetUsername,
      name: targetUsername,
      avatar: null,
      lastMessage: '',
      lastMessageAt: null,
      lastMessageId: null,
    };

    setConversations((prev) => [
      newConversation,
      ...prev,
    ]);

    setNewUsername('');

    openChat(newConversation);
  };

  // DELETE ENTIRE CONVERSATION
  // ====================================================
  const handleDeleteConversation = async (conversation) => {
    if (!conversation?.username) return;

    const partnerUsername =
      conversation.username.toLowerCase().trim();
    const confirmed = window.confirm(
      `Delete conversation with ${conversation.name || partnerUsername}?`);

    if (!confirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/conversation/${encodeURIComponent(username)}/${encodeURIComponent(partnerUsername)}`);
      setConversations((prev) =>
        prev.filter((item) => item.username?.toLowerCase().trim() !== partnerUsername));

      if (activeChat?.username?.toLowerCase().trim() === partnerUsername) {
        setMessages([]);
        setActiveChat(null);
      }
    } catch (error) {
      console.error('DELETE CONVERSATION ERROR:', error);
      alert(error?.response?.data?.message || 'Failed to delete conversation.');
    }
  };
  // DELETE MESSAGE FOR ME
  // ====================================================
  const handleDeleteMessage = async (messageId) => {
    if (!messageId || !username) return;

    const confirmed = window.confirm('Delete this message for you?');
    if (!confirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/delete-for-me/${messageId}`,
        {
          params: {
          username,
          },
        }
      );
      setMessages((prevMessages) => prevMessages.filter((message) => String(message._id) !== String(messageId)));
    } catch (error) {
      console.error('DELETE MESSAGE ERROR:', error);
      alert(error?.response?.data?.message || 'Failed to delete message.');
    }
  };
  // CLOSE ACTIVE CHAT
  const handleBack = () => {
    if (activeChat?.username) {
      const roomId = getRoomId(
        username,
        activeChat.username
      );

      socket.emit(
        'leave_room',
        roomId
      );
    }
    setActiveChat(null);
    setMessages([]);
  };
  // ACTIVE CHAT ROOM JOIN / LEAVE
  // ====================================================

  useEffect(() => {
    if (!username || !activeChat?.username) {
      return;
    }

    const partnerUsername = activeChat.username.toLowerCase().trim();
    const roomId = getRoomId(username,partnerUsername);
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_room',roomId);
    return () => {
      socket.emit('leave_room', roomId);
    };
  }, [username,activeChat?.username,]);

  // REFRESH CONVERSATIONS
  // ====================================================

  useEffect(() => {
    const handleFocus = () => {
      loadConversations();
    };

    window.addEventListener('focus',handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [username]);

  // RENDER
  // ====================================================
  return (
    <div className="w-full h-full min-h-0 bg-black text-white flex overflow-hidden">
          {/* LEFT SIDEBAR / CONVERSATIONS */}
      <div className={`${ activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] h-full min-h-0 border-r border-gray-800 flex-col  bg-black`}>

        {/* HEADER */}
        <div className="px-5 py-4 border-b border-gray-800 flex-shrink-0">
          <h1 className="text-2xl font-bold">Messages</h1>

          <p className="text-gray-500 text-sm mt-1">Your conversations</p>
        </div>

        {/* NEW CHAT */}

        <form onSubmit={handleStartNewChat} className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
          <input type="text" value={newUsername} onChange={(e) =>
                setNewUsername( e.target.value)} placeholder="Enter username..." className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-full px-4 py-2.5 outline-none focus:border-blue-500 text-sm"/>

            <button type="submit" className="bg-blue-500 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center tra flex-shrink-0" title="Start chat"><BiSend size={20} /></button>
          </div>
        </form>

        {/* CONVERSATIONS */}
        <div className="flex-1 min-h-0 overflow-y-auto">

          {loadingConversations ? (
            <div className="flex justify-center items-center py-10 text-gray-500">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-6 py-16">

              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                <BiUser size={32} className="text-gray-500" />
              </div> 

              <h3 className="font-semibold text-lg">No messages yet</h3>
              <p className="text-gray-500 text-sm mt-2"> Start a conversation by  entering a username above. </p>
            </div>
          ) : (
            conversations.map(
              (conversation) => {

                const isActive = activeChat?.username?.toLowerCase().trim() === conversation.username?.toLowerCase().trim();
                return (
                  <div key={conversation.username} onClick={() => openChat(conversation)}className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-900 transition ${isActive ? 'bg-gray-900' : 'hover:bg-gray-950'}`}>
                    <Avatar src={conversation.avatar} name={conversation.name || conversation.username} size="w-12 h-12"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">  
                        <h3 className="font-semibold truncate"> {conversation.name || conversation.username}</h3>
                        <span className="text-[11px] text-gray-500 flex-shrink-0">
                          {formatConversationTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm truncate mt-1">
                        {conversation.lastMessage || 'Start a conversation'}
                      </p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(), handleDeleteConversation(conversation)}}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition p-2 flex-shrink-0"
                      title="Delete conversation"><BiTrash size={18} />
                    </button>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
      {/* CHAT AREA */}
      <div className={`${ activeChat ? 'flex': 'hidden md:flex'} flex-1 flex-col  bg-black min-w-0 min-h-0 h-full`}>
        {!activeChat ? (
          // NO ACTIVE CHAT
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-5">
              <BiSend size={38} className="text-gray-600"/>
            </div>
            <h2 className="text-2xl font-bold">Your Messages</h2>
            <p className="text-gray-500 mt-2 max-w-sm">Select a conversation or start a new chat using a username.</p>
          </div>
        ) : (

          <>
            {/*CHAT HEADER*/}
            <div className="h-[72px] border-b border-gray-800 flex items-center px-3 md:px-4 gap-2 md:gap-3 flex-shrink-0 bg-black">
              {/* BACK BUTTON MOBILE */}
              <button onClick={handleBack} className="md:hidden p-2 rounded-full hover:bg-gray-900 transition flex-shrink-0" >
                <BiArrowBack size={23} /> </button>
              {/* ACTIVE CHAT AVATAR */}
              <Avatar src={activeChat.avatar} name={activeChat.name ||activeChat.username} size="w-10 h-10 md:w-11 md:h-11" />
             {/* NAME */}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold truncate">
                  {activeChat.name || activeChat.username}
                </h2>
                <p className="text-gray-500 text-sm truncate"> @{activeChat.username} </p>
              </div>
              {/* DELETE CHAT */}
              <button onClick={() =>handleDeleteConversation(activeChat)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-900 rounded-full transition flex-shrink-0" title="Delete conversation" >
                <BiTrash size={21} /> </button>
            </div>
            {/* MESSAGES*/}
            <div className="flex-1 min-h-0 overflow-y-auto px-3 md:px-4 py-4 md:py-5">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center px-4">
                  <Avatar src={activeChat.avatar} name={ activeChat.name || activeChat.username} size="w-20 h-20" textSize="text-3xl" />
                  <h3 className="font-semibold text-lg mt-4">
                    {activeChat.name || activeChat.username }
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Start your conversation.
                  </p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto flex flex-col gap-3 md:gap-4">
                  {messages.map(
                    (message, index) => {
            const isOwn = message.senderUsername?.toLowerCase().trim() === username;
            const messageAvatar = isOwn ? currentUserAvatar : message.senderAvatar || activeChat.avatar || null;
            const messageName = isOwn? currentUserName: activeChat.name || message.sender || activeChat.username;
              return (
                        <div key={ message._id || `${message.createdAt}-${index}`} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`} >
                          {/* OTHER USER AVATAR */}
                          {!isOwn && (
                            <Avatar src={ messageAvatar } name={ messageName } size="w-8 h-8" textSize="text-xs"/>)}
                          {/* MESSAGE + TIME */}
                          <div className={`group max-w-[78%] md:max-w-[65%]flex flex-col ${isOwn? 'items-end' : 'items-start'}`}>
                            <div className={`relative px-4 py-2.5 rounded-2xl break-words ${ isOwn ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-800 text-white rounded-bl-md' }`}>
                              <p className="whitespace-pre-wrap break-words text-sm md:text-base">
                                {message.text}
                              </p>
                              {/* DELETE MESSAGE */}
          <button onClick={() =>  handleDeleteMessage (message._id)} className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gray-900 border border-gray-700 text-gray-400 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" title="Delete for me"><BiTrash size={14} />
                        </button>
                            </div>
                            <span className="text-[10px] text-gray-600 mt-1 px-1"> 
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>
                          {/* OWN USER AVATAR */}

                          {isOwn && (
                            <Avatar src={ currentUserAvatar } name={currentUserName} size="w-8 h-8" textSize="text-xs"/>)}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
            {/* MESSAGE INPUT*/}
            <div
              className=" border-t border-gray-800 px-3 md:px-4 py-3 flex-shrink-0 bg-black sticky bottom-0 z-20 md:pb-8pb-20" >
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2" >
              <input type="text" value={newMessage} onChange={(e) => setNewMessage( e.target.value)} placeholder="Start a new message" disabled={isSending} autoComplete="off" className="flex-1 min-w-0 bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-full px-4 md:px-5 py-3 outline-none transition disabled:opacity-50 text-sm md:text-base"
              onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }}} />
                <button type="submit" disabled={isSending || !newMessage.trim()} className="w-11 h-11 md:w-12 md:h-12 rounded-full  bg-blue-500  hover:bg-blue-600  disabled:bg-gray-700  disabled:text-gray-500 flex items-center justify-center transition flex-shrink-0">
                  <BiSend size={22} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Message;