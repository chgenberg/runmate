import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Users, 
  TrendingUp, 
  Search,
  Trophy,
  Target,
  Clock,
  Zap,
  ChevronRight,
  Flag,
  Sparkles,
  Flame,
  X,
  Star,
  Brain,
  Plus
} from 'lucide-react';

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ChallengesLoader } from '../../components/Layout/LoadingSpinner';
import { toast } from 'react-hot-toast';



// Modern Challenge Card Component
const ChallengeCard = ({ challenge, currentUserId, index, showAIScore = false }) => {
  const calculateProgress = () => {
    if (!challenge.participants || !currentUserId) return 0;
    
    const participant = challenge.participants.find(
      p => p.user === currentUserId || p.user._id === currentUserId
    );
    
    if (!participant) return 0;
    
    const metric = challenge.goal.unit === 'km' ? 'distance' : 
                   challenge.goal.unit === 'meters' ? 'elevation' :
                   challenge.goal.unit === 'hours' || challenge.goal.unit === 'time' ? 'time' :
                   challenge.goal.unit === 'activities' ? 'activities' : 'distance';
    
    const progress = participant.progress[metric] || 0;
    const target = challenge.goal.target;
    
    if (challenge.goal.unit === 'hours' && metric === 'time') {
      return Math.min((progress / 3600 / target) * 100, 100);
    }
    
    return Math.min((progress / target) * 100, 100);
  };

  const isJoined = challenge.participants?.some(
    p => p.user === currentUserId || p.user._id === currentUserId
  );
  
  const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const participantCount = challenge.participants?.filter(p => p.isActive !== false).length || 0;
  const progress = calculateProgress();
  
  const getDifficultyColor = (type) => {
    const colors = {
      'distance': 'from-blue-400 to-blue-600',
      'time': 'from-purple-400 to-purple-600',
      'elevation': 'from-orange-400 to-orange-600',
      'activities': 'from-green-400 to-green-600',
      'custom': 'from-pink-400 to-pink-600'
    };
    return colors[type] || 'from-gray-400 to-gray-600';
  };

  const getIcon = (type) => {
    const icons = {
      'distance': Target,
      'time': Clock,
      'elevation': TrendingUp,
      'activities': Flame,
      'custom': Zap
    };
    const Icon = icons[type] || Trophy;
    return <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />;
  };

  const getGoalDisplay = () => {
    const target = challenge.goal.target;
    const unit = challenge.goal.unit;
    
    if (unit === 'km') return `${target} km`;
    if (unit === 'meters') return `${target}m höjdmeter`;
    if (unit === 'time' || unit === 'hours') {
      const hours = Math.floor(target / 3600);
      return `${hours} timmar`;
    }
    if (unit === 'activities') return `${target} aktiviteter`;
    return `${target} ${unit}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link to={`/app/challenges/${challenge._id}`}>
        <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
          {/* Gradient accent top */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getDifficultyColor(challenge.type)}`} />
          
          {/* AI Score Badge */}
          {showAIScore && challenge.aiScore && (
            <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-lg">
              {Math.round(challenge.aiScore)}% match
            </div>
          )}
          
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${getDifficultyColor(challenge.type)} flex items-center justify-center shadow-lg`}>
                  {getIcon(challenge.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {challenge.goal.isCollective ? 'Gemensamt mål' : 'Individuellt mål'}
                  </p>
                </div>
              </div>
              {isJoined && (
                <div className="px-2 md:px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Deltar
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
              {challenge.description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3 md:mb-4">
              <div className="text-center bg-gray-50 rounded-lg p-1.5 md:p-2">
                <div className="text-base md:text-lg font-bold text-gray-900">{participantCount}</div>
                <div className="text-xs text-gray-500">Deltagare</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-1.5 md:p-2">
                <div className="text-base md:text-lg font-bold text-gray-900">{daysRemaining}</div>
                <div className="text-xs text-gray-500">Dagar kvar</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-1.5 md:p-2">
                <div className="text-xs md:text-sm font-bold text-gray-900 leading-tight">{getGoalDisplay()}</div>
                <div className="text-xs text-gray-500">Mål</div>
              </div>
            </div>

            {/* Progress Bar */}
            {isJoined && (
              <div className="mb-3 md:mb-4">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-600">Din framsteg</span>
                  <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full bg-gradient-to-r ${getDifficultyColor(challenge.type)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* AI Reasons */}
            {showAIScore && challenge.aiReasons && challenge.aiReasons.length > 0 && (
              <div className="mb-3 md:mb-4 space-y-1">
                {challenge.aiReasons.slice(0, 2).map((reason, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Participants */}
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {challenge.participants.slice(0, 5).map((p, i) => (
                  <img
                    key={p.user?._id || i} 
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white"
                    src={p.user?.profileImage || `https://ui-avatars.com/api/?name=${p.user?.firstName}+${p.user?.lastName}&background=random`}
                    alt=""
                  />
                ))}
                {participantCount > 5 && (
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">+{participantCount - 5}</span>
                  </div>
                )}
              </div>
              
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [trendingChallenges, setTrendingChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isAIBoxMinimized, setIsAIBoxMinimized] = useState(false);
  const [showAIPromptModal, setShowAIPromptModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) {
        setError('Du måste logga in för att se utmaningar.');
        setLoading(false);
        return;
      }

      const [allRes, myRes, trendingRes] = await Promise.all([
        api.get('/challenges'),
        api.get('/challenges/my-challenges'),
        api.get('/challenges/trending')
      ]);
      setChallenges(allRes.data);
      setMyChallenges(myRes.data);
      setTrendingChallenges(trendingRes.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Din session har gått ut. Logga in igen.');
      } else {
        setError('Kunde inte ladda utmaningar. Försök igen senare.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleAIRecommendations = async () => {
    try {
      setLoadingAI(true);
      
      // Check if user has AI coach profile
      const profileRes = await api.get('/aicoach/profile');
      
      if (!profileRes.data.profile) {
        // Show AI prompt modal instead of redirecting immediately
        setShowAIPromptModal(true);
        return;
      }
      
      // Get AI recommendations
      const recommendationsRes = await api.get('/aicoach/recommended-challenges');
      setAiRecommendations(recommendationsRes.data.recommendations);
      setShowAIRecommendations(true);
      
      toast.success('AI-rekommendationer laddade!');
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      if (error.response?.status === 400) {
        toast.info('Slutför AI-coachen först för att få personliga rekommendationer');
        navigate('/app/dashboard', { state: { openAICoach: true } });
      } else {
        toast.error('Kunde inte hämta AI-rekommendationer');
      }
    } finally {
      setLoadingAI(false);
    }
  };
  
  const getVisibleChallenges = () => {
    // Show AI recommendations if active
    if (showAIRecommendations && aiRecommendations.length > 0) {
      return aiRecommendations;
    }
    
    let list;
    switch(activeTab) {
      case 'my':
        list = myChallenges;
        break;
      case 'all':
        list = challenges;
        break;
      case 'trending':
      default:
        list = trendingChallenges;
    }
    
    if (!searchTerm) {
      return list;
    }
    
    return list.filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const visibleChallenges = getVisibleChallenges();

  // Calculate stats
  const totalChallenges = challenges.length;
  const activeChallenges = myChallenges.filter(c => c.status === 'active').length;
  const completedChallenges = myChallenges.filter(c => c.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20 lg:pb-0">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 opacity-50" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-red-200 to-pink-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 md:pt-8 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-black mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Utmaningar
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8">
              Tävla med andra löpare, sätt nya rekord och nå dina mål tillsammans
            </p>
          </motion.div>

          {/* AI Challenge Recommendation Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mb-6 md:mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl md:rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
                {/* Minimize/Maximize Button */}
                <button
                  onClick={() => setIsAIBoxMinimized(!isAIBoxMinimized)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight 
                    className={`w-4 h-4 md:w-5 md:h-5 text-gray-600 transition-transform ${
                      isAIBoxMinimized ? 'rotate-90' : '-rotate-90'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {!isAIBoxMinimized ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 md:p-8"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                            <Brain className="w-6 h-6 md:w-8 md:h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                              Få AI-utmaningar!
                            </h2>
                            <p className="text-sm md:text-base text-gray-600">
                              Låt vår AI hitta perfekta utmaningar baserat på din träningsnivå
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAIRecommendations}
                          disabled={loadingAI}
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm md:text-base"
                        >
                          {loadingAI ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white" />
                              Analyserar...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                              Aktivera AI
                            </>
                          )}
                        </motion.button>
                      </div>
                      
                      {/* Features */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
                        <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-orange-50 rounded-lg md:rounded-xl">
                          <Target className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                          <span className="text-xs md:text-sm font-medium text-gray-800">Anpassade efter din nivå</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-red-50 rounded-lg md:rounded-xl">
                          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                          <span className="text-xs md:text-sm font-medium text-gray-800">Realistiska mål</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-pink-50 rounded-lg md:rounded-xl">
                          <Users className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
                          <span className="text-xs md:text-sm font-medium text-gray-800">Matcha med likasinnade</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-3 md:p-4 flex items-center justify-center gap-2 md:gap-3"
                    >
                      <Brain className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                      <span className="font-medium text-sm md:text-base text-gray-700">AI-utmaningar</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{totalChallenges}</span>
              </div>
              <p className="text-gray-600 text-xs md:text-sm">Totala utmaningar</p>
            </div>
            
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{activeChallenges}</span>
              </div>
              <p className="text-gray-600 text-xs md:text-sm">Aktiva utmaningar</p>
            </div>
            
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{completedChallenges}</span>
              </div>
              <p className="text-gray-600 text-xs md:text-sm">Avklarade</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          {/* Tab Navigation */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[
              { id: 'trending', label: 'Trendande', icon: Flame },
              { id: 'my', label: 'Mina utmaningar', icon: Star },
              { id: 'all', label: 'Alla utmaningar', icon: Flag }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:text-gray-900 shadow-md'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sök utmaningar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Create Challenge Button */}
          <div className="text-center mt-6">
            <Link to="/app/challenges/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Skapa ny utmaning
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* AI Recommendations Banner */}
        {showAIRecommendations && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl border border-orange-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-bold text-gray-900">AI-rekommendationer aktiva</h3>
                  <p className="text-sm text-gray-600">Visar utmaningar anpassade för din träningsprofil</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIRecommendations(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Challenges Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <ChallengesLoader />
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ett fel uppstod</h3>
              <p className="text-gray-600">{error}</p>
            </motion.div>
          ) : visibleChallenges.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Inga utmaningar hittades</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Prova att söka på något annat' : 'Skapa den första utmaningen!'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {visibleChallenges.map((challenge, index) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  currentUserId={user?._id}
                  index={index}
                  showAIScore={showAIRecommendations}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Prompt Modal */}
      <AnimatePresence>
        {showAIPromptModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowAIPromptModal(false)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-400 to-red-500 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <button
                      onClick={() => setShowAIPromptModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Aktivera AI-matchningar
                  </h3>
                  <p className="text-white/90">
                    För att få personliga utmaningsrekommendationer
                  </p>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-gray-700 mb-4">
                      Vår AI-coach behöver lära känna dig bättre för att kunna rekommendera 
                      perfekta utmaningar som matchar din träningsnivå och mål.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Target className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Anpassade utmaningar</h4>
                          <p className="text-sm text-gray-600">Utmaningar som passar din nuvarande nivå</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Rätt matchningar</h4>
                          <p className="text-sm text-gray-600">Hitta löpare med liknande mål</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Smart progression</h4>
                          <p className="text-sm text-gray-600">Utmaningar som hjälper dig utvecklas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-600 text-center">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Tar endast 5 minuter att genomföra
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowAIPromptModal(false);
                        navigate('/app/dashboard', { state: { openAICoach: true } });
                      }}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Brain className="w-5 h-5" />
                      Starta AI-analys
                    </motion.button>
                    
                    <button
                      onClick={() => setShowAIPromptModal(false)}
                      className="w-full py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                      Kanske senare
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChallengesPage; 