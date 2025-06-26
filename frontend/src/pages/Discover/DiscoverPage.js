import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Heart,
  X,
  MapPin,
  Zap,
  Trophy,
  Sparkles,
  SlidersHorizontal,
  Users,
  Star,
  MessageCircle,
  TrendingUp,
  Calendar,
  Activity,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle,
  Brain,
  Target,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AICoachOnboarding from '../../components/AICoach/AICoachOnboarding';
import CoachingResults from '../../components/AICoach/CoachingResults';

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [runners, setRunners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    distance: 50,
    pace: 'all',
    level: 'all'
  });
  const [viewMode, setViewMode] = useState('stack'); // 'stack' or 'scroll'
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [hasAiProfile, setHasAiProfile] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [showAIOnboarding, setShowAIOnboarding] = useState(false);
  const [showCoachingResults, setShowCoachingResults] = useState(false);
  const [coachingPlan, setCoachingPlan] = useState(null);
  const [isAiSectionMinimized, setIsAiSectionMinimized] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);

  const constraintsRef = useRef(null);

  // Motion values for swipe animations (not used in current implementation)

  const fetchAiMatches = useCallback(async () => {
    try {
      const response = await api.get('/users/ai-matches');
      setAiMatches(response.data.matches || getDemoAiMatches());
    } catch (error) {
      console.error('Error fetching AI matches:', error);
      // Use demo AI matches
      setAiMatches(getDemoAiMatches());
    }
  }, []);

  const checkAiProfile = useCallback(async () => {
    try {
      const response = await api.get('/dashboard');
      const hasCompleted = response.data?.hasCompletedAIAnalysis || false;
      setHasAiProfile(hasCompleted);
      
      if (hasCompleted) {
        // Fetch AI matches if profile is complete
        fetchAiMatches();
      } else {
        // Show AI popup after a short delay if no profile
        setTimeout(() => {
          setShowAIPopup(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking AI profile:', error);
      setHasAiProfile(false);
      // Show AI popup on error too
      setTimeout(() => {
        setShowAIPopup(true);
      }, 1000);
    }
  }, [fetchAiMatches]);

  const fetchRunners = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch regular runners
      const response = await api.get('/users/discover', { params: filters });
      const backendUsers = response.data.users || [];
      
      // Map backend data to frontend format
      const mappedUsers = backendUsers.map(user => ({
        id: user._id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonym löpare',
        age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 
             user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : null,
        location: user.location?.city || 'Okänd stad',
        distance: user.distance || Math.floor(Math.random() * 50) + 1,
        bio: user.bio || 'Passionerad löpare som älskar att utforska nya rutter och träffa likasinnade!',
        level: user.activityLevel || 'Medel',
        pace: user.avgPace || `${Math.floor(Math.random() * 2) + 4}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        weeklyDistance: user.weeklyDistance || Math.floor(Math.random() * 50) + 20,
        interests: user.sportTypes || user.sports || user.preferredRunTypes || ['Löpning', 'Träning'],
        profilePicture: user.profilePicture || user.photos?.[0] || '/avatar2.png',
        rating: user.rating || (4.0 + Math.random() * 1.0),
        totalRuns: user.trainingStats?.totalRuns || Math.floor(Math.random() * 200) + 50,
        achievements: user.achievements || ['Löpare', 'Träningsentusiast'],
        joinedDate: user.createdAt || new Date(Date.now() - Math.random() * 31536000000), // Random date within last year
        longestRun: user.longestRun || Math.floor(Math.random() * 30) + 10,
        favoriteTime: user.favoriteTime || ['Morgon', 'Kväll', 'Eftermiddag'][Math.floor(Math.random() * 3)],
        goals: user.goals || ['Förbättra hälsa', 'Träffa nya vänner']
      }));
      
      setRunners(mappedUsers);
    } catch (error) {
      console.error('Error fetching runners:', error);
      // Demo data
      setRunners(getDemoRunners());
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Check if user has AI profile
  useEffect(() => {
    fetchRunners();
    checkAiProfile();
  }, [fetchRunners, checkAiProfile]);

  const handleStartAIAnalysis = () => {
    setShowAIPopup(false);
    setShowAIOnboarding(true);
  };

  const handleAIOnboardingComplete = (plan) => {
    setCoachingPlan(plan);
    setHasAiProfile(true);
    setShowCoachingResults(true);
    
    // Fetch AI matches after completing onboarding
    fetchAiMatches();
  };

  const handleSwipe = async (direction, userId) => {
    if (direction === 'right') {
      // Like
      try {
        // For demo, simulate match randomly
        const isMatch = Math.random() > 0.5;
        
        if (isMatch) {
          toast.success(
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span>Det blev en match! Nu kan ni chatta!</span>
            </div>
          );
        } else {
          toast.success(
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Gillat! Om {runners.find(r => r.id === userId)?.name || 'personen'} också gillar dig blir det en match!</span>
            </div>
          );
        }
        
        // Try API call but don't block on error
        try {
          await api.post(`/users/${userId}/like`);
        } catch (apiError) {
          // Silently handle API error since we already showed success
        }
      } catch (error) {
        console.error('Error liking runner:', error);
        toast.error('Något gick fel, försök igen');
      }
    } else {
      // Skip - remove from feed
      setRunners(prev => prev.filter(r => r.id !== userId));
      toast(
        <div className="flex items-center gap-2">
          <X className="w-5 h-5 text-gray-500" />
          <span>Skippad</span>
        </div>,
        { duration: 2000 }
      );
    }

    // Move to next runner in stack mode or remove from list in scroll mode
    if (viewMode === 'stack') {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    } else {
      // In scroll mode, remove the card after animation
      setTimeout(() => {
        setRunners(prev => prev.filter(r => r.id !== userId));
      }, 300);
    }
  };

  const handleAiMatchMessage = (userId) => {
    // Navigate to chat with this user
    navigate(`/app/chat/${userId}`);
  };

  const currentRunner = runners[currentIndex];
  const hasMoreRunners = currentIndex < runners.length;

  const levelColors = {
    'Nybörjare': 'bg-green-500',
    'Medel': 'bg-yellow-500',
    'Avancerad': 'bg-red-500',
    'Expert': 'bg-purple-500'
  };

  const RunnerCard = ({ runner, isAiMatch = false, index = 0 }) => {
    const cardX = useMotionValue(0);
    const cardRotate = useTransform(cardX, [-200, 200], [-30, 30]);
    const cardOpacity = useTransform(cardX, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const cardLikeOpacity = useTransform(cardX, [0, 100], [0, 1]);
    const cardSkipOpacity = useTransform(cardX, [-100, 0], [1, 0]);

    const isMobile = window.innerWidth < 768;

    return (
      <motion.div
        className={`${viewMode === 'stack' ? 'absolute' : 'relative'} w-full ${viewMode === 'scroll' ? 'max-w-5xl' : (isMobile && viewMode === 'stack' ? 'h-full' : 'max-w-md')} mx-auto`}
        style={viewMode === 'stack' ? { 
          x: cardX, 
          rotate: cardRotate, 
          opacity: cardOpacity,
          zIndex: runners.length - index
        } : {}}
        drag={viewMode === 'stack' && isMobile ? "x" : false}
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
          if (viewMode === 'stack') {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -10000) {
              handleSwipe('left', runner.id);
            } else if (swipe > 10000) {
              handleSwipe('right', runner.id);
            }
          }
        }}
        whileDrag={{ scale: 1.05 }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className={`${isAiMatch ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-2 border-orange-300 shadow-2xl' : 'bg-white shadow-lg'} ${isMobile && viewMode === 'stack' ? 'h-full rounded-none' : 'rounded-2xl'} overflow-hidden ${viewMode === 'stack' && isMobile ? 'cursor-grab active:cursor-grabbing' : ''} ${viewMode === 'scroll' ? 'hover:shadow-xl transition-shadow' : ''}`}>
          {/* AI Match Special Header */}
          {isAiMatch && (
            <div className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-4 py-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-sm">AI SUPERMATCH - {runner.matchReason}</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          )}

          <div className={`${viewMode === 'scroll' ? 'flex flex-col md:flex-row' : ''}`}>
            {/* Left side - Profile picture and basic info */}
            <div className={`${viewMode === 'scroll' ? 'md:w-1/3 p-6' : 'relative'}`}>
              {viewMode === 'stack' ? (
                // Stack view header
                <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Profile Picture - Smaller */}
                  <div className="absolute -bottom-12 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                    <img
                      src={runner.profilePicture}
                      alt={runner.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/avatar2.png';
                      }}
                    />
                  </div>

                  {/* Level Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-bold ${levelColors[runner.level] || 'bg-gray-500'}`}>
                    {runner.level}
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="font-bold text-xs">{runner.rating.toFixed(1)}</span>
                  </div>
                </div>
              ) : (
                // List view profile section
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-200">
                    <img
                      src={runner.profilePicture}
                      alt={runner.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/avatar2.png';
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {runner.name}{runner.age && `, ${runner.age}`}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {runner.location} • {runner.distance} km bort
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${levelColors[runner.level] || 'bg-gray-500'}`}>
                      {runner.level}
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="font-bold text-xs">{runner.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons for desktop list view */}
                  {!isMobile && viewMode === 'scroll' && (
                    <div className="flex gap-3 mt-4 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSwipe('left', runner.id)}
                        className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-7 h-7" />
                      </motion.button>
                      {isAiMatch ? (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAiMatchMessage(runner.id)}
                          className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-lg flex items-center justify-center text-white hover:from-orange-600 hover:to-yellow-600 transition-all"
                        >
                          <MessageCircle className="w-7 h-7" />
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSwipe('right', runner.id)}
                          className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-500 text-green-500 hover:bg-green-50 transition-colors"
                        >
                          <Heart className="w-7 h-7" />
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right side - Content */}
            <div className={`${viewMode === 'scroll' ? 'md:w-2/3 p-6' : 'pt-16 px-6 pb-6'}`}>
              {viewMode === 'stack' && (
                <>
                  {/* Name and Location for stack view */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {runner.name}{runner.age && `, ${runner.age}`}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {runner.location} • {runner.distance} km bort
                    </p>
                  </div>
                </>
              )}

              {/* Bio */}
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{runner.bio}</p>

              {/* Stats Grid - Main Focus */}
              <div className={`${isAiMatch ? 'bg-gradient-to-br from-orange-100 to-yellow-100' : 'bg-gradient-to-br from-gray-50 to-gray-100'} rounded-xl p-4 mb-4`}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{runner.pace}</p>
                    <p className="text-xs text-gray-500">min/km</p>
                  </div>
                  <div className="text-center border-x border-gray-200">
                    <div className="flex items-center justify-center mb-1">
                      <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{runner.weeklyDistance}</p>
                    <p className="text-xs text-gray-500">km/vecka</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{runner.longestRun}</p>
                    <p className="text-xs text-gray-500">längsta (km)</p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-bold">{runner.totalRuns}</span> löprundor
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-700">
                      Föredrar <span className="font-bold">{runner.favoriteTime}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Interests/Goals */}
              <div className="flex flex-wrap gap-2 mb-4">
                {runner.interests.slice(0, 4).map((interest, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 ${isAiMatch ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'} rounded-full text-xs font-medium`}
                  >
                    {interest}
                  </span>
                ))}
              </div>

              {/* Action Buttons for mobile or stack view */}
              {(isMobile || viewMode === 'stack') && (
                <div className="flex gap-4 mt-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('left', runner.id)}
                    className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-8 h-8" />
                  </motion.button>
                  {isAiMatch ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAiMatchMessage(runner.id)}
                      className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-lg flex items-center justify-center text-white hover:from-orange-600 hover:to-yellow-600 transition-all"
                    >
                      <MessageCircle className="w-8 h-8" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSwipe('right', runner.id)}
                      className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-500 text-green-500 hover:bg-green-50 transition-colors"
                    >
                      <Heart className="w-8 h-8" />
                    </motion.button>
                  )}
                </div>
              )}


            </div>

            {/* Swipe Indicators for Stack Mode */}
            {viewMode === 'stack' && (
              <>
                <motion.div
                  className="absolute top-1/2 left-4 transform -translate-y-1/2"
                  style={{ opacity: cardSkipOpacity }}
                >
                  <div className="bg-red-500 text-white p-3 rounded-full">
                    <X className="w-6 h-6" />
                  </div>
                </motion.div>
                
                <motion.div
                  className="absolute top-1/2 right-4 transform -translate-y-1/2"
                  style={{ opacity: cardLikeOpacity }}
                >
                  <div className="bg-green-500 text-white p-3 rounded-full">
                    <Heart className="w-6 h-6" />
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Info Modal Component
  const InfoModal = () => (
    <AnimatePresence>
      {showInfoModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowInfoModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[60] p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Så fungerar matchning</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gilla löpare</h3>
                    <p className="text-sm text-gray-600">Swipa höger eller klicka på hjärtat för att gilla någon</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 rounded-full p-2 mt-1">
                    <Sparkles className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-matchningar</h3>
                    <p className="text-sm text-gray-600">Dina top 5 AI-matchningar kan du skriva till direkt utan att matcha!</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Det blir en match!</h3>
                    <p className="text-sm text-gray-600">När båda gillar varandra kan ni börja chatta</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 rounded-full p-2 mt-1">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Skippa</h3>
                    <p className="text-sm text-gray-600">Swipa vänster eller klicka på X för att gå vidare</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Förstått!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // AI Analysis Popup
  const AIAnalysisPopup = () => (
    <AnimatePresence>
      {showAIPopup && !hasAiProfile && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={() => setShowAIPopup(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[110] p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative">
              {/* Close button */}
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4"
                >
                  <Brain className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 uppercase">FÅ AI-MATCHNINGAR!</h2>
                <p className="text-gray-600">
                  Slutför din AI-coachprofil för att få de 5 bästa matchningarna baserat på dina träningsmål och preferenser.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: Target, text: 'Målanalys', desc: 'Hitta löpare med samma mål' },
                  { icon: Users, text: 'Matchningar', desc: '5 perfekta träningspartners' },
                  { icon: MessageCircle, text: 'Direkt chatt', desc: 'Skriv utan att matcha' },
                  { icon: Trophy, text: 'Träna ihop', desc: 'Nå era mål tillsammans' }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{benefit.text}</p>
                      <p className="text-sm text-gray-600">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartAIAnalysis}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 uppercase"
              >
                <Sparkles className="w-5 h-5" />
                STARTA AI-ANALYS
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Tar bara 5 minuter • Helt gratis
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Hitta löparvänner
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Upptäck löpare i din närhet
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Info Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInfoModal(true)}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Info className="w-5 h-5" />
              </motion.button>

              {/* View Mode Toggle */}
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('scroll')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'scroll' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('stack')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'stack' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Kort
                </button>
              </div>

              {/* Filter Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-b from-white to-gray-50 border-b shadow-lg overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              {/* Distance Slider */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Max avstånd
                  </label>
                  <span className="text-lg font-bold text-blue-600">{filters.distance} km</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.distance}
                    onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${filters.distance}%, #E5E7EB ${filters.distance}%, #E5E7EB 100%)`
                    }}
                  />
                </div>
              </div>
              
              {/* Level Buttons */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Nivå
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['all', 'Nybörjare', 'Medel', 'Avancerad'].map((level) => (
                    <motion.button
                      key={level}
                      onClick={() => setFilters({ ...filters, level })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        filters.level === level
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level === 'all' ? '🌟 Alla' : level === 'Nybörjare' ? '🌱 Nybörjare' : level === 'Medel' ? '💪 Medel' : '🚀 Avancerad'}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <p className="text-gray-600">Laddar löpare...</p>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'scroll' ? 'space-y-6' : ''}>
            {/* AI Matches Section - Removed the large section, only show matches if completed */}
            {hasAiProfile && aiMatches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900">Dina AI-supermatchningar</h2>
                  <span className="text-sm text-gray-600">- Skriv direkt utan att matcha!</span>
                </div>
                
                <div className={viewMode === 'scroll' ? 'space-y-4' : 'relative h-[600px]'}>
                  {viewMode === 'scroll' ? (
                    aiMatches.map((match) => (
                      <RunnerCard key={match.id} runner={match} isAiMatch={true} />
                    ))
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {aiMatches.slice(0, 3).map((match) => (
                        <RunnerCard key={match.id} runner={match} isAiMatch={true} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Regular Runners */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                Andra löpare i närheten
              </h2>
              
              {viewMode === 'stack' ? (
                <div className={`relative ${window.innerWidth < 768 ? 'h-screen -mx-4 -mt-6' : 'h-[600px]'} flex items-center justify-center`} ref={constraintsRef}>
                  {/* Mobile swipe instructions */}
                  {window.innerWidth < 768 && hasMoreRunners && (
                    <div className="absolute top-4 left-0 right-0 z-10 px-8">
                      <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center justify-between text-white text-sm">
                        <span className="flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" />
                          Nej
                        </span>
                        <span className="font-medium">Swipa för att välja</span>
                        <span className="flex items-center gap-1">
                          Ja
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {hasMoreRunners && currentRunner && (
                      <RunnerCard 
                        key={currentRunner.id} 
                        runner={currentRunner} 
                        index={currentIndex}
                      />
                    )}
                  </AnimatePresence>

                  {/* Action Buttons for Stack Mode Desktop */}
                  {hasMoreRunners && window.innerWidth >= 768 && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSwipe('left', currentRunner.id)}
                        className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-8 h-8" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSwipe('right', currentRunner.id)}
                        className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-500 text-green-500 hover:bg-green-50 transition-colors"
                      >
                        <Heart className="w-8 h-8" />
                      </motion.button>
                    </div>
                  )}

                  {/* No more runners */}
                  {!hasMoreRunners && (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Inga fler löpare just nu
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Kom tillbaka senare för att se fler profiler
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCurrentIndex(0);
                          fetchRunners();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Uppdatera
                      </motion.button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {runners.map((runner) => (
                    <RunnerCard key={runner.id} runner={runner} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Modal */}
      <InfoModal />
      
      {/* AI Analysis Popup */}
      <AIAnalysisPopup />
      
      {/* AI Onboarding Modal */}
      <AICoachOnboarding 
        isOpen={showAIOnboarding}
        onClose={() => setShowAIOnboarding(false)}
        onComplete={handleAIOnboardingComplete}
      />

      {/* Coaching Results Modal */}
      <CoachingResults 
        plan={coachingPlan}
        isVisible={showCoachingResults}
        onClose={() => setShowCoachingResults(false)}
      />
    </div>
  );
};

// Demo data functions
const getDemoRunners = () => [
  {
    id: 1,
    name: 'Emma Johansson',
    age: 28,
    location: 'Stockholm',
    distance: 12,
    bio: 'Marathonlöpare som älskar långdistans. Tränar för Berlin Marathon 2024. Alltid på jakt efter nya löparvänner!',
    level: 'Avancerad',
    pace: '4:45',
    weeklyDistance: 65,
    interests: ['Marathon', 'Trail', 'Intervaller', 'Yoga'],
    profilePicture: '/avatar2.png',
    rating: 4.8,
    totalRuns: 342,
    achievements: ['Marathon Finisher', 'Sub 3:30', '100km Club'],
    longestRun: 42,
    favoriteTime: 'Morgon',
    goals: ['Sub 3:15 marathon', 'Ultra trail']
  },
  {
    id: 2,
    name: 'Marcus Andersson',
    age: 32,
    location: 'Göteborg',
    distance: 8,
    bio: 'Nybörjare som siktar på första 10km-loppet. Söker motiverande träningssällskap!',
    level: 'Nybörjare',
    pace: '6:30',
    weeklyDistance: 20,
    interests: ['5K', '10K', 'Morgonlöpning'],
    profilePicture: '/avatar2.png',
    rating: 4.5,
    totalRuns: 45,
    achievements: ['First 5K', 'Morning Runner'],
    longestRun: 8,
    favoriteTime: 'Kväll',
    goals: ['Första 10K', 'Bygga rutin']
  },
  {
    id: 3,
    name: 'Sofia Lindberg',
    age: 25,
    location: 'Uppsala',
    distance: 15,
    bio: 'Traillöpare och äventyrare. Älskar att utforska nya stigar i naturen.',
    level: 'Medel',
    pace: '5:15',
    weeklyDistance: 40,
    interests: ['Trail', 'Ultramarathon', 'Bergslopp'],
    profilePicture: '/avatar2.png',
    rating: 4.9,
    totalRuns: 189,
    achievements: ['Trail Master', 'Mountain Goat', 'Ultra Runner'],
    longestRun: 50,
    favoriteTime: 'Morgon',
    goals: ['100K ultra', 'Kebnekaise runt']
  }
];

const getDemoAiMatches = () => [
  {
    id: 'ai-1',
    name: 'Lisa Bergström',
    age: 26,
    location: 'Stockholm',
    distance: 5,
    bio: 'Perfekt match! Vi har samma tempo och tränar båda för halvmarathon. Älskar morgonlöpning runt Djurgården.',
    level: 'Medel',
    pace: '5:00',
    weeklyDistance: 45,
    interests: ['Halvmarathon', 'Intervaller', 'Styrka', 'Yoga'],
    profilePicture: '/avatar2.png',
    rating: 4.7,
    totalRuns: 156,
    achievements: ['Halvmarathon < 1:45', 'Streak 100 dagar'],
    longestRun: 21,
    favoriteTime: 'Morgon',
    goals: ['Sub 1:40 halvmarathon', 'Första marathon'],
    matchReason: '96% kompatibilitet'
  },
  {
    id: 'ai-2',
    name: 'Johan Eriksson',
    age: 30,
    location: 'Solna',
    distance: 3,
    bio: 'Tränar på samma tider som dig! Fokuserar på intervaller och 10K. Medlem i Hässelby SK.',
    level: 'Medel',
    pace: '4:55',
    weeklyDistance: 50,
    interests: ['Banlöpning', '10K', 'Intervaller', 'Träningsläger'],
    profilePicture: '/avatar2.png',
    rating: 4.6,
    totalRuns: 234,
    achievements: ['10K < 40min', 'Klubbmästare 5000m'],
    longestRun: 18,
    favoriteTime: 'Kväll',
    goals: ['10K < 38min', 'Förbättra VO2max'],
    matchReason: '94% kompatibilitet'
  },
  {
    id: 'ai-3',
    name: 'Anna Nilsson',
    age: 29,
    location: 'Täby',
    distance: 7,
    bio: 'Samma löpstil och mål! Tränar för Stockholm Marathon. Gillar långa lugna pass på helgerna.',
    level: 'Medel',
    pace: '5:05',
    weeklyDistance: 48,
    interests: ['Marathon', 'Långpass', 'Trail', 'Mindfulness'],
    profilePicture: '/avatar2.png',
    rating: 4.8,
    totalRuns: 267,
    achievements: ['3 Marathons', 'Boston Qualifier'],
    longestRun: 35,
    favoriteTime: 'Morgon',
    goals: ['Boston Marathon', 'Sub 3:30'],
    matchReason: '93% kompatibilitet'
  },
  {
    id: 'ai-4',
    name: 'Erik Gustafsson',
    age: 27,
    location: 'Nacka',
    distance: 6,
    bio: 'Liknande träningsfilosofi! Balanserar löpning med styrka. Tränar ofta vid Nacka reservatet.',
    level: 'Avancerad',
    pace: '4:30',
    weeklyDistance: 60,
    interests: ['Trail', 'OCR', 'Styrka', 'Bergslopp'],
    profilePicture: '/avatar2.png',
    rating: 4.9,
    totalRuns: 412,
    achievements: ['Tough Viking', 'Trail Champion'],
    longestRun: 45,
    favoriteTime: 'Eftermiddag',
    goals: ['Ultra trail', 'Kebnekaise runt'],
    matchReason: '91% kompatibilitet'
  },
  {
    id: 'ai-5',
    name: 'Maria Andersson',
    age: 31,
    location: 'Sundbyberg',
    distance: 4,
    bio: 'Perfekt träningspartner! Samma ambitionsnivå och gillar varierad träning. Springer ofta Ursvik runt.',
    level: 'Medel',
    pace: '5:10',
    weeklyDistance: 42,
    interests: ['Halvmarathon', 'Fartlek', 'Gruppträning', 'Yoga'],
    profilePicture: '/avatar2.png',
    rating: 4.7,
    totalRuns: 198,
    achievements: ['Midnattsloppet', '10 races 2023'],
    longestRun: 25,
    favoriteTime: 'Morgon',
    goals: ['Ny PB halvmarathon', 'Träna skadefritt'],
    matchReason: '90% kompatibilitet'
  }
];

export default DiscoverPage;

// Add CSS for range slider
const style = document.createElement('style');
style.textContent = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: #3B82F6;
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #3B82F6;
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    border: none;
  }
`;
document.head.appendChild(style); 