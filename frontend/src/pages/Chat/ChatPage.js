import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Search,
  Filter,
  Plus,
  Heart,
  Trophy,
  Zap,
  CheckCheck,
  Check,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import NewChatModal from '../../components/Chat/NewChatModal';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const response = await api.get('/chat/conversations');
      setChats(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      // No demo data - start with empty chats
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const filteredChats = chats.filter(chat => {
    if (filterType === 'matches' && chat.type !== 'match') return false;
    if (filterType === 'challenges' && chat.type !== 'challenge') return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (chat.type === 'match') {
        const otherParticipant = chat.participants.find(p => p._id !== user?._id);
        return otherParticipant?.firstName?.toLowerCase().includes(query) ||
               otherParticipant?.lastName?.toLowerCase().includes(query);
      } else {
        return chat.name?.toLowerCase().includes(query);
      }
    }
    
    return true;
  });

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.abs(now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  const getChatTitle = (chat) => {
    if (chat.type === 'challenge') {
      return chat.name;
    } else {
      const otherParticipant = chat.participants.find(p => p._id !== user?._id);
      return `${otherParticipant?.firstName} ${otherParticipant?.lastName}`;
    }
  };

  const getChatSubtitle = (chat) => {
    if (chat.type === 'challenge') {
      return `${chat.participants.length} deltagare • ${chat.isActive ? 'Aktiv' : 'Avslutad'}`;
    } else {
      const otherParticipant = chat.participants.find(p => p._id !== user?._id);
      return `${otherParticipant?.location} • ${chat.matchScore}% match`;
    }
  };

  const getChatAvatar = (chat) => {
    if (chat.type === 'challenge') {
      return (
        <div className="relative">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          {chat.isActive && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      );
    } else {
      const otherParticipant = chat.participants.find(p => p._id !== user?._id);
      return (
        <div className="relative">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
            {otherParticipant?.profileImage ? (
              <img 
                src={otherParticipant.profileImage} 
                alt={otherParticipant.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg md:text-xl">
                {otherParticipant?.firstName?.[0]}
              </span>
            )}
          </div>
          {/* Online status */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
            otherParticipant?.isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          {/* Match score badge */}
          {chat.matchScore >= 90 && (
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
              <Star className="w-3 h-3 text-yellow-900 fill-current" />
            </div>
          )}
        </div>
      );
    }
  };

  const getMessageStatus = (message) => {
    if (message.sender === user?._id) {
      return message.read ? (
        <CheckCheck className="w-4 h-4 text-blue-500" />
      ) : (
        <Check className="w-4 h-4 text-gray-400" />
      );
    }
    return null;
  };

  const getTabStats = () => {
    const matches = chats.filter(c => c.type === 'match').length;
    const challenges = chats.filter(c => c.type === 'challenge').length;
    const unread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    
    return { matches, challenges, unread };
  };

  const tabStats = getTabStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center pb-20 lg:pb-0">
        <LoadingSpinner size="xl" text="Laddar dina chattar..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 pb-20 lg:pb-0">
      {/* Enhanced Header with Gradient - Mobile Optimized */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white">
        <div className="px-4 py-4 md:py-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl md:text-4xl font-bold flex items-center gap-2"
                >
                  <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
                  MINA CHATTAR
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/90 text-sm md:text-lg mt-1"
                >
                  Håll kontakten med dina löparvänner
                </motion.p>
              </div>
              
              {/* Action Buttons - Mobile Optimized */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterType('all')}
                  className="p-2.5 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl hover:bg-white/30 transition-all"
                >
                  <Filter className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewChatModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-white text-orange-600 rounded-lg md:rounded-xl font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Ny</span>
                </motion.button>
              </div>
            </div>

            {/* Stats Cards - Mobile Optimized Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-4 gap-2 md:gap-4"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-xl md:text-2xl font-bold">{chats.length}</div>
                <div className="text-white/80 text-xs md:text-sm">Totalt</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-xl md:text-2xl font-bold">{tabStats.matches}</div>
                <div className="text-white/80 text-xs md:text-sm">Matches</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-xl md:text-2xl font-bold">{tabStats.challenges}</div>
                <div className="text-white/80 text-xs md:text-sm">Grupper</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-xl md:text-2xl font-bold text-yellow-300">{tabStats.unread}</div>
                <div className="text-white/80 text-xs md:text-sm">Olästa</div>
              </div>
            </motion.div>

            {/* Enhanced Search - Mobile Optimized */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Sök bland dina chattar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl placeholder-white/60 text-white focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              />
            </motion.div>

            {/* Enhanced Tabs - Mobile Optimized */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-2 p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            >
              {[
                { id: 'all', label: 'Alla', icon: MessageCircle, count: chats.length },
                { id: 'matches', label: 'Matches', icon: Heart, count: tabStats.matches },
                { id: 'challenges', label: 'Grupper', icon: Trophy, count: tabStats.challenges }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilterType(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg font-medium transition-all ${
                      filterType === tab.id
                        ? 'bg-white text-orange-600 shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm md:text-base">{tab.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      filterType === tab.id 
                        ? 'bg-orange-100 text-orange-600' 
                        : 'bg-white/20 text-white/80'
                    }`}>
                      {tab.count}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Chat List - Mobile Optimized */}
      <div className="px-4 py-6 md:py-8">
        {filteredChats.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchQuery ? 'Inga chattar hittades' : 'Inga chattar än'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? 'Prova att söka på något annat eller rensa sökfältet'
                : 'Börja chatta med dina löparvänner eller gå med i utmaningar för att komma igång'
              }
            </p>
            {!searchQuery && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app/discover')}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Hitta Löparvänner
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app/challenges')}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  Utforska Utmaningar
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 md:space-y-4"
          >
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/app/chat/${chat._id}`)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-4 md:p-5">
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Avatar */}
                    {getChatAvatar(chat)}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-base md:text-lg">
                            {getChatTitle(chat)}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500">
                            {getChatSubtitle(chat)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <span className="text-xs md:text-sm text-gray-500">
                            {formatTime(chat.lastMessage?.timestamp)}
                          </span>
                          {chat.unreadCount > 0 && (
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Last Message */}
                      <div className="flex items-center gap-2">
                        {chat.lastMessage && (
                          <>
                            {getMessageStatus(chat.lastMessage)}
                            <p className="text-sm md:text-base text-gray-600 truncate flex-1">
                              {chat.type === 'challenge' && chat.lastMessage.senderName && (
                                <span className="font-medium">{chat.lastMessage.senderName}: </span>
                              )}
                              {chat.lastMessage.content}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Swipe Actions Hint - Mobile Only */}
                {index === 0 && window.innerWidth < 768 && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 text-center">
                    <p className="text-xs text-gray-600">
                      Tryck för att öppna chatten
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal 
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
      />

      {/* Floating Action Button - Mobile Only */}
      {window.innerWidth < 768 && filteredChats.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNewChatModal(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </div>
  );
};

export default ChatPage; 