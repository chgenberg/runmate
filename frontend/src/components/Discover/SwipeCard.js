import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { MapPin, Activity, Clock, Target, Trophy, Calendar, Zap } from 'lucide-react';

const SwipeCard = ({ user, isNext = false }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  if (!user) return null;

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatPace = (paceInSeconds) => {
    if (!paceInSeconds) return 'N/A';
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = paceInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
  };

  const getActivityLevelText = (level) => {
    const levels = {
      'beginner': 'Nybörjare',
      'recreational': 'Motionär',
      'serious': 'Seriös',
      'competitive': 'Tävlingsinriktad',
      'elite': 'Elit'
    };
    return levels[level] || level;
  };

  const getActivityLevelColor = (level) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-700 border-green-200',
      'recreational': 'bg-blue-100 text-blue-700 border-blue-200',
      'serious': 'bg-purple-100 text-purple-700 border-purple-200',
      'competitive': 'bg-orange-100 text-orange-700 border-orange-200',
      'elite': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatTime = (seconds) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const nextPhoto = () => {
    if (user.photos && user.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
    }
  };

  const prevPhoto = () => {
    if (user.photos && user.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
    }
  };

  const currentPhoto = user.photos && user.photos.length > 0 
    ? user.photos[currentPhotoIndex] 
    : user.profilePhoto || user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'User')}&size=800&background=random`;

  return (
    <motion.div
      className={`relative w-full max-w-md mx-auto bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden ${
        isNext ? 'scale-95 opacity-60' : ''
      }`}
      style={{ height: '75vh', maxHeight: '700px' }}
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: -50 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Photo Section with Gradient Overlay */}
      <div className="relative h-3/5 overflow-hidden">
        <img
          src={currentPhoto}
          alt={user.firstName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'User')}&size=800&background=random`;
          }}
        />
        
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Photo navigation */}
        {user.photos && user.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition-all"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
            
            {/* Photo indicators */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {user.photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {/* Activity Level Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${getActivityLevelColor(user.activityLevel)} border`}>
            <Zap className="inline w-3 h-3 mr-1" />
            {getActivityLevelText(user.activityLevel)}
          </div>
          
          {/* Distance badge */}
          {user.distance !== null && user.distance !== undefined && (
            <div className="bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              <MapPin className="inline w-3 h-3 mr-1" />
              {user.distance < 1 ? 'Nära' : `${user.distance.toFixed(0)} km`}
            </div>
          )}
        </div>

        {/* Info button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="absolute bottom-4 right-4 bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-all"
        >
          <InformationCircleIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content Section */}
      <div className="h-2/5 p-6 flex flex-col">
        {/* Name and Age */}
        <div className="mb-3">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {user.firstName}, {calculateAge(user.dateOfBirth || user.birthDate)}
          </h2>
          <p className="text-gray-500 text-sm flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {user.location?.city || 'Stockholm'}
          </p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Weekly Distance */}
          {user.trainingStats?.weeklyDistance && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
              <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-900">{user.trainingStats.weeklyDistance}</div>
              <div className="text-xs text-blue-700">km/vecka</div>
            </div>
          )}
          
          {/* Best 5K Time */}
          {user.trainingStats?.bestTimes?.fiveK && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
              <Trophy className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-900">{formatTime(user.trainingStats.bestTimes.fiveK)}</div>
              <div className="text-xs text-purple-700">5K PB</div>
            </div>
          )}
          
          {/* Workouts per week */}
          {user.trainingStats?.weeklyWorkouts && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
              <Calendar className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-900">{user.trainingStats.weeklyWorkouts}</div>
              <div className="text-xs text-green-700">pass/vecka</div>
            </div>
          )}
        </div>

        {/* Action hint */}
        <div className="mt-auto flex items-center justify-center text-xs text-gray-400">
          <HeartIcon className="w-4 h-4 mr-1 text-green-400" />
          Svep höger för att gilla
          <span className="mx-2">•</span>
          Svep vänster för att hoppa över
        </div>
      </div>

      {/* Detailed info overlay */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 bg-white/98 backdrop-blur-md p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Träningsprofil</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

          <div className="space-y-4">
            {user.bio && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Om mig</h4>
                <p className="text-gray-600 text-sm">{user.bio}</p>
              </div>
            )}

            {(user.avgPace || user.weeklyDistance || user.preferredRunTypes) && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Träningsinfo</h4>
                <div className="space-y-2 text-sm">
                  {user.avgPace && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Snitt-pace: {formatPace(user.avgPace)}</span>
                    </div>
                  )}
                  {user.weeklyDistance && (
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span>Vecko-distans: {user.weeklyDistance} km</span>
                    </div>
                  )}
                  {user.preferredRunTypes && user.preferredRunTypes.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span>Föredrar: {user.preferredRunTypes.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {user.preferredTrainingTimes && user.preferredTrainingTimes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Träningsschema</h4>
                <div className="flex flex-wrap gap-2">
                  {user.preferredTrainingTimes.map((time, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SwipeCard; 