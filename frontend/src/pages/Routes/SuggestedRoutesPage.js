import React, { useState, useEffect } from 'react';
import { MapPinIcon, ClockIcon, FireIcon, ChartBarIcon, SparklesIcon, PlayIcon, HeartIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SuggestedRoutesPage = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    distance: 'all',
    difficulty: 'all',
    terrain: 'all',
    time: 'all'
  });
  const [viewMode, setViewMode] = useState('grid'); // grid or map
  const [favorites, setFavorites] = useState([]);
  const [likes, setLikes] = useState({});

  useEffect(() => {
    loadUserData();
    getUserLocation();
    generateRoutes();
  }, []);

  const loadUserData = async () => {
    try {
      // Load user's training data for personalization
      const response = await api.get('/activities/recent');
      // Process data for AI recommendations
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const generateRoutes = async () => {
    setLoading(true);
    try {
      // AI-generated routes based on user profile and location
      const generatedRoutes = [
        {
          id: 1,
          name: 'Morgonrunda vid Långholmen',
          distance: 5.2,
          duration: 25,
          difficulty: 'Lätt',
          terrain: 'Park',
          elevation: 45,
          calories: 320,
          description: 'Perfekt morgonrunda genom Långholmens naturområde. Mjuka stigar och vacker utsikt över vattnet.',
          highlights: ['Naturområde', 'Vattenvy', 'Mjuka stigar', 'Hundvänlig'],
          aiReason: 'Baserat på dina tidigare 5km-rundor och preferens för naturmiljöer',
          matchScore: 95,
          weather: { temp: 18, condition: 'Soligt', wind: 5 },
          popularity: 89,
          timeOfDay: ['Morgon', 'Eftermiddag'],
          coordinates: [[59.3165, 18.0351], [59.3180, 18.0365], [59.3195, 18.0380]],
          image: '/lopning1.png',
          userPhotos: ['/avatar2.png', '/avatar2.png', '/avatar2.png'],
          totalRuns: 234,
          avgRating: 4.8
        },
        {
          id: 2,
          name: 'Intensiv stadslöpning - City Circuit',
          distance: 8.5,
          duration: 40,
          difficulty: 'Medel',
          terrain: 'Stad',
          elevation: 120,
          calories: 580,
          description: 'Utmanande runda genom Stockholms city med varierad terräng och flera backar för intervallträning.',
          highlights: ['Stadsvy', 'Backtträning', 'Belyst', 'Populär kvällsrutt'],
          aiReason: 'Perfekt för ditt mål att förbättra hastighet och kondition',
          matchScore: 88,
          weather: { temp: 16, condition: 'Molnigt', wind: 8 },
          popularity: 76,
          timeOfDay: ['Kväll', 'Natt'],
          coordinates: [[59.3293, 18.0686], [59.3308, 18.0701], [59.3323, 18.0716]],
          image: '/lopning2.png',
          userPhotos: ['/avatar2.png', '/avatar2.png'],
          totalRuns: 156,
          avgRating: 4.6
        },
        {
          id: 3,
          name: 'Lugn återhämtningsrunda - Humlegården',
          distance: 3.8,
          duration: 22,
          difficulty: 'Lätt',
          terrain: 'Park',
          elevation: 25,
          calories: 240,
          description: 'Avslappnad runda i Humlegården, perfekt för återhämtningsdagar eller lätt jogging.',
          highlights: ['Platt terräng', 'Skugga', 'Centralt', 'Café närhet'],
          aiReason: 'Rekommenderad efter gårdagens intensiva pass - optimal för aktiv vila',
          matchScore: 92,
          weather: { temp: 20, condition: 'Halvklart', wind: 3 },
          popularity: 94,
          timeOfDay: ['Morgon', 'Lunch', 'Eftermiddag'],
          coordinates: [[59.3425, 18.0758], [59.3440, 18.0773], [59.3455, 18.0788]],
          image: '/lopning3.png',
          userPhotos: ['/avatar2.png', '/avatar2.png', '/avatar2.png', '/avatar2.png'],
          totalRuns: 412,
          avgRating: 4.9
        },
        {
          id: 4,
          name: 'Långdistans utmaning - Djurgårdsrundan',
          distance: 15.0,
          duration: 75,
          difficulty: 'Svår',
          terrain: 'Blandat',
          elevation: 280,
          calories: 980,
          description: 'Omfattande runda runt hela Djurgården. Varierad terräng och fantastiska vyer för den erfarne löparen.',
          highlights: ['Lång distans', 'Scenisk', 'Utmanande', 'Milestone-rutt'],
          aiReason: 'Du är redo för längre distanser - detta förbereder dig för halvmaraton',
          matchScore: 82,
          weather: { temp: 15, condition: 'Lätt regn', wind: 12 },
          popularity: 68,
          timeOfDay: ['Morgon', 'Förmiddag'],
          coordinates: [[59.3165, 18.0686], [59.3180, 18.0701], [59.3195, 18.0716]],
          image: '/lopning4.png',
          userPhotos: ['/avatar2.png'],
          totalRuns: 89,
          avgRating: 4.7
        },
        {
          id: 5,
          name: 'Intervallträning - Gärdet Speed Track',
          distance: 6.2,
          duration: 32,
          difficulty: 'Medel',
          terrain: 'Blandat',
          elevation: 95,
          calories: 420,
          description: 'Strukturerad intervallrunda med markerade sektioner för tempo, vila och sprint.',
          highlights: ['Intervaller', 'Tidtagning', 'Öppet', 'Träningsgrupper'],
          aiReason: 'Matchar ditt träningsschema - intervallpass på torsdagar',
          matchScore: 91,
          weather: { temp: 17, condition: 'Soligt', wind: 6 },
          popularity: 83,
          timeOfDay: ['Eftermiddag', 'Kväll'],
          coordinates: [[59.3238, 18.0968], [59.3253, 18.0983], [59.3268, 18.0998]],
          image: '/lopning5.png',
          userPhotos: ['/avatar2.png', '/avatar2.png', '/avatar2.png'],
          totalRuns: 267,
          avgRating: 4.8
        },
        {
          id: 6,
          name: 'Solnedgångsrunda - Riddarholmen',
          distance: 4.5,
          duration: 28,
          difficulty: 'Lätt',
          terrain: 'Stad',
          elevation: 35,
          calories: 285,
          description: 'Romantisk kvällsrunda med fantastisk utsikt över Gamla Stan och Mälaren.',
          highlights: ['Solnedgång', 'Historisk', 'Instagram-vänlig', 'Datum-rutt'],
          aiReason: 'Populär bland löpare i din ålder - perfekt social löprunda',
          matchScore: 86,
          weather: { temp: 19, condition: 'Klart', wind: 4 },
          popularity: 91,
          timeOfDay: ['Kväll'],
          coordinates: [[59.3245, 18.0635], [59.3260, 18.0650], [59.3275, 18.0665]],
          image: '/lopning6.png',
          userPhotos: ['/avatar2.png', '/avatar2.png', '/avatar2.png', '/avatar2.png', '/avatar2.png'],
          totalRuns: 345,
          avgRating: 4.9
        }
      ];

      setRoutes(generatedRoutes);
    } catch (error) {
      console.error('Error generating routes:', error);
      toast.error('Kunde inte ladda föreslagna rutter');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (routeId) => {
    setFavorites(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
    toast.success(
      favorites.includes(routeId) ? 'Borttagen från favoriter' : 'Sparad till favoriter',
      { icon: favorites.includes(routeId) ? '💔' : '❤️' }
    );
  };

  const toggleLike = (routeId) => {
    setLikes(prev => ({
      ...prev,
      [routeId]: !prev[routeId]
    }));
  };

  const startRoute = (route) => {
    toast.success(`Startar rutt: ${route.name}`, {
      icon: '🏃‍♂️',
      duration: 3000
    });
    // Here you would integrate with GPS tracking
  };

  const shareRoute = (route) => {
    if (navigator.share) {
      navigator.share({
        title: route.name,
        text: `Kolla in denna löprunda: ${route.name} - ${route.distance}km`,
        url: window.location.href
      });
    } else {
      toast.success('Länk kopierad!', { icon: '📋' });
    }
  };

  const filteredRoutes = routes.filter(route => {
    if (filters.distance !== 'all') {
      if (filters.distance === '5' && route.distance > 5) return false;
      if (filters.distance === '10' && (route.distance <= 5 || route.distance > 10)) return false;
      if (filters.distance === '15' && route.distance <= 10) return false;
    }
    if (filters.difficulty !== 'all' && route.difficulty !== filters.difficulty) return false;
    if (filters.terrain !== 'all' && route.terrain !== filters.terrain) return false;
    if (filters.time !== 'all' && !route.timeOfDay.includes(filters.time)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
            <SparklesIcon className="w-6 h-6 text-orange-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Analyserar din träningsdata...</p>
          <p className="text-sm text-gray-500 mt-2">Genererar personliga ruttförslag</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Föreslagna rutter</h1>
                <p className="text-sm text-gray-600">AI-anpassade efter din träning</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {viewMode === 'grid' ? '🗺️' : '📱'}
              </button>
              <button
                onClick={generateRoutes}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <SparklesIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Uppdatera</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Smart Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Smarta filter</h3>
            <button
              onClick={() => setFilters({ distance: 'all', difficulty: 'all', terrain: 'all', time: 'all' })}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              Återställ
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distans</label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({...filters, distance: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="all">Alla distanser</option>
                <option value="5">Under 5 km</option>
                <option value="10">5-10 km</option>
                <option value="15">Över 10 km</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Svårighetsgrad</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="all">Alla nivåer</option>
                <option value="Lätt">Lätt</option>
                <option value="Medel">Medel</option>
                <option value="Svår">Svår</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terräng</label>
              <select
                value={filters.terrain}
                onChange={(e) => setFilters({...filters, terrain: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="all">All terräng</option>
                <option value="Park">Park</option>
                <option value="Stad">Stad</option>
                <option value="Blandat">Blandat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tid på dagen</label>
              <select
                value={filters.time}
                onChange={(e) => setFilters({...filters, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="all">Alla tider</option>
                <option value="Morgon">Morgon</option>
                <option value="Lunch">Lunch</option>
                <option value="Eftermiddag">Eftermiddag</option>
                <option value="Kväll">Kväll</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRoutes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden group"
              >
                <div className="relative">
                  <img
                    src={route.image}
                    alt={route.name}
                    className="w-full h-56 object-cover"
                  />
                  {/* Match Score Badge */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <SparklesIcon className="w-4 h-4 text-yellow-400" />
                    <span>{route.matchScore}% match</span>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    route.difficulty === 'Lätt' 
                      ? 'bg-green-100 text-green-800'
                      : route.difficulty === 'Medel'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {route.difficulty}
                  </div>

                  {/* Weather Info */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
                    <span>{route.weather.condition} {route.weather.temp}°C</span>
                  </div>

                  {/* User Photos */}
                  <div className="absolute bottom-4 right-4 flex -space-x-2">
                    {route.userPhotos.slice(0, 3).map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt=""
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ))}
                    {route.totalRuns > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center border-2 border-white">
                        +{route.totalRuns - 3}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{route.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(route.avgRating) ? '⭐' : '☆'}>
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">({route.totalRuns} löpningar)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(route.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {favorites.includes(route.id) ? (
                        <BookmarkSolidIcon className="w-5 h-5 text-orange-600" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{route.description}</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-1.5 text-orange-600" />
                      {route.distance} km
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-1.5 text-orange-600" />
                      {route.duration} min
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChartBarIcon className="w-4 h-4 mr-1.5 text-orange-600" />
                      {route.elevation}m höjd
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FireIcon className="w-4 h-4 mr-1.5 text-orange-600" />
                      {route.calories} kcal
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {route.highlights.slice(0, 3).map((highlight, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-medium"
                      >
                        {highlight}
                      </span>
                    ))}
                    {route.highlights.length > 3 && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{route.highlights.length - 3}
                      </span>
                    )}
                  </div>

                  {/* AI Reason */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-4">
                    <p className="text-xs text-blue-800 flex items-start">
                      <SparklesIcon className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" />
                      {route.aiReason}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLike(route.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {likes[route.id] ? (
                          <HeartSolidIcon className="w-5 h-5 text-red-500" />
                        ) : (
                          <HeartIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => shareRoute(route)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ShareIcon className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <button
                      onClick={() => startRoute(route)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 text-sm font-medium"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>Starta</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRoutes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inga rutter matchade dina filter</h3>
            <p className="text-gray-600 mb-6">Prova att ändra dina filterinställningar</p>
            <button
              onClick={() => setFilters({ distance: 'all', difficulty: 'all', terrain: 'all', time: 'all' })}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
            >
              Återställ filter
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SuggestedRoutesPage; 