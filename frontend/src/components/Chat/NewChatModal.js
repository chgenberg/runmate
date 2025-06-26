import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Users,
  Trophy,
  MessageCircle,
  Star,
  MapPin,
  Activity,
  Zap,
  Heart,
  Clock,
  Filter,
  ChevronRight,
  Sparkles,
  UserPlus,
  Crown
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NewChatModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matches');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    distance: 50,
    level: 'all',
    activityLevel: 'all'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'matches') {
        // Load potential matches
        const response = await api.get('/users/discover', {
          params: selectedFilters
        });
        setUsers(response.data.users || getDemoUsers());
      } else {
        // Load challenges
        const response = await api.get('/challenges');
        setChallenges(response.data.challenges || getDemoChallenges());
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Use demo data on error
      if (activeTab === 'matches') {
        setUsers(getDemoUsers());
      } else {
        setChallenges(getDemoChallenges());
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedFilters]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const getDemoUsers = () => [
    {
      _id: '1',
      firstName: 'Emma',
      lastName: 'Johansson',
      profileImage: '/avatar2.png',
      location: { city: 'Stockholm' },
      distance: 5,
      matchScore: 95,
      activityLevel: 'Mycket aktiv',
      pace: '5:30/km',
      favoriteRoutes: ['Djurgården', 'Hagaparken'],
      bio: 'Älskar morgonlöpning och tränar för Stockholm Marathon',
      isOnline: true,
      stats: {
        totalRuns: 234,
        weeklyAverage: 35,
        longestRun: 21
      }
    },
    {
      _id: '2',
      firstName: 'Marcus',
      lastName: 'Andersson',
      location: { city: 'Solna' },
      distance: 8,
      matchScore: 88,
      activityLevel: 'Aktiv',
      pace: '5:00/km',
      favoriteRoutes: ['Råstasjön', 'Solna centrum'],
      bio: 'Intervallträning och tempopass är min grej!',
      isOnline: false,
      stats: {
        totalRuns: 156,
        weeklyAverage: 28,
        longestRun: 18
      }
    },
    {
      _id: '3',
      firstName: 'Sofia',
      lastName: 'Lindberg',
      profileImage: '/avatar2.png',
      location: { city: 'Täby' },
      distance: 12,
      matchScore: 92,
      activityLevel: 'Mycket aktiv',
      pace: '6:00/km',
      favoriteRoutes: ['Täby centrum', 'Näsbypark'],
      bio: 'Nybörjare som söker träningspartner för motivation',
      isOnline: true,
      stats: {
        totalRuns: 45,
        weeklyAverage: 15,
        longestRun: 10
      }
    }
  ];

  const getDemoChallenges = () => [
    {
      _id: '1',
      name: 'Stockholm Marathon 2025',
      description: 'Träna tillsammans inför årets största lopp',
      participants: 45,
      startDate: '2025-06-01',
      endDate: '2025-06-01',
      difficulty: 'Avancerad',
      category: 'Marathon',
      image: '/lopning3.png',
      isActive: true,
      progress: 35
    },
    {
      _id: '2',
      name: 'Vinterutmaning 2025',
      description: 'Håll igång träningen under de kalla månaderna',
      participants: 128,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      difficulty: 'Medel',
      category: 'Uthållighet',
      image: '/lopning4.png',
      isActive: true,
      progress: 60
    },
    {
      _id: '3',
      name: '5K på 25 minuter',
      description: 'Slå din personbästa tillsammans med andra',
      participants: 67,
      startDate: '2025-02-01',
      endDate: '2025-04-30',
      difficulty: 'Nybörjare',
      category: 'Hastighet',
      image: '/lopning5.png',
      isActive: true,
      progress: 20
    }
  ];

  const handleStartChat = async (userId) => {
    try {
      // For demo purposes, create a simple chat ID and navigate directly
      const demoUser = users.find(u => u._id === userId);
      if (demoUser) {
        onClose();
        navigate(`/app/chat/${userId}`);
        toast.success(`Chatt startad med ${demoUser.firstName}!`);
      }
      
      /* Uncomment when backend is fully working
      const response = await api.post('/chat/create', {
        participantId: userId,
        initialMessage: 'Hej! Jag såg att vi har liknande träningsrutiner. Vill du springa tillsammans någon gång? 🏃‍♂️'
      });
      
      if (response.data.success) {
        onClose();
        navigate(`/app/chat/${response.data.chatId}`);
        toast.success('Chatt skapad!');
      }
      */
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Kunde inte skapa chatt');
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await api.post(`/challenges/${challengeId}/join`);
      onClose();
      navigate(`/app/challenges/${challengeId}`);
      toast.success('Du har gått med i utmaningen!');
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Kunde inte gå med i utmaningen');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.location?.city?.toLowerCase().includes(query) ||
      user.bio?.toLowerCase().includes(query)
    );
  });

  const filteredChallenges = challenges.filter(challenge => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      challenge.name?.toLowerCase().includes(query) ||
      challenge.description?.toLowerCase().includes(query) ||
      challenge.category?.toLowerCase().includes(query)
    );
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl max-h-[80vh] bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl md:text-3xl font-bold flex items-center gap-3"
                >
                  <Sparkles className="w-8 h-8" />
                  Starta Ny Chatt
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Search */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Sök efter löpare eller utmaningar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl placeholder-white/60 text-white focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
              </motion.div>

              {/* Tabs */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2 mt-4"
              >
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'matches'
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Löparvänner
                </button>
                <button
                  onClick={() => setActiveTab('challenges')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'challenges'
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  Utmaningar
                </button>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-240px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'matches' ? (
                    <div className="space-y-4">
                      {filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600">Inga löpare hittades</p>
                        </div>
                      ) : (
                        filteredUsers.map((user, index) => (
                          <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => handleStartChat(user._id)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Avatar */}
                              <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center overflow-hidden">
                                  {user.profileImage ? (
                                    <img 
                                      src={user.profileImage} 
                                      alt={user.firstName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-white font-bold text-xl">
                                      {user.firstName?.[0]}
                                    </span>
                                  )}
                                </div>
                                {user.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                                )}
                                {user.matchScore >= 90 && (
                                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                                    <Crown className="w-3 h-3 text-yellow-900" />
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                      {user.firstName} {user.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {user.location?.city} • {user.distance}km bort
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 text-orange-600 font-bold">
                                      <Star className="w-4 h-4 fill-current" />
                                      {user.matchScore}%
                                    </div>
                                    <p className="text-xs text-gray-500">match</p>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-700 mb-3">{user.bio}</p>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    {user.activityLevel}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    {user.pace}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {user.stats?.weeklyAverage}km/v
                                  </div>
                                </div>

                                {/* Action */}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="mt-3 flex items-center gap-2 text-orange-600 font-medium group-hover:text-orange-700"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Starta chatt
                                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredChallenges.length === 0 ? (
                        <div className="col-span-2 text-center py-12">
                          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600">Inga utmaningar hittades</p>
                        </div>
                      ) : (
                        filteredChallenges.map((challenge, index) => (
                          <motion.div
                            key={challenge._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => handleJoinChallenge(challenge._id)}
                          >
                            {/* Image */}
                            <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                              {challenge.image && (
                                <img 
                                  src={challenge.image} 
                                  alt={challenge.name}
                                  className="w-full h-full object-cover opacity-80"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <div className="absolute bottom-2 left-2 right-2">
                                <h3 className="font-bold text-white text-lg">{challenge.name}</h3>
                                <p className="text-white/80 text-sm">{challenge.category}</p>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <p className="text-sm text-gray-700 mb-3">{challenge.description}</p>
                              
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {challenge.participants} deltagare
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    {challenge.difficulty}
                                  </div>
                                </div>
                              </div>

                              {/* Progress */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{challenge.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                    style={{ width: `${challenge.progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Action */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium group-hover:shadow-lg transition-all flex items-center justify-center gap-2"
                              >
                                <UserPlus className="w-4 h-4" />
                                Gå med
                              </motion.button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer with filters (for matches) */}
            {activeTab === 'matches' && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span>Filter:</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedFilters.distance}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, distance: e.target.value }))}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                    >
                      <option value="10">10 km</option>
                      <option value="25">25 km</option>
                      <option value="50">50 km</option>
                      <option value="100">100 km</option>
                    </select>
                    <select
                      value={selectedFilters.level}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, level: e.target.value }))}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                    >
                      <option value="all">Alla nivåer</option>
                      <option value="beginner">Nybörjare</option>
                      <option value="intermediate">Medel</option>
                      <option value="advanced">Avancerad</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewChatModal; 