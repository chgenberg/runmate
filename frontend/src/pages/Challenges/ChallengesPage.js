import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  Calendar,
  Flag,
  Sparkles,
  Flame,
  X
} from 'lucide-react';

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ChallengesLoader } from '../../components/Layout/LoadingSpinner';

const InfoChip = ({ icon: Icon, value, label }) => (
  <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
    <Icon className="w-5 h-5 text-gray-600 mx-auto mb-1" />
    <div className="text-sm font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
);

// Enhanced Challenge Card Component with Modern Design
const ChallengeCard = ({ challenge, currentUserId }) => {
  // Calculate progress based on goal type
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
    
    // Convert time from seconds to hours if needed
    if (challenge.goal.unit === 'hours' && metric === 'time') {
      return Math.min((progress / 3600 / target) * 100, 100);
    }
    
    return Math.min((progress / target) * 100, 100);
  };

  // Check if user is joined
  const isJoined = challenge.participants?.some(
    p => p.user === currentUserId || p.user._id === currentUserId
  );
  
  // Calculate days remaining
  const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
  
  // Calculate participant count
  const participantCount = challenge.participants?.filter(p => p.isActive !== false).length || 0;
  
  const progress = calculateProgress();
  
  const getDifficultyColor = (type) => {
    const colors = {
      'distance': 'from-blue-500 to-cyan-500',
      'time': 'from-purple-500 to-pink-500',
      'elevation': 'from-orange-500 to-red-500',
      'activities': 'from-green-500 to-emerald-500',
      'custom': 'from-yellow-500 to-orange-500'
    };
    return colors[type] || 'from-gray-400 to-gray-500';
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
    return <Icon className="w-6 h-6 text-white" />;
  };

  // Format goal display
  const getGoalDisplay = () => {
    const target = challenge.goal.target;
    const unit = challenge.goal.unit;
    
    if (unit === 'km') return `${target} km`;
    if (unit === 'meters') return `${target}m`;
    if (unit === 'time' || unit === 'hours') {
      const hours = Math.floor(target / 3600);
      return `${hours}h`;
    }
    if (unit === 'activities') return `${target}`;
    return `${target} ${unit}`;
  };

  return (
    <Link to={`/app/challenges/${challenge._id}`} className="block h-full">
      <motion.div 
        className="group relative h-full"
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background Gradient Glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${getDifficultyColor(challenge.type)} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
        
        {/* Card Content */}
        <div className="relative bg-white backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
          {/* Decorative Top Pattern */}
          <div className="absolute top-0 left-0 right-0 h-32 opacity-20">
            <div className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor(challenge.type)}`} />
            <svg className="absolute bottom-0 w-full h-8 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor"></path>
            </svg>
          </div>
        
          <div className="relative p-6 z-10 flex flex-col flex-grow">
            {/* Header Section */}
            <div className="flex-grow">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getDifficultyColor(challenge.type)} flex items-center justify-center shadow-lg text-white shrink-0`}>
                  {getIcon(challenge.type)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {challenge.goal.isCollective ? 'Gemensamt mål' : 'Individuellt mål'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{challenge.description}</p>
            </div>
            
            {/* Stats and Progress */}
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <InfoChip icon={Users} value={participantCount} label="Deltagare" />
                <InfoChip icon={Calendar} value={daysRemaining} label="Dagar kvar" />
                <InfoChip icon={Trophy} value={getGoalDisplay()} label="Mål" />
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">Framsteg</span>
                  <span className={`font-bold ${isJoined ? 'text-primary' : 'text-gray-600'}`}>{isJoined ? `${Math.round(progress)}%` : 'Gå med för att se'}</span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getDifficultyColor(challenge.type)} shadow-sm`}
                    initial={{ width: 0 }}
                    animate={{ width: `${isJoined ? progress : challenge.progressPercentage || 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Action Section */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {challenge.participants.slice(0, 4).map((p) => (
                    <img
                      key={p.user?._id || p._id} 
                      className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                      src={p.user?.profileImage || `https://ui-avatars.com/api/?name=${p.user?.firstName}+${p.user?.lastName}&background=random`}
                      alt={p.user?.firstName}
                    />
                  ))}
                  {participantCount > 4 && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-gray-700">+{participantCount - 4}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
                  <span>Visa mer</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// Empty State Component
const EmptyState = ({ message, description, showLoginButton = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-24"
  >
    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
      <Flag className="w-12 h-12 text-gray-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">{message}</h3>
    <p className="text-gray-600 max-w-md mx-auto text-lg mb-6">{description}</p>
    {showLoginButton && (
      <Link to="/login">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-primary to-purple-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Logga in
        </motion.button>
      </Link>
    )}
  </motion.div>
);

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [trendingChallenges, setTrendingChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trending');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
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
  
  const getVisibleChallenges = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 left-1/3 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-sm rounded-full mb-6 border border-primary/20"
            >
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary">Utmana dig själv</span>
            </motion.div>
            
            <h1 className="text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Upptäck Utmaningar
              </span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
              Gå med i spännande utmaningar, tävla med andra löpare och överträffa dina personliga mål
            </p>
            
            <Link to="/app/challenges/create">
              <motion.button 
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-10 py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Sparkles className="w-6 h-6 relative z-10" />
                <span className="relative z-10 text-lg">Skapa ny utmaning</span>
                <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{/*Container for rest of content*/}

        {/* Stats Cards with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 -mt-20"
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-700 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white backdrop-blur-xl rounded-3xl p-8 border border-purple-100 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-6 shadow-xl mx-auto">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-black text-transparent bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text mb-2 text-center">{totalChallenges}</div>
              <div className="text-sm font-medium text-gray-700 text-center">Totalt antal utmaningar</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white backdrop-blur-xl rounded-3xl p-8 border border-green-100 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-xl mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text mb-2 text-center">{activeChallenges}</div>
              <div className="text-sm font-medium text-gray-700 text-center">Aktiva utmaningar</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white backdrop-blur-xl rounded-3xl p-8 border border-blue-100 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6 shadow-xl mx-auto">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text mb-2 text-center">{completedChallenges}</div>
              <div className="text-sm font-medium text-gray-700 text-center">Avklarade utmaningar</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filters with Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Tab Navigation with Pills */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('trending')}
              className={`
                px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2
                ${activeTab === 'trending' 
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/25' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg border border-gray-200'
                }
              `}
            >
              <Flame className="w-4 h-4" />
              Trendande
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('my')}
              className={`
                px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2
                ${activeTab === 'my' 
                  ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg border border-gray-200'
                }
              `}
            >
              <Trophy className="w-4 h-4" />
              Mina utmaningar
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('all')}
              className={`
                px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2
                ${activeTab === 'all' 
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg border border-gray-200'
                }
              `}
            >
              <Users className="w-4 h-4" />
              Alla utmaningar
            </motion.button>
          </div>

          {/* Search Bar with Glass Effect */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-3xl blur-2xl" />
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-1">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Sök efter utmaningar, deltagare eller mål..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-transparent placeholder-gray-500 text-gray-900 focus:outline-none text-lg font-medium rounded-3xl"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Challenges Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <ChallengesLoader />
          ) : error ? (
            <EmptyState
              message={error.includes('logga in') ? 'Inloggning krävs' : 'Något gick fel'}
              description={error}
              showLoginButton={error.includes('logga in') || error.includes('session')}
            />
          ) : (
            <AnimatePresence mode="wait">
              {visibleChallenges.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {visibleChallenges.map((challenge, index) => (
                    <motion.div
                      key={challenge._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ChallengeCard challenge={challenge} currentUserId={user?._id} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyState
                  message="Inga utmaningar hittades"
                  description={
                    searchTerm 
                      ? "Prova att ändra din sökning för att hitta fler utmaningar"
                      : activeTab === 'my' 
                        ? "Du har inte gått med i några utmaningar än. Utforska trendande utmaningar för att komma igång!"
                        : "Det finns inga utmaningar att visa just nu. Skapa den första!"
                  }
                />
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChallengesPage; 