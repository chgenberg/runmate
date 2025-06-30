import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Activity, 
  Star, 
  Heart, 
  ArrowLeft, 
  Trophy,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Target,
  Award,
  MessageCircle,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarUsers, setSimilarUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchSimilarUsers();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/public/${userId}`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to mock data
      setUser(generateMockUser());
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarUsers = async () => {
    try {
      // Get users from the same city
      const response = await api.get('/users/public', {
        params: { limit: 6 }
      });
      
      const allUsers = response.data.users || [];
      // Filter out current user and get random 3
      const filtered = allUsers
        .filter(u => u._id !== userId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      setSimilarUsers(filtered);
    } catch (error) {
      console.error('Error fetching similar users:', error);
      setSimilarUsers([]);
    }
  };

  const generateMockUser = () => ({
    _id: userId,
    firstName: 'Emma',
    lastName: 'Johansson',
    profilePicture: `https://ui-avatars.com/api/?name=Emma+Johansson&background=random&size=400`,
    location: { city: 'Stockholm' },
    pace: '5:30',
    bio: 'Passionerad löpare som älskar att utforska nya rutter och träffa nya träningskompisar. Tränar för mitt första marathon!',
    rating: 4.8,
    totalRuns: 156,
    weeklyGoal: 30,
    totalDistance: 1250,
    favoriteActivities: ['Löpning', 'Trail', 'Intervaller'],
    achievements: [
      { icon: '🏃', title: 'Första 10K', date: '2023-05-15' },
      { icon: '🏆', title: 'Halvmarathon', date: '2023-09-20' },
      { icon: '⭐', title: '100 träningspass', date: '2023-11-01' }
    ],
    stats: {
      avgPace: '5:30',
      longestRun: '21.1 km',
      weeklyAvg: '25 km',
      totalTime: '156 timmar'
    }
  });

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Slutade följa' : 'Följer nu!');
  };

  const handleStartChat = async () => {
    try {
      const response = await api.post(`/chat/direct/${userId}`);
      const chatId = response.data.chat._id;
      navigate(`/app/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast('Skapa konto för att chatta!', {
        icon: '💬',
        duration: 3000
      });
      setTimeout(() => navigate('/register'), 1000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.firstName} ${user.lastName} - RunMate`,
        text: `Kolla in ${user.firstName}s profil på RunMate!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Länk kopierad!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-500 mx-auto"></div>
            <Activity className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">Laddar profil...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Användaren hittades inte</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      icon: <TrendingUp className="w-5 h-5" />, 
      value: user.totalDistance || 0, 
      unit: 'km',
      label: 'Total distans',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: <Trophy className="w-5 h-5" />, 
      value: user.points || '6850', 
      unit: 'p',
      label: 'Poäng',
      color: 'from-orange-500 to-red-500'
    },
    { 
      icon: <Activity className="w-5 h-5" />, 
      value: user.totalRuns || 0, 
      unit: '',
      label: 'Träningspass',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      icon: <Zap className="w-5 h-5" />, 
      value: user.stats?.avgPace || user.pace || '5:30', 
      unit: 'min/km',
      label: 'Snitt-tempo',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Tillbaka</span>
            </button>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden sticky top-24">
              {/* Profile Header */}
              <div className="relative h-32 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              
              {/* Profile Picture */}
              <div className="relative px-6 pb-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="relative -mt-20 mb-4"
                >
                  <img 
                    src={user.profilePicture || user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'User')}+${encodeURIComponent(user.lastName || '')}&size=200&background=random`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover mx-auto"
                    onError={(e) => {
                      if (!e.target.src.includes('ui-avatars.com')) {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'User')}+${encodeURIComponent(user.lastName || '')}&size=200&background=random`;
                      }
                    }}
                  />
                  {user.rating && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-bold text-sm">{user.rating.toFixed(1)}</span>
                    </div>
                  )}
                </motion.div>

                {/* Name and Location */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location?.city || user.location || 'Okänd plats'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartChat}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Skicka meddelande
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFollow}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      isFollowing 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Users className="w-5 h-5" />
                        Följer
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        Följ
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.totalRuns || 0}</p>
                      <p className="text-xs text-gray-500">Löprundor</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{user.weeklyGoal || 0}km</p>
                      <p className="text-xs text-gray-500">Veckans mål</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.achievements?.length || 0}</p>
                      <p className="text-xs text-gray-500">Prestationer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Bio Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Om {user.firstName}
              </h2>
              <p className="text-gray-600 leading-relaxed">{user.bio}</p>
              
              {/* Favorite Activities */}
              {user.favoriteActivities && user.favoriteActivities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Favoritaktiviteter</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.favoriteActivities.map((activity, idx) => (
                      <motion.span 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full font-medium text-sm"
                      >
                        {activity}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Tabs */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-100">
                {['stats', 'achievements', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 font-medium transition-all relative ${
                      activeTab === tab 
                        ? 'text-orange-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'stats' && 'Statistik'}
                    {tab === 'achievements' && 'Prestationer'}
                    {tab === 'history' && 'Historik'}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {stats.map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-gray-50 to-gray-100"
                        >
                          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-10 -mt-10`}></div>
                          <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-2`}>
                            {stat.icon}
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {stat.value}{stat.unit}
                          </p>
                          <p className="text-sm text-gray-500">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Additional Stats */}
                    <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                      <div className="text-center">
                        <Clock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-lg font-semibold">{user.stats?.totalTime || '156 timmar'}</p>
                        <p className="text-xs text-gray-500">Total tid</p>
                      </div>
                      <div className="text-center">
                        <Target className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-lg font-semibold">{user.stats?.longestRun || '21.1 km'}</p>
                        <p className="text-xs text-gray-500">Längsta rutt</p>
                      </div>
                      <div className="text-center">
                        <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-lg font-semibold">{user.stats?.weeklyAvg || '25 km'}</p>
                        <p className="text-xs text-gray-500">Veckosnitt</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    {user.achievements && user.achievements.length > 0 ? (
                      <div className="grid gap-4">
                        {user.achievements.map((achievement, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:shadow-md transition-shadow"
                          >
                            <div className="text-3xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{achievement.title}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(achievement.date).toLocaleDateString('sv-SE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <Award className="w-5 h-5 text-orange-500" />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Inga prestationer än</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Träningshistorik kommer snart</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Similar Users */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Fler löpare i {user.location?.city || user.location || 'området'}
              </h2>
              
              {similarUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {similarUsers.map((similarUser, idx) => (
                    <motion.div
                      key={similarUser._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => navigate(`/profile/${similarUser._id}`)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={similarUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(similarUser.firstName || 'User')}+${encodeURIComponent(similarUser.lastName || '')}&background=random`}
                          alt={`${similarUser.firstName} ${similarUser.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(similarUser.firstName || 'User')}+${encodeURIComponent(similarUser.lastName || '')}&background=random`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {similarUser.firstName} {similarUser.lastName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {similarUser.location?.city || similarUser.location || 'Sverige'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          <Activity className="w-3 h-3 inline mr-1" />
                          {similarUser.pace || '5:30'} min/km
                        </span>
                        {similarUser.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="font-medium">{similarUser.rating.toFixed(1)}</span>
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Inga liknande löpare hittades</p>
                </div>
              )}
            </motion.div>

            {/* CTA Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 text-white text-center"
            >
              <h3 className="text-2xl font-bold mb-3">Vill du träna med {user.firstName}?</h3>
              <p className="text-white/90 mb-6">Gå med i RunMate för att matcha och börja träna tillsammans!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="inline-flex items-center px-8 py-3 bg-white text-orange-600 rounded-full font-semibold text-lg transform transition-all hover:shadow-lg"
              >
                <Heart className="w-6 h-6 mr-2" />
                Skapa konto & matcha
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage; 