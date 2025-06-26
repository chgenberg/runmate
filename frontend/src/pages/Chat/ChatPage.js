import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Users,
  Trophy,
  Search,
  Plus,
  MoreVertical,
  Check,
  CheckCheck,
  Sparkles,
  Filter,
  Star,
  Zap,
  Heart,
  MapPin,
  Clock,
  Activity,
  Smile,
  Calendar,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';
import NewChatModal from '../../components/Chat/NewChatModal';

const ChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showQuickActions] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const response = await api.get('/chat/conversations');
      setChats(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      // Enhanced demo data with more details
      setChats([
        {
          _id: '1',
          type: 'match',
          participants: [
            { _id: user?._id, firstName: user?.firstName },
            { 
              _id: '2', 
              firstName: 'Emma', 
              lastName: 'Johansson', 
              profileImage: '/avatar2.png',
              isOnline: true,
              location: 'Stockholm'
            }
          ],
          lastMessage: {
            content: 'Hej! Ska vi springa tillsammans imorgon? 🏃‍♀️',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            sender: '2',
            read: false
          },
          unreadCount: 2,
          matchScore: 95
        },
        {
          _id: '2',
          type: 'challenge',
          name: 'Stockholm Marathon 2025',
          description: 'Träna tillsammans inför Stockholm Marathon',
          participants: [
            { _id: user?._id, firstName: user?.firstName },
            { _id: '3', firstName: 'Marcus', lastName: 'Andersson' },
            { _id: '4', firstName: 'Sofia', lastName: 'Lindberg' },
            { _id: '5', firstName: 'Johan', lastName: 'Nilsson' },
            { _id: '6', firstName: 'Anna', lastName: 'Berg' }
          ],
          lastMessage: {
            content: 'Någon som vill träna tillsammans på söndag? Tänkte springa 15km 💪',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            sender: '3',
            senderName: 'Marcus',
            read: true
          },
          unreadCount: 0,
          isActive: true
        },
        {
          _id: '3',
          type: 'match',
          participants: [
            { _id: user?._id, firstName: user?.firstName },
            { 
              _id: '6', 
              firstName: 'Lisa', 
              lastName: 'Eriksson', 
              profileImage: '/avatar2.png',
              isOnline: false,
              location: 'Göteborg'
            }
          ],
          lastMessage: {
            content: 'Tack för bra träning idag! Du är riktigt snabb 🔥',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            sender: '6',
            read: true
          },
          unreadCount: 0,
          matchScore: 88
        },
        {
          _id: '4',
          type: 'challenge',
          name: 'Vinterutmaning 2025',
          description: 'Håll igång träningen under vintern',
          participants: [
            { _id: user?._id, firstName: user?.firstName },
            { _id: '7', firstName: 'David', lastName: 'Svensson' },
            { _id: '8', firstName: 'Maria', lastName: 'Larsson' }
          ],
          lastMessage: {
            content: 'Bra jobbat alla! Vi ligger bra till i utmaningen 🎯',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
            sender: '7',
            senderName: 'David',
            read: true
          },
          unreadCount: 0,
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);



  const filteredChats = chats.filter(chat => {
    if (activeTab === 'matches' && chat.type !== 'match') return false;
    if (activeTab === 'challenges' && chat.type !== 'challenge') return false;
    
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
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy className="w-7 h-7 text-white" />
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
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
            {otherParticipant?.profileImage ? (
              <img 
                src={otherParticipant.profileImage} 
                alt={otherParticipant.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xl">
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

  const stats = getTabStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center pb-20 lg:pb-0">
        <LoadingSpinner size="xl" text="Laddar dina chattar..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 pb-20 lg:pb-0">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"
              >
                <MessageCircle className="w-8 h-8" />
                Mina Chattar
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/90 text-lg"
              >
                Håll kontakten med dina löparvänner och utmaningsgrupper
              </motion.p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all"
              >
                <Filter className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewChatModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Ny Chatt
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{chats.length}</div>
              <div className="text-white/80 text-sm">Totalt</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{stats.matches}</div>
              <div className="text-white/80 text-sm">Matches</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{stats.challenges}</div>
              <div className="text-white/80 text-sm">Grupper</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-300">{stats.unread}</div>
              <div className="text-white/80 text-sm">Olästa</div>
            </div>
          </motion.div>

          {/* Enhanced Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative mb-6"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Sök bland dina chattar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl placeholder-white/60 text-white focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
            />
          </motion.div>

          {/* Enhanced Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 p-2 bg-white/20 backdrop-blur-sm rounded-xl"
          >
            {[
              { id: 'all', label: 'Alla', icon: MessageCircle, count: chats.length },
              { id: 'matches', label: 'Matches', icon: Heart, count: stats.matches },
              { id: 'challenges', label: 'Grupper', icon: Trophy, count: stats.challenges }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-white/20 text-white/80'
                  }`}>
                    {tab.count}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto px-4 py-4"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Snabbåtgärder
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app/discover')}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">Hitta match</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app/challenges/create')}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <Trophy className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Skapa utmaning</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app/events/create')}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Planera event</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app/community')}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <Users className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">Community</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
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
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Hitta Löparvänner
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app/challenges')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  Utforska Utmaningar
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => navigate(`/app/chat/${chat._id}`)}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Enhanced Avatar */}
                    {getChatAvatar(chat)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-orange-600 transition-colors">
                            {getChatTitle(chat)}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getChatSubtitle(chat)}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatTime(chat.lastMessage.timestamp)}
                            {getMessageStatus(chat.lastMessage)}
                          </div>
                          
                          {chat.unreadCount > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                            >
                              {chat.unreadCount}
                            </motion.div>
                          )}
                        </div>
                      </div>
                      
                      {/* Last Message */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-3 group-hover:bg-orange-50 transition-colors">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {chat.type === 'challenge' && chat.lastMessage.senderName && (
                            <span className="font-semibold text-orange-600">
                              {chat.lastMessage.senderName}: 
                            </span>
                          )}
                          <span className="ml-1">{chat.lastMessage.content}</span>
                        </p>
                      </div>

                      {/* Chat Type Indicator & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            chat.type === 'challenge' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {chat.type === 'challenge' ? (
                              <>
                                <Trophy className="w-3 h-3" />
                                Utmaning
                              </>
                            ) : (
                              <>
                                <Heart className="w-3 h-3" />
                                Match
                              </>
                            )}
                          </div>
                          
                          {/* Activity indicator */}
                          {chat.type === 'match' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              <Activity className="w-3 h-3" />
                              Aktiv idag
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement quick emoji
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Smile className="w-4 h-4 text-gray-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement chat menu
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal 
        isOpen={showNewChatModal} 
        onClose={() => setShowNewChatModal(false)} 
      />
    </div>
  );
};

export default ChatPage; 