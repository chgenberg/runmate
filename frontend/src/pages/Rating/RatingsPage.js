import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Trophy,
  TrendingUp,
  Clock, 
  ChevronRight,
  Sparkles,
  Crown,
  Shield,
  Zap,
  Heart,
  MessageCircle,
  Users,
  CheckCircle,
  Brain,
  Activity
} from 'lucide-react';
import UserRatingProfile from '../../components/Rating/UserRatingProfile';
import RatingModal from '../../components/Rating/RatingModal';
import { useAuth } from '../../contexts/AuthContext';
import moment from 'moment';
import 'moment/locale/sv';
import api from '../../services/api';

const RatingsPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRating, setSelectedRating] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    moment.locale('sv');
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const pendingRes = await api.get('/ratings/pending');
        
        setRatings(pendingRes.data.ratings || []);
      } catch (error) {
        console.error('Error fetching ratings:', error);
        // Show empty arrays instead of dummy data
        setRatings([]);
      }
    };

    fetchRatings();
  }, []);

  const tabs = [
    { 
      id: 'pending', 
      label: 'Väntande betyg', 
      icon: Clock,
      count: 3,
      color: 'from-orange-500 to-red-600' 
    },
    { 
      id: 'myratings', 
      label: 'Mina betyg', 
      icon: Star,
      count: 12,
      color: 'from-blue-500 to-indigo-600' 
    },
    { 
      id: 'received', 
      label: 'Mottagna betyg', 
      icon: Crown,
      count: 8,
      color: 'from-purple-500 to-pink-600' 
    }
  ];

  const categoryInfo = {
    punctual: { label: 'Kom i tid', icon: Clock, color: 'blue' },
    fittingPace: { label: 'Höll utlovad nivå', icon: Zap, color: 'green' },
    goodCommunication: { label: 'Bra kommunikation', icon: MessageCircle, color: 'purple' },
    motivating: { label: 'Motiverande', icon: Heart, color: 'red' },
    knowledgeable: { label: 'Kunnig om löpning', icon: Brain, color: 'indigo' },
    friendly: { label: 'Trevlig och social', icon: Users, color: 'pink' },
    wellPrepared: { label: 'Välförberedd', icon: CheckCircle, color: 'emerald' },
    flexible: { label: 'Flexibel', icon: Shield, color: 'orange' }
  };

  const getColorClasses = (color) => ({
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    red: 'bg-red-100 text-red-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    pink: 'bg-pink-100 text-pink-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-orange-700'
  }[color]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-8 mb-8 shadow-2xl"
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Animated background elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"
        />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl"
              >
                <Star className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                  Betyg & Recensioner
                </h1>
                <p className="text-xl text-white/90">
                  Ge och ta emot feedback från dina löppartners
                </p>
              </div>
            </div>
            
            {/* Stats showcase */}
            <div className="flex gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-4"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-3xl font-black text-white"
                >
                  4.8
                </motion.div>
                <p className="text-sm text-white/80">Snittbetyg</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-4"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-3xl font-black text-white"
                >
                  23
                </motion.div>
                <p className="text-sm text-white/80">Totalt betyg</p>
              </motion.div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Bygg ditt rykte</span>
            </motion.div>
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Pålitlig löpare</span>
            </motion.div>
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Top 10% i Stockholm</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 gap-4">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, type: "spring", damping: 20 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative overflow-hidden rounded-2xl p-3 transition-all duration-300 ${
                    isActive
                      ? 'bg-white shadow-2xl ring-2 ring-white/50 shadow-orange-500/20'
                      : 'bg-white/70 backdrop-blur-md shadow-lg hover:shadow-2xl hover:bg-white/90 border border-white/20'
                  }`}
                  style={{
                    boxShadow: isActive 
                      ? `0 20px 40px -12px rgba(249, 115, 22, 0.3), 0 8px 25px -5px rgba(0, 0, 0, 0.1)`
                      : undefined
                  }}
                >
                  {/* Animated background gradient */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${tab.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    layoutId={isActive ? "activeTabBg" : undefined}
                    animate={{
                      opacity: isActive ? 0.08 : 0
                    }}
                  />
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      {/* Enhanced icon with better gradients */}
                      <motion.div 
                        className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? `bg-gradient-to-br ${tab.color} text-white shadow-lg`
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-gray-200 group-hover:to-gray-300'
                        }`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="w-4 h-4" />
                        {/* Glow effect for active state */}
                        {isActive && (
                          <div className={`absolute inset-0 bg-gradient-to-br ${tab.color} rounded-xl blur opacity-40 -z-10`}></div>
                        )}
                      </motion.div>
                      
                      {/* Enhanced count badge */}
                      {tab.count > 0 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            type: "spring", 
                            delay: 0.3 + index * 0.1,
                            stiffness: 200
                          }}
                          whileHover={{ scale: 1.1 }}
                          className={`relative px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
                            isActive
                              ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 group-hover:from-gray-200 group-hover:to-gray-300'
                          }`}
                        >
                          {tab.count}
                          {/* Pulse effect for active badge */}
                          {isActive && (
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-full`}
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Enhanced typography */}
                    <motion.h3 
                      className={`font-bold text-sm transition-colors duration-300 ${
                        isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}
                      layout
                    >
                      {tab.label}
                    </motion.h3>
                    
                    <motion.p 
                      className={`text-xs mt-0.5 leading-tight transition-colors duration-300 ${
                        isActive ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-600'
                      }`}
                      layout
                    >
                      {tab.id === 'pending' && 'Betygsätt dina senaste löppartners'}
                      {tab.id === 'myratings' && 'Betyg du har gett till andra'}
                      {tab.id === 'received' && 'Se vad andra tycker om dig'}
                    </motion.p>
                  </div>
                  
                  {/* Enhanced bottom indicator with gradient */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`absolute bottom-0 left-0 right-0 h-1`}
                      style={{
                        background: `linear-gradient(90deg, transparent, var(--gradient-start), var(--gradient-end), transparent)`,
                        '--gradient-start': tab.color.includes('orange') ? '#f97316' : 
                                          tab.color.includes('blue') ? '#3b82f6' : '#a855f7',
                        '--gradient-end': tab.color.includes('orange') ? '#ea580c' : 
                                        tab.color.includes('blue') ? '#1d4ed8' : '#9333ea'
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Corner accent for active state */}
                  {isActive && (
                    <motion.div
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{
                        background: `linear-gradient(45deg, ${tab.color.includes('orange') ? '#f97316' : 
                                    tab.color.includes('blue') ? '#3b82f6' : '#a855f7'}, ${tab.color.includes('orange') ? '#ea580c' : 
                                    tab.color.includes('blue') ? '#1d4ed8' : '#9333ea'})`
                      }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {ratings.map((pendingRating, index) => (
                  <motion.div
                    key={`${pendingRating.event._id}-${pendingRating.participant._id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Participant photo with animation */}
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="relative"
                        >
                          <img
                            src={pendingRating.participant.profilePhoto}
                            alt={pendingRating.participant.firstName}
                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-gray-100"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        </motion.div>
                        
                        {/* Event and participant info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-1">
                            {pendingRating.participant.firstName} {pendingRating.participant.lastName}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Activity className="w-4 h-4 text-orange-500" />
                              <span className="font-medium">{pendingRating.event.title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>{moment(pendingRating.event.date).fromNow()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rate button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedRating(pendingRating);
                          setIsRatingModalOpen(true);
                        }}
                        className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all group-hover:from-yellow-500 group-hover:to-orange-600"
                      >
                        <Star className="w-5 h-5" />
                        <span>Ge betyg</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>

                    {/* Reminder if recent */}
                    {moment(pendingRating.event.date).isAfter(moment().subtract(3, 'days')) && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                      >
                        <p className="text-green-800 text-sm font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Nyligen avslutat event - betygsätt medan intrycket är färskt!
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'myratings' && (
              <div className="space-y-4">
                {ratings.map((rating, index) => (
                  <motion.div
                    key={rating._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Ratee photo */}
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <img
                          src={rating.ratee.profilePhoto}
                          alt={rating.ratee.firstName}
                          className="w-14 h-14 rounded-2xl object-cover"
                        />
                      </motion.div>
                      
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">
                              {rating.ratee.firstName} {rating.ratee.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{rating.event.title}</p>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= rating.overallRating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(rating.categories).map(([key, value]) => {
                            if (!value) return null;
                            const category = categoryInfo[key];
                            const Icon = category.icon;
                            
                            return (
                              <motion.div
                                key={key}
                                whileHover={{ scale: 1.05 }}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getColorClasses(category.color)}`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{category.label}</span>
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        {/* Comment */}
                        {rating.comment && (
                          <p className="text-gray-700 text-sm italic mb-3">
                            "{rating.comment}"
                          </p>
                        )}
                        
                        {/* Date */}
                        <p className="text-xs text-gray-500">
                          Betygsatt {moment(rating.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'received' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 shadow-xl"
              >
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-orange-200"
                  >
                    <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <div className="text-3xl font-black text-gray-900 mb-1">4.8</div>
                    <p className="text-sm text-gray-600">Genomsnittligt betyg</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200"
                  >
                    <Users className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                    <div className="text-3xl font-black text-gray-900 mb-1">8</div>
                    <p className="text-sm text-gray-600">Totalt antal betyg</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
                  >
                    <Crown className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                    <div className="text-2xl font-black text-gray-900 mb-1">Pålitlig löpare</div>
                    <p className="text-sm text-gray-600">Din nivå</p>
                  </motion.div>
                </div>
                
                {/* Actual profile component */}
                <UserRatingProfile userId={user?.id || '6854fe50b7a8e3befa884139'} />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Rating Modal */}
        {selectedRating && (
          <RatingModal
            isOpen={isRatingModalOpen}
            onClose={() => {
              setIsRatingModalOpen(false);
              setSelectedRating(null);
            }}
            participant={selectedRating.participant}
            event={selectedRating.event}
          />
        )}
      </div>
    </div>
  );
};

export default RatingsPage; 