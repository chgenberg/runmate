import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  HeartIcon,
  XMarkIcon,
  MapPinIcon,
  BoltIcon,
  TrophyIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DiscoverPage = () => {
  const [runners, setRunners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    distance: 50,
    pace: 'all',
    level: 'all',
    goals: []
  });

  const constraintsRef = useRef(null);

  // Move useTransform calls to top level
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const fetchRunners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/discover', { params: filters });
      const backendUsers = response.data.users || [];
      
      // Map backend data to frontend format
      const mappedUsers = backendUsers.map(user => ({
        id: user._id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 
             user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : 25,
        location: user.location?.city || 'Okänd stad',
        distance: user.distance || Math.floor(Math.random() * 50) + 1,
        bio: user.bio || 'Gillar att springa och träffa nya människor!',
        level: user.activityLevel || 'Medel',
        pace: user.avgPace || `${Math.floor(Math.random() * 2) + 4}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        weeklyDistance: user.weeklyDistance || Math.floor(Math.random() * 50) + 20,
        interests: user.sportTypes || user.sports || user.preferredRunTypes || ['Löpning', 'Träning'],
        profilePicture: user.profilePicture || user.photos?.[0] || '/avatar2.png',
        rating: 4.0 + Math.random() * 1.0, // Random rating between 4.0-5.0
        totalRuns: user.trainingStats?.totalRuns || Math.floor(Math.random() * 200) + 50,
        achievements: ['Löpare', 'Träningsentusiast'] // Default achievements
      }));
      
      setRunners(mappedUsers);
          } catch (error) {
        console.error('Error fetching runners:', error);
        // Demo data with all required fields
        setRunners([
          {
            id: 1,
            name: 'Emma Johansson',
            age: 28,
            location: 'Stockholm',
            distance: 12,
            bio: 'Marathonlöpare som älskar långdistans. Tränar för Berlin Marathon 2024.',
            level: 'Avancerad',
            pace: '4:45',
            weeklyDistance: 65,
            interests: ['Marathon', 'Trail', 'Intervaller'],
            profilePicture: '/avatar2.png',
            rating: 4.8,
            totalRuns: 342,
            achievements: ['Marathon Finisher', 'Sub 3:30', '100km Club']
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
          achievements: ['First 5K', 'Morning Runner']
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
          achievements: ['Trail Master', 'Mountain Goat', 'Ultra Runner']
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRunners();
  }, [fetchRunners]);

  const handleSwipe = async (direction) => {
    if (currentIndex >= runners.length) return;

    const currentRunner = runners[currentIndex];
    
    // Safety check
    if (!currentRunner) {
      console.error('No current runner found');
      return;
    }
    
    if (direction === 'right') {
      // Like
      try {
        await api.post(`/users/${currentRunner.id}/like`);
        toast.success(
          <div className="flex items-center gap-2">
            <HeartIconSolid className="w-5 h-5 text-red-500" />
            <span>Gillat! Om {currentRunner.name} också gillar dig blir det en match!</span>
          </div>
        );
      } catch (error) {
        console.error('Error liking runner:', error);
      }
    }

    // Move to next runner
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const currentRunner = runners[currentIndex];
  const hasMoreRunners = currentIndex < runners.length;



  const levelColors = {
    'Nybörjare': 'green',
    'Medel': 'yellow',
    'Avancerad': 'red',
    'Expert': 'purple'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Upptäck Löpare</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hitta din perfekta träningspartner
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </motion.button>
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
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="container-app py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Max avstånd: {filters.distance} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={filters.distance}
                  onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                  className="w-full mt-2"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {['all', 'Nybörjare', 'Medel', 'Avancerad'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilters({ ...filters, level })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filters.level === level
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {level === 'all' ? 'Alla nivåer' : level}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-app py-8">
        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : hasMoreRunners ? (
          <div className="relative h-[600px] flex items-center justify-center" ref={constraintsRef}>
            <AnimatePresence>
              {currentRunner && currentRunner.id && (
                <motion.div
                  key={currentRunner.id}
                  className="absolute w-full max-w-sm"
                  style={{ x, rotate, opacity }}
                  drag="x"
                  dragConstraints={constraintsRef}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) * velocity.x;
                    if (swipe < -10000) {
                      handleSwipe('left');
                    } else if (swipe > 10000) {
                      handleSwipe('right');
                    }
                  }}
                  whileDrag={{ scale: 1.05 }}
                >
                  <div className="card-retro overflow-hidden cursor-grab active:cursor-grabbing">
                    {/* Profile Image */}
                    <div className="relative h-64 bg-gradient-to-br from-orange-400 to-pink-400">
                      {currentRunner.profilePicture ? (
                        <img
                          src={currentRunner.profilePicture}
                          alt={currentRunner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserGroupIcon className="w-24 h-24 text-white/50" />
                        </div>
                      )}
                      
                      {/* Level Badge */}
                      {currentRunner.level && (
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-${levelColors[currentRunner.level] || 'gray'}-500 text-white font-semibold text-sm`}>
                          {currentRunner.level}
                        </div>
                      )}
                      
                      {/* Rating */}
                      <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-sm">{currentRunner.rating}</span>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h2 className="text-2xl font-bold">{currentRunner.name}, {currentRunner.age}</h2>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                          <MapPinIcon className="w-4 h-4" />
                          {currentRunner.location} • {currentRunner.distance} km bort
                        </p>
                      </div>

                      <p className="text-gray-700 mb-4">{currentRunner.bio}</p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <BoltIcon className="w-5 h-5 text-orange-500" />
                          </div>
                          <p className="text-lg font-bold">{currentRunner.pace}</p>
                          <p className="text-xs text-gray-500">min/km</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <FireIcon className="w-5 h-5 text-red-500" />
                          </div>
                          <p className="text-lg font-bold">{currentRunner.weeklyDistance}</p>
                          <p className="text-xs text-gray-500">km/vecka</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <TrophyIcon className="w-5 h-5 text-yellow-500" />
                          </div>
                          <p className="text-lg font-bold">{currentRunner.totalRuns}</p>
                          <p className="text-xs text-gray-500">löprundor</p>
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(currentRunner.interests || []).map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>

                      {/* Achievements */}
                      {currentRunner.achievements && currentRunner.achievements.length > 0 && (
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Prestationer</p>
                          <div className="flex gap-2">
                            {currentRunner.achievements.slice(0, 3).map((achievement, index) => (
                              <div
                                key={index}
                                className="p-2 bg-yellow-50 rounded-lg"
                                title={achievement}
                              >
                                <TrophyIcon className="w-5 h-5 text-yellow-600" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Swipe Indicators */}
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                    style={{
                      opacity: likeOpacity
                    }}
                  >
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                      GILLA
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                    style={{
                      opacity: skipOpacity
                    }}
                  >
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                      SKIPPA
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500 text-red-500"
              >
                <XMarkIcon className="w-8 h-8" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => console.log('Super like!')}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-500 text-blue-500"
              >
                <SparklesIcon className="w-8 h-8" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-500 text-green-500"
              >
                <HeartIcon className="w-8 h-8" />
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-12 h-12 text-gray-400" />
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
              className="btn-primary"
            >
              Uppdatera
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage; 