import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Users, 
  TrendingUp, 
  Star,
  MapPin,
  Plus,
  Check,
  CheckCheck,
  Sparkles,
  Heart,
  Zap
} from 'lucide-react';
import api from '../../services/api';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [onlineUsers, setOnlineUsers] = useState([]);

  const fetchChats = useCallback(async () => {
    try {
      const response = await api.get('/chat');
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Kunde inte ladda meddelanden');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNewMessage = useCallback((data) => {
    fetchChats(); // Refresh chat list
  }, [fetchChats]);

  useEffect(() => {
    fetchChats();
    
    if (socket) {
      socket.on('new_message', handleNewMessage);
      socket.on('message_read', handleMessageRead);
      socket.on('user_online', handleUserOnline);
      socket.on('user_offline', handleUserOffline);
      
      return () => {
        socket.off('new_message');
        socket.off('message_read');
        socket.off('user_online');
        socket.off('user_offline');
      };
    }
  }, [socket, fetchChats, handleNewMessage]);

  const handleMessageRead = (data) => {
    setChats(prev => prev.map(chat => 
      chat._id === data.chatId 
        ? { ...chat, lastMessage: { ...chat.lastMessage, read: true } }
        : chat
    ));
  };

  const handleUserOnline = (userId) => {
    setOnlineUsers(prev => [...prev, userId]);
  };

  const handleUserOffline = (userId) => {
    setOnlineUsers(prev => prev.filter(id => id !== userId));
  };

  const getOtherUser = (chat) => {
    return chat.participants.find(p => p._id !== user?._id);
  };

  const getLastMessage = (chat) => {
    if (chat.lastMessage) {
      return chat.lastMessage;
    }
    return null;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Igår';
    } else {
      return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat);
    const matchesSearch = otherUser?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         otherUser?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'unread') {
      return matchesSearch && chat.unreadCount > 0;
    }
    return matchesSearch;
  });

  const ChatItem = ({ chat, index }) => {
    const otherUser = getOtherUser(chat);
    const lastMessage = getLastMessage(chat);
    const isOnline = onlineUsers.includes(otherUser?._id);
    
    if (!otherUser) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ x: 10 }}
        className="relative overflow-hidden"
        onClick={() => navigate(`/app/messages/${chat._id}`)}
      >
        <div className="p-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent cursor-pointer transition-all border-b border-gray-100 group">
          <div className="flex items-center gap-4">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ProfileAvatar user={otherUser} size="lg" />
              {/* Online indicator */}
              <AnimatePresence>
                {isOnline && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
                  >
                    <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-50"></span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                  {otherUser.firstName} {otherUser.lastName}
                  {otherUser.isPremium && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </h3>
                {lastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTime(lastMessage.timestamp)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {lastMessage ? (
                    <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                      {lastMessage.sender._id === user?._id && (
                        <span className="text-gray-500">Du:</span>
                      )}
                      {lastMessage.type === 'emoji' ? (
                        <span className="text-base">{lastMessage.content}</span>
                      ) : (
                        lastMessage.content
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Säg hej! 👋</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-3">
                  {lastMessage?.sender._id === user?._id && (
                    <div className="text-gray-400">
                      {lastMessage.read ? (
                        <CheckCheck className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  )}
                  {chat.unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-semibold"
                    >
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* User info tags */}
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {otherUser.location?.city || 'Sverige'}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {otherUser.runningLevel || 'Nybörjare'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Hover effect */}
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-orange-500 to-red-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
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
            <MessageCircle className="w-16 h-16 text-orange-500" />
          </motion.div>
          <p className="mt-4 text-gray-600 font-medium">Laddar meddelanden...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100"
      >
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                Meddelanden
                <MessageCircle className="w-8 h-8 text-orange-500" />
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {chats.length} konversationer
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/app/discover')}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Ny konversation
            </motion.button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök konversationer..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeFilter === 'all' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Alla
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter('unread')}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeFilter === 'unread' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Olästa
              {chats.filter(c => c.unreadCount > 0).length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {chats.filter(c => c.unreadCount > 0).length}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Chat List */}
      <div className="bg-white">
        {filteredChats.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4"
          >
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mb-6">
              <MessageCircle className="w-16 h-16 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {searchQuery ? 'Inga resultat 🔍' : 'Inga meddelanden än 💬'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? 'Prova att söka efter något annat eller börja en ny konversation' 
                : 'Börja chatta med andra löpare för att bygga ditt nätverk och hitta nya löpvänner!'
              }
            </p>
            {!searchQuery && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app/discover')}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
                >
                  <Sparkles className="w-5 h-5" />
                  Upptäck löpare
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app/community')}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-gray-300 transition-all flex items-center gap-2 font-semibold"
                >
                  <Users className="w-5 h-5" />
                  Gå med i community
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {filteredChats.map((chat, index) => (
              <ChatItem key={chat._id} chat={chat} index={index} />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Quick stats */}
      {chats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white/50 backdrop-blur-sm"
        >
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
              <p className="text-sm text-gray-600">Konversationer</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {chats.filter(c => c.unreadCount > 0).length}
              </p>
              <p className="text-sm text-gray-600">Olästa</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {onlineUsers.length}
              </p>
              <p className="text-sm text-gray-600">Online nu</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MessagesPage; 