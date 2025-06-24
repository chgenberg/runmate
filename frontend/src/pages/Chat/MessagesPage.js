import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Star,
  MapPin,
  Plus,
  Check,
  CheckCheck
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
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleMessageRead = useCallback((data) => {
    setChats(prev => prev.map(chat => 
      chat._id === data.chatId 
        ? { ...chat, unreadCount: Math.max(0, (chat.unreadCount || 0) - 1) }
        : chat
    ));
  }, []);

  const handleUserOnline = useCallback((userId) => {
    setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
  }, []);

  const handleUserOffline = useCallback((userId) => {
    setOnlineUsers(prev => prev.filter(id => id !== userId));
  }, []);

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
  }, [socket, fetchChats, handleNewMessage, handleMessageRead, handleUserOnline, handleUserOffline]);

  const filteredChats = chats.filter(chat => {
    const otherUser = chat.participants.find(p => p._id !== user?._id);
    const matchesSearch = !searchTerm || 
      otherUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'unread' && chat.unreadCount > 0);
    
    return matchesSearch && matchesFilter;
  });

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString('sv-SE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageTime.toLocaleDateString('sv-SE', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 sticky top-0 z-10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Meddelanden</h1>
            <p className="text-sm text-gray-500">Chatta med andra löpare</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Plus className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sök meddelanden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        
        {/* Filter tabs */}
        <div className="flex mt-4 bg-gray-100 rounded-full p-1">
          {[
            { key: 'all', label: 'Alla' },
            { key: 'unread', label: 'Olästa' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeFilter === filter.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-100">
            <div className="text-lg font-bold text-gray-900">{filteredChats.length}</div>
            <div className="text-xs text-gray-500">Konversationer</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-100">
            <div className="text-lg font-bold text-blue-600">
              {filteredChats.filter(chat => chat.unreadCount > 0).length}
            </div>
            <div className="text-xs text-gray-500">Olästa</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-100">
            <div className="text-lg font-bold text-green-600">{onlineUsers.length}</div>
            <div className="text-xs text-gray-500">Online</div>
          </div>
        </div>
      </motion.div>

      {/* Chat List */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6 mx-auto mb-4 w-fit">
              <MessageCircle className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Inga meddelanden hittades' : 'Inga meddelanden ännu'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchTerm 
                ? 'Försök med ett annat sökord'
                : 'Börja chatta med andra löpare för att se dina konversationer här'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/app/discover')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all"
              >
                Upptäck löpare
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredChats.map((chat, index) => {
                const otherUser = chat.participants.find(p => p._id !== user?._id);
                const isOnline = onlineUsers.includes(otherUser?._id);
                
                return (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/app/messages/${chat._id}`)}
                    className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-xl p-4 hover:bg-white/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <ProfileAvatar 
                          user={otherUser} 
                          size="md"
                          showOnlineStatus={true}
                        />
                        {chat.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate flex items-center space-x-2">
                            <span>{otherUser?.firstName} {otherUser?.lastName}</span>
                            {otherUser?.isPremium && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                            <span className="text-xs text-gray-500">
                              {chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{otherUser?.location?.city || 'Okänd plats'}</span>
                            <span>•</span>
                            <span className="truncate">{otherUser?.runningLevel || 'Nybörjare'}</span>
                          </div>
                        </div>
                        
                        {chat.lastMessage && (
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-sm truncate ${
                              chat.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                            }`}>
                              {chat.lastMessage.sender === user?._id ? 'Du: ' : ''}
                              {chat.lastMessage.content}
                            </p>
                            <div className="flex items-center space-x-1 ml-2">
                              {chat.lastMessage.sender === user?._id && (
                                <>
                                  {chat.lastMessage.readBy?.includes(otherUser?._id) ? (
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                  ) : (
                                    <Check className="h-3 w-3 text-gray-400" />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage; 