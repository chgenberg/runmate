import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Clock,
  Heart,
  Sparkles,
  Star,
  MapPin,
  Zap,
  X,
  Camera,
  Gift,
  Mic,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  // Emoji collections
  const quickEmojis = ['😊', '❤️', '👍', '🔥', '😂', '🏃‍♂️', '💪', '🎉'];
  const allEmojis = [
    '😀', '😊', '😂', '🤣', '😍', '🥰', '😘', '🤗', '🤩', '🥳',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖',
    '👍', '👎', '👏', '🙌', '🤝', '💪', '🦾', '✨', '⭐', '🌟',
    '🏃‍♂️', '🏃‍♀️', '🚴‍♂️', '🚴‍♀️', '⛰️', '🏔️', '🌄', '🌅', '🏆', '🥇'
  ];

  // Load chat data
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await api.get(`/chat/${chatId}/messages`);
        if (response.data.success) {
          setChat(response.data.chat);
          setMessages(response.data.messages);
          
          // Find the other user
          const other = response.data.chat.participants.find(p => p._id !== user?._id);
          setOtherUser(other);
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
        toast.error('Kunde inte ladda chatten');
        navigate('/app/messages');
      } finally {
        setLoading(false);
      }
    };

    const handleNewMessage = (message) => {
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleTyping = ({ userId, chatId: typingChatId }) => {
      if (typingChatId === chatId && userId !== user?._id) {
        setOtherUserTyping(true);
      }
    };

    const handleStoppedTyping = ({ userId, chatId: typingChatId }) => {
      if (typingChatId === chatId && userId !== user?._id) {
        setOtherUserTyping(false);
      }
    };

    fetchChatData();
    
    if (socket) {
      socket.emit('join_chat', chatId);
      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleTyping);
      socket.on('user_stopped_typing', handleStoppedTyping);
      
      return () => {
        socket.emit('leave_chat', chatId);
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      };
    }
  }, [chatId, socket, user, navigate]);

  // Typing indicator
  useEffect(() => {
    let typingTimer;
    
    if (messageText && socket && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { chatId });
    }
    
    if (isTyping) {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stopped_typing', { chatId });
      }, 1000);
    }
    
    return () => clearTimeout(typingTimer);
  }, [messageText, socket, chatId, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (type = 'text') => {
    if (!messageText.trim() && type === 'text') return;
    
    const tempMessage = {
      _id: Date.now().toString(),
      content: messageText.trim(),
      sender: user,
      timestamp: new Date(),
      status: 'sending',
      type
    };
    
    setMessages(prev => [...prev, tempMessage]);
    const currentMessage = messageText.trim();
    setMessageText('');
    messageInputRef.current?.focus();
    
    try {
      await api.post(`/chat/${chatId}/messages`, {
        content: currentMessage,
        type
      });
      // Update the temp message status
      setMessages(prev => prev.map(m => 
        m._id === tempMessage._id ? { ...m, status: 'sent' } : m
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Kunde inte skicka meddelande');
      // Remove the temp message
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
  };

  const sendEmoji = async (emoji) => {
    setMessageText(emoji);
    setShowEmojiPicker(false);
    await sendMessage('emoji');
  };

  const addEmoji = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const MessageComponent = ({ message, isLast }) => {
    const isOwn = message.sender._id === user?._id;
    const [showReactions, setShowReactions] = useState(false);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        ref={isLast ? messagesEndRef : null}
        className={`flex mb-6 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex items-end gap-3 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isOwn && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ProfileAvatar user={message.sender} size="sm" />
            </motion.div>
          )}
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="relative group"
          >
            <div className={`px-5 py-3 rounded-2xl shadow-sm ${
              isOwn 
                ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' 
                : 'bg-white text-gray-900 border border-gray-100'
            }`}>
              {message.type === 'emoji' ? (
                <p className="text-4xl">{message.content}</p>
              ) : (
                <p className="break-words text-[15px] leading-relaxed">{message.content}</p>
              )}
              <div className={`flex items-center justify-end gap-2 mt-1 ${
                isOwn ? 'text-white/80' : 'text-gray-500'
              }`}>
                <span className="text-xs">
                  {new Date(message.timestamp || message.createdAt).toLocaleTimeString('sv-SE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {isOwn && (
                  <div className="text-xs">
                    {message.status === 'sending' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-3 h-3 border border-white/50 border-t-white rounded-full"
                      />
                    ) : message.read ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Reaction button */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: showReactions ? 1 : 0, scale: showReactions ? 1 : 0 }}
              className={`absolute -bottom-2 ${isOwn ? '-left-10' : '-right-10'} 
                bg-white shadow-lg rounded-full p-1.5 hover:shadow-xl transition-all`}
              onClick={() => setShowReactions(!showReactions)}
            >
              <Heart className="w-4 h-4 text-gray-600" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-16 h-16 text-orange-500" />
          </motion.div>
          <p className="mt-4 text-gray-600 font-medium">Laddar chatt...</p>
        </motion.div>
      </div>
    );
  }

  if (!chat || !otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chatten hittades inte</h2>
          <button
            onClick={() => navigate('/app/messages')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Tillbaka till meddelanden
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/app/messages')}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
                onClick={() => setShowUserInfo(true)}
                className="cursor-pointer"
              >
                <ProfileAvatar user={otherUser} size="md" />
              </motion.div>
              
              <div onClick={() => setShowUserInfo(true)} className="cursor-pointer">
                <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {otherUser.firstName} {otherUser.lastName}
                  {otherUser.isPremium && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-500" />
                    {otherUser.location?.city || 'Sverige'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-green-500" />
                    Aktiv nyligen
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Phone className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Video className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ProfileAvatar user={otherUser} size="xl" className="mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Säg hej till {otherUser.firstName}! 👋
            </h3>
            <p className="text-gray-600 mb-8">Detta är början på er konversation</p>
            
            {/* Quick info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="font-medium text-gray-900">{otherUser.location?.city || 'Sverige'}</p>
                  <p className="text-gray-600">Plats</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="font-medium text-gray-900">{otherUser.runningLevel || 'Nybörjare'}</p>
                  <p className="text-gray-600">Nivå</p>
                </div>
              </div>
            </div>
            
            {/* Suggested messages */}
            <div className="mt-8">
              <p className="text-sm text-gray-600 mb-3">Förslag på meddelanden:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['Hej! Vill du springa tillsammans? 🏃‍♂️', 'Vilka är dina favoritrundor? 🗺️', 'Hej! Kul att träffas här! 😊'].map((suggestion, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMessageText(suggestion)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-all"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <MessageComponent
                key={message._id}
                message={message}
                isLast={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Typing indicator */}
        <AnimatePresence>
          {otherUserTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 mb-6"
            >
              <ProfileAvatar user={otherUser} size="sm" />
              <div className="bg-gray-100 rounded-2xl px-5 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 px-4 py-4"
      >
        {/* Emoji picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-h-64 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Emojis</h3>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {allEmojis.map(emoji => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
            >
              <Camera className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
            >
              <Gift className="w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Skriv till ${otherUser.firstName}...`}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </motion.button>
              {quickEmojis.slice(0, 2).map(emoji => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendEmoji(emoji)}
                  className="text-xl p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={!messageText.trim()}
            className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
        
        {/* Voice message hint */}
        <div className="mt-2 flex items-center justify-center">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Mic className="w-3 h-3" />
            Håll in för röstmeddelande
          </p>
        </div>
      </motion.div>
      
      {/* User info modal */}
      <AnimatePresence>
        {showUserInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <ProfileAvatar user={otherUser} size="xl" className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  {otherUser.firstName} {otherUser.lastName}
                  {otherUser.isPremium && (
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  )}
                </h2>
                <p className="text-gray-600">@{otherUser.username || 'runner'}</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Plats</p>
                    <p className="font-medium">{otherUser.location?.city || 'Sverige'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Löpnivå</p>
                    <p className="font-medium">{otherUser.runningLevel || 'Nybörjare'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Medlem sedan</p>
                    <p className="font-medium">
                      {new Date(otherUser.createdAt).toLocaleDateString('sv-SE', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserInfo(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold"
                >
                  Stäng
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowUserInfo(false);
                    navigate(`/app/profile/${otherUser._id}`);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  Visa profil
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage; 