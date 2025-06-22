import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Award, 
  Clock, 
  Zap, 
  MessageCircle, 
  Heart, 
  Brain, 
  Users, 
  CheckCircle,
  Shield,
  TrendingUp,
  Crown
} from 'lucide-react';
import api from '../../services/api';

const UserRatingProfile = ({ userId, compact = false }) => {
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRatingData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [statsResponse, ratingsResponse] = await Promise.all([
        api.get(`/ratings/user/${userId}/stats`),
        api.get(`/ratings/user/${userId}?limit=5`)
      ]);

      setStats(statsResponse.data.data);
      setRatings(ratingsResponse.data.data.ratings);
    } catch (error) {
      console.error('Error fetching rating data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRatingData();
  }, [fetchRatingData]);

  const categories = [
    { key: 'punctual', label: 'Kom i tid', icon: Clock, color: 'blue' },
    { key: 'fittingPace', label: 'Höll utlovad nivå', icon: Zap, color: 'green' },
    { key: 'goodCommunication', label: 'Bra kommunikation', icon: MessageCircle, color: 'purple' },
    { key: 'motivating', label: 'Motiverande', icon: Heart, color: 'red' },
    { key: 'knowledgeable', label: 'Kunnig om löpning', icon: Brain, color: 'indigo' },
    { key: 'friendly', label: 'Trevlig och social', icon: Users, color: 'pink' },
    { key: 'wellPrepared', label: 'Välförberedd', icon: CheckCircle, color: 'emerald' },
    { key: 'flexible', label: 'Flexibel', icon: Shield, color: 'orange' }
  ];

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'superstar':
        return {
          icon: Crown,
          color: 'from-yellow-400 to-orange-500',
          textColor: 'text-yellow-800',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'trusted':
        return {
          icon: Award,
          color: 'from-blue-400 to-blue-600',
          textColor: 'text-blue-800',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'experienced':
        return {
          icon: TrendingUp,
          color: 'from-green-400 to-green-600',
          textColor: 'text-green-800',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      default:
        return null;
    }
  };

  const getColorClasses = (color) => ({
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600',
    pink: 'text-pink-600',
    emerald: 'text-emerald-600',
    orange: 'text-orange-600'
  }[color]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (!stats || stats.totalRatings === 0) {
    if (compact) {
      return (
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-white/50" />
          <span className="text-white/70 text-sm">Inga betyg än</span>
        </div>
      );
    }
    
    return (
      <div className="text-center p-6 bg-gray-50 rounded-xl">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 font-medium">Inga betyg än</p>
        <p className="text-gray-400 text-sm">Delta i events för att få dina första betyg!</p>
      </div>
    );
  }

  const badgeConfig = getBadgeConfig(stats.badge);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Stars */}
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-300 fill-current" />
          <span className="font-bold text-white">{stats.averageRating}</span>
          <span className="text-white/70 text-sm">({stats.totalRatings})</span>
        </div>
        
        {/* Badge */}
        {badgeConfig && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30`}>
            <badgeConfig.icon className="w-3 h-3" />
            <span>{stats.level}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with overall rating and badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-2xl font-black text-gray-900">{stats.averageRating}</p>
              <p className="text-sm text-gray-500">{stats.totalRatings} betyg</p>
            </div>
            
            {badgeConfig && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${badgeConfig.bgColor} ${badgeConfig.borderColor} border`}>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${badgeConfig.color}`}>
                  <badgeConfig.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`font-bold ${badgeConfig.textColor}`}>{stats.level}</p>
                  <p className="text-xs text-gray-600">Verifierad löpare</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-2xl border border-gray-100"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Styrkor</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = stats.categoryStats[category.key] || 0;
            const percentage = stats.totalRatings > 0 ? Math.round((count / stats.totalRatings) * 100) : 0;
            
            return (
              <motion.div
                key={category.key}
                whileHover={{ scale: 1.02 }}
                className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${getColorClasses(category.color)}`} />
                  <span className="text-sm font-medium text-gray-800">{category.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">({percentage}%)</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent ratings */}
      {ratings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Senaste betyg</h3>
          <div className="space-y-4">
            {ratings.map((rating, index) => (
              <motion.div
                key={rating._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <img
                  src={rating.rater.profilePhoto || `https://ui-avatars.com/api/?name=${rating.rater.firstName}+${rating.rater.lastName}&background=random`}
                  alt={rating.rater.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {rating.rater.firstName} {rating.rater.lastName}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= rating.overallRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {rating.comment && (
                    <p className="text-gray-700 text-sm mb-2">{rating.comment}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{rating.relatedEvent.title}</span>
                    <span>•</span>
                    <span>{new Date(rating.createdAt).toLocaleDateString('sv-SE')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserRatingProfile; 