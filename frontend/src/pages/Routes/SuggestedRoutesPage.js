import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Mountain, Zap, Navigation,
  Search, Heart, Share, Play,
  TrendingUp, Route, Filter, MapPin, 
  Sparkles, Trees,
  Cloud,
  X, Award, Users,
  BarChart3, Compass, Footprints
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';
import RouteMap from '../../components/Activity/RouteMap';
import RouteDetailModal from '../../components/Activity/RouteDetailModal';
import StartRouteModal from '../../components/Activity/StartRouteModal';

const SuggestedRoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiCoachData, setAiCoachData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [filters, setFilters] = useState({
    distance: 'all',
    difficulty: 'all',
    terrain: 'all',
    source: 'all',
    time: 'all',
    weather: 'all',
    popularity: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('map');
  const [favorites, setFavorites] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const [showStartRoute, setShowStartRoute] = useState(false);
  const [routeToStart, setRouteToStart] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState('basic');

  // Filter categories for advanced filtering
  const filterCategories = {
    basic: {
      name: 'Grundläggande',
      icon: Filter,
      filters: ['distance', 'difficulty', 'terrain']
    },
    advanced: {
      name: 'Avancerat',
      icon: Sparkles,
      filters: ['time', 'weather', 'popularity', 'source']
    }
  };

  // Enhanced filter options
  const filterOptions = {
    distance: {
      name: 'Distans',
      icon: Route,
      options: [
        { value: 'all', label: 'Alla distanser', icon: null },
        { value: 'short', label: '0-5 km', icon: '🏃‍♂️' },
        { value: 'medium', label: '5-10 km', icon: '🏃' },
        { value: 'long', label: '10-20 km', icon: '🏃‍♀️' },
        { value: 'ultra', label: '20+ km', icon: '🦸' }
      ]
    },
    difficulty: {
      name: 'Svårighet',
      icon: Mountain,
      options: [
        { value: 'all', label: 'Alla nivåer', icon: null },
        { value: 'Lätt', label: 'Lätt', icon: '🟢' },
        { value: 'Medel', label: 'Medel', icon: '🟡' },
        { value: 'Svår', label: 'Svår', icon: '🔴' },
        { value: 'Expert', label: 'Expert', icon: '⚫' }
      ]
    },
    terrain: {
      name: 'Terräng',
      icon: Trees,
      options: [
        { value: 'all', label: 'Alla terränger', icon: null },
        { value: 'Park', label: 'Park', icon: '🌳' },
        { value: 'Stad', label: 'Stad', icon: '🏙️' },
        { value: 'Natur', label: 'Natur', icon: '🏔️' },
        { value: 'Strand', label: 'Strand', icon: '🏖️' },
        { value: 'Trail', label: 'Trail', icon: '🥾' }
      ]
    },
    time: {
      name: 'Tid på dygnet',
      icon: Clock,
      options: [
        { value: 'all', label: 'När som helst', icon: null },
        { value: 'morning', label: 'Morgon', icon: '🌅' },
        { value: 'day', label: 'Dag', icon: '☀️' },
        { value: 'evening', label: 'Kväll', icon: '🌆' },
        { value: 'night', label: 'Natt', icon: '🌙' }
      ]
    },
    weather: {
      name: 'Väder',
      icon: Cloud,
      options: [
        { value: 'all', label: 'Alla väder', icon: null },
        { value: 'sunny', label: 'Soligt', icon: '☀️' },
        { value: 'cloudy', label: 'Molnigt', icon: '☁️' },
        { value: 'rainy', label: 'Regn', icon: '🌧️' },
        { value: 'windy', label: 'Blåsigt', icon: '💨' }
      ]
    },
    popularity: {
      name: 'Popularitet',
      icon: Users,
      options: [
        { value: 'all', label: 'Alla', icon: null },
        { value: 'trending', label: 'Trending', icon: '🔥' },
        { value: 'popular', label: 'Populär', icon: '⭐' },
        { value: 'hidden', label: 'Gömd pärla', icon: '💎' },
        { value: 'new', label: 'Ny', icon: '✨' }
      ]
    },
    source: {
      name: 'Källa',
      icon: Compass,
      options: [
        { value: 'all', label: 'Alla källor', icon: null },
        { value: 'ai', label: 'AI Coach', icon: '🤖' },
        { value: 'community', label: 'Community', icon: '👥' },
        { value: 'strava', label: 'Strava', icon: '🏃' },
        { value: 'official', label: 'Officiell', icon: '✅' }
      ]
    }
  };

  // Load user's AI coach data and location
  useEffect(() => {
    loadAiCoachData();
    getUserLocation();
    loadFavorites();
  }, []);

  const loadRoutes = useCallback(async () => {
    if (!userLocation && locationPermission !== 'denied') return;
    
    setLoading(true);
    try {
      const routeSources = [];
      const lat = userLocation?.lat || 59.3293;
      const lng = userLocation?.lng || 18.0686;
      
      console.log('Loading routes for coordinates:', { lat, lng, userLocation });

      // 1. AI-baserade rutter
      if (filters.source === 'all' || filters.source === 'ai') {
        const aiRoutes = generateAiRoutes();
        routeSources.push(...aiRoutes);
      }

      // 2. OpenStreetMap rutter
      if (filters.source === 'all' || filters.source === 'osm') {
        const osmRoutes = await loadOsmRoutes(lat, lng);
        routeSources.push(...osmRoutes);
      }

      // 3. Populära community rutter
      if (filters.source === 'all' || filters.source === 'popular' || filters.source === 'community') {
        const popularRoutes = await loadPopularRoutes(lat, lng);
        routeSources.push(...popularRoutes);
      }

      // 4. Strava Segments
      if (filters.source === 'all' || filters.source === 'strava') {
        const stravaRoutes = generateStravaRoutes();
        routeSources.push(...stravaRoutes);
      }

      // Filter and sort routes
      const filteredRoutes = filterRoutes(routeSources);
      setRoutes(filteredRoutes);

    } catch (error) {
      console.error('Error loading routes:', error);
      toast.error('Kunde inte ladda rutter');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, filters, locationPermission]);

  // Load routes when filters change
  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const loadAiCoachData = async () => {
    try {
      const response = await api.get('/users/profile');
      const coachData = response?.data?.user?.aiCoachData;
      if (coachData) {
        setAiCoachData(coachData);
      }
    } catch (error) {
      console.error('Error loading AI coach data:', error);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using Stockholm fallback');
      setLocationPermission('denied');
      setUserLocation({ lat: 59.3293, lng: 18.0686 });
      return;
    }

    console.log('Requesting user location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Got user location:', userCoords);
        setUserLocation(userCoords);
        setLocationPermission('granted');
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        console.log('Using Stockholm fallback due to location error');
        setUserLocation({ lat: 59.3293, lng: 18.0686 });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const loadFavorites = async () => {
    try {
      const response = await api.get('/users/favorite-routes');
      setFavorites(response.data.favoriteRoutes || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const loadOsmRoutes = async (lat, lng) => {
    try {
      const response = await api.get('/routes/osm', {
        params: {
          lat,
          lng,
          radius: 20000,
          limit: 10
        }
      });
      
      return response.data.routes || [];

    } catch (error) {
      console.error('Error loading OSM routes:', error);
      return [];
    }
  };

  const loadPopularRoutes = async (lat, lng) => {
    try {
      const response = await api.get('/routes/popular', {
        params: { lat, lng, radius: 20 }
      });
      return response.data.routes || [];
    } catch (error) {
      console.error('Error loading popular routes:', error);
      return [];
    }
  };

  const generateAiRoutes = () => {
    if (!aiCoachData || !userLocation) return [];

    const baseRoutes = [];
    const userGoals = aiCoachData.primaryGoals || [];
    const currentLevel = aiCoachData.currentLevel || 'beginner';
    const preferredDistance = aiCoachData.longestRun || 5;

    // Generera rutter baserat på AI coaching data
    if (userGoals.includes('lose_weight')) {
      baseRoutes.push({
        id: 'ai-weight-loss',
        name: 'AI Viktminskning - Fettförbränningsrunda',
        distance: Math.min(preferredDistance * 0.8, 8),
        duration: Math.round(preferredDistance * 0.8 * 6),
        difficulty: currentLevel === 'beginner' ? 'Lätt' : 'Medel',
        terrain: 'Park',
        elevation: 50,
        calories: Math.round(preferredDistance * 0.8 * 70),
        description: 'AI-optimerad rutt för optimal fettförbränning baserat på din profil.',
        aiReason: 'Anpassad för ditt viktminsknings-mål med optimal intensitet',
        matchScore: 95,
        source: 'AI Coach',
        highlights: ['Fettförbränning', 'Låg intensitet', 'Längre distans'],
        coordinates: generateRouteCoordinates(userLocation, preferredDistance * 0.8),
        image: '/lopning1.png',
        popularity: 'trending',
        bestTime: 'morning',
        weather: 'sunny'
      });
    }

    if (userGoals.includes('improve_speed')) {
      baseRoutes.push({
        id: 'ai-speed',
        name: 'AI Hastighet - Intervallträning',
        distance: Math.min(preferredDistance * 0.6, 6),
        duration: Math.round(preferredDistance * 0.6 * 5),
        difficulty: 'Medel',
        terrain: 'Blandat',
        elevation: 80,
        calories: Math.round(preferredDistance * 0.6 * 85),
        description: 'AI-designad intervallrutt för hastighetsutveckling.',
        aiReason: 'Perfekt för ditt mål att förbättra hastighet med strukturerade intervaller',
        matchScore: 92,
        source: 'AI Coach',
        highlights: ['Intervaller', 'Hastighet', 'Strukturerad'],
        coordinates: generateRouteCoordinates(userLocation, preferredDistance * 0.6),
        image: '/lopning2.png',
        popularity: 'popular',
        bestTime: 'evening',
        weather: 'cloudy'
      });
    }

    if (userGoals.includes('build_endurance')) {
      baseRoutes.push({
        id: 'ai-endurance',
        name: 'AI Uthållighet - Långdistans',
        distance: Math.min(preferredDistance * 1.2, 15),
        duration: Math.round(preferredDistance * 1.2 * 7),
        difficulty: currentLevel === 'advanced' ? 'Medel' : 'Svår',
        terrain: 'Natur',
        elevation: 120,
        calories: Math.round(preferredDistance * 1.2 * 75),
        description: 'AI-planerad långdistansrutt för uthållighetsbyggande.',
        aiReason: 'Gradvis ökning av distans för att bygga uthållighet säkert',
        matchScore: 88,
        source: 'AI Coach',
        highlights: ['Uthållighet', 'Långdistans', 'Progressiv'],
        coordinates: generateRouteCoordinates(userLocation, preferredDistance * 1.2),
        image: '/lopning3.png',
        popularity: 'hidden',
        bestTime: 'morning',
        weather: 'all'
      });
    }

    return baseRoutes;
  };

  const generateStravaRoutes = () => {
    return [
      {
        id: 'strava-1',
        name: 'Strava Segment: Långholmen Loop',
        distance: 5.2,
        duration: 24,
        difficulty: 'Medel',
        terrain: 'Park',
        elevation: 45,
        calories: 320,
        description: 'Populärt Strava-segment med tusentals löpare.',
        source: 'Strava',
        highlights: ['Strava KOM', 'Populärt', 'Tävlingsinriktat'],
        coordinates: generateRouteCoordinates(userLocation, 5.2),
        image: '/lopning5.png',
        matchScore: 82,
        stravaStats: {
          attempts: 2847,
          averageTime: '24:15',
          kom: '18:32'
        },
        popularity: 'popular',
        bestTime: 'day',
        weather: 'sunny'
      }
    ];
  };

  const generateRouteCoordinates = (center, distance) => {
    const coords = [];
    const points = Math.max(10, Math.round(distance * 3));
    const radiusLat = (distance / 111) * 0.3;
    const radiusLng = radiusLat / Math.cos(center.lat * Math.PI / 180);

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const randomFactor = 0.7 + Math.random() * 0.6;
      const lat = center.lat + Math.cos(angle) * radiusLat * randomFactor;
      const lng = center.lng + Math.sin(angle) * radiusLng * randomFactor;
      coords.push([lat, lng]);
    }
    
    return coords;
  };

  const filterRoutes = (routes) => {
    return routes.filter(route => {
      // Distance filter
      if (filters.distance !== 'all') {
        const distance = route.distance;
        switch (filters.distance) {
          case 'short': 
            if (distance > 5) return false; 
            break;
          case 'medium': 
            if (distance < 5 || distance > 10) return false; 
            break;
          case 'long': 
            if (distance < 10 || distance > 20) return false; 
            break;
          case 'ultra':
            if (distance < 20) return false;
            break;
          default:
            break;
        }
      }
      
      // Other filters
      if (filters.difficulty !== 'all' && route.difficulty !== filters.difficulty) {
        return false;
      }
      
      if (filters.terrain !== 'all' && route.terrain !== filters.terrain) {
        return false;
      }
      
      if (filters.time !== 'all' && route.bestTime !== filters.time) {
        return false;
      }
      
      if (filters.weather !== 'all' && route.weather !== 'all' && route.weather !== filters.weather) {
        return false;
      }
      
      if (filters.popularity !== 'all' && route.popularity !== filters.popularity) {
        return false;
      }
      
      if (searchQuery) {
        const name = String(route.name || '').toLowerCase();
        if (!name.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  };

  const toggleFavorite = async (routeId) => {
    try {
      const isFavorite = favorites.includes(routeId);
      if (isFavorite) {
        await api.delete(`/routes/${routeId}/favorite`);
        setFavorites(prev => prev.filter(id => id !== routeId));
        toast.success('Borttagen från favoriter');
      } else {
        await api.post(`/routes/${routeId}/favorite`);
        setFavorites(prev => [...prev, routeId]);
        toast.success('Tillagd till favoriter');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Kunde inte uppdatera favoriter');
    }
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setShowRouteDetail(true);
  };

  const handleRouteStart = (route) => {
    setRouteToStart(route);
    setShowStartRoute(true);
  };

  const handleStartTracking = (trackingData) => {
    console.log('Starting route tracking:', trackingData);
    toast.success('Live-spårning skulle starta här (ej implementerat än)');
  };

  const resetFilters = () => {
    setFilters({
      distance: 'all',
      difficulty: 'all',
      terrain: 'all',
      source: 'all',
      time: 'all',
      weather: 'all',
      popularity: 'all'
    });
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length + (searchQuery ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Laddar rutter..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20 lg:pb-0">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Route className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Upptäck din perfekta löprutt
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              AI-drivna rekommendationer, community-favoriter och personliga rutter anpassade för dig
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="font-medium">{routes.length} rutter</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-medium">2,847 löpare</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span className="font-medium">{routes.filter(r => r.matchScore >= 90).length} AI-matchningar</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Sök efter rutter, platser eller egenskaper..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'map' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="h-4 w-4 lg:hidden" />
                <span className="hidden lg:inline">Karta</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'cards' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-4 w-4 lg:hidden" />
                <span className="hidden lg:inline">Kort</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {/* Filter Category Tabs */}
                  <div className="flex gap-2 mb-6">
                    {Object.entries(filterCategories).map(([key, category]) => (
                      <button
                        key={key}
                        onClick={() => setActiveFilterCategory(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          activeFilterCategory === key
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <category.icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Filter Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filterCategories[activeFilterCategory].filters.map(filterKey => {
                      const filter = filterOptions[filterKey];
                      return (
                        <div key={filterKey} className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <filter.icon className="h-4 w-4" />
                            {filter.name}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {filter.options.map(option => (
                              <button
                                key={option.value}
                                onClick={() => setFilters(prev => ({ ...prev, [filterKey]: option.value }))}
                                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  filters[filterKey] === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {option.icon && <span className="text-base">{option.icon}</span>}
                                <span>{option.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reset Filters */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Rensa alla filter
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Interaktiv ruttkarta</h2>
                    <p className="text-gray-600 mt-1">Klicka på rutter för att se detaljer</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Footprints className="h-4 w-4" />
                      <span>{routes.length} rutter</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{locationPermission === 'granted' ? 'Din position' : 'Stockholm'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <RouteMap
                  routes={routes}
                  userLocation={userLocation}
                  selectedRoute={selectedRoute}
                  onRouteSelect={handleRouteSelect}
                  onRouteStart={handleRouteStart}
                  onRouteFavorite={toggleFavorite}
                  favorites={favorites}
                  height="600px"
                  className="rounded-b-2xl"
                />
                
                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <h3 className="font-medium text-sm text-gray-900 mb-2">Förklaring</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>AI-rekommenderad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Community-favorit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Strava-segment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Routes Grid */}
        <div>
          {/* AI Recommendations Section */}
          {routes.filter(r => r.source === 'AI Coach').length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI-rekommendationer</h2>
                  <p className="text-gray-600">Personligt anpassade rutter baserat på din träningsprofil</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes
                  .filter(route => route.source === 'AI Coach')
                  .map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      onSelect={handleRouteSelect}
                      onStart={handleRouteStart}
                      onFavorite={toggleFavorite}
                      isFavorite={favorites.includes(route.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* All Routes Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode === 'cards' ? 'Alla rutter' : 'Fler rutter'}
              </h2>
              <div className="text-sm text-gray-600">
                {routes.length} {routes.length === 1 ? 'rutt' : 'rutter'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {routes
                  .filter(route => viewMode === 'cards' || route.source !== 'AI Coach')
                  .map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      onSelect={handleRouteSelect}
                      onStart={handleRouteStart}
                      onFavorite={toggleFavorite}
                      isFavorite={favorites.includes(route.id)}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* No Routes Found */}
        {routes.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Route className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Inga rutter hittades</h3>
              <p className="text-gray-600 mb-6">
                Prova att justera dina filter eller sök efter något annat.
              </p>
              <button
                onClick={resetFilters}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
              >
                Rensa alla filter
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <RouteDetailModal
        route={selectedRoute}
        isOpen={showRouteDetail}
        onClose={() => {
          setShowRouteDetail(false);
          setSelectedRoute(null);
        }}
        onRouteStart={handleRouteStart}
        onRouteFavorite={toggleFavorite}
        favorites={favorites}
        userLocation={userLocation}
      />

      <StartRouteModal
        route={routeToStart}
        isOpen={showStartRoute}
        onClose={() => {
          setShowStartRoute(false);
          setRouteToStart(null);
        }}
        onStartTracking={handleStartTracking}
        userLocation={userLocation}
      />
    </div>
  );
};

// Route Card Component
const RouteCard = ({ route, onSelect, onStart, onFavorite, isFavorite }) => {
  const difficultyColors = {
    'Lätt': 'bg-green-100 text-green-700 border-green-200',
    'Medel': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Svår': 'bg-red-100 text-red-700 border-red-200',
    'Expert': 'bg-purple-100 text-purple-700 border-purple-200'
  };

  const sourceIcons = {
    'AI Coach': '🤖',
    'Strava': '🏃',
    'Community': '👥',
    'Official': '✅'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer group"
      onClick={() => onSelect(route)}
    >
      {/* Route Image */}
      <div className="relative h-56 bg-gradient-to-br from-blue-400 to-purple-600 overflow-hidden">
        <img
          src={route.image}
          alt={route.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          {/* Match Score */}
          {route.matchScore && (
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">{route.matchScore}%</span>
            </div>
          )}
          
          {/* Source */}
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-sm">{sourceIcons[route.source] || '📍'}</span>
            <span className="text-xs font-medium text-white">{route.source}</span>
          </div>
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(route.id);
          }}
          className="absolute bottom-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all transform hover:scale-110"
        >
          <Heart 
            className={`h-5 w-5 transition-colors ${
              isFavorite 
                ? 'text-red-500 fill-current' 
                : 'text-gray-700'
            }`} 
          />
        </button>
      </div>

      {/* Route Content */}
      <div className="p-6">
        {/* Title and Difficulty */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
            {route.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[route.difficulty] || difficultyColors['Medel']}`}>
            {route.difficulty}
          </span>
        </div>
        
        {/* AI Reason */}
        {route.aiReason && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 line-clamp-2">{route.aiReason}</p>
            </div>
          </div>
        )}
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {route.description}
        </p>

        {/* Route Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Navigation className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{route.distance} km</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{route.duration} min</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Mountain className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{route.elevation} m</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Zap className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{route.calories} kcal</span>
          </div>
        </div>

        {/* Highlights */}
        {route.highlights && route.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {route.highlights.slice(0, 3).map((highlight, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}

        {/* Strava Stats */}
        {route.stravaStats && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-800">Strava Stats</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-orange-900">{route.stravaStats.attempts}</div>
                <div className="text-orange-700">Försök</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-900">{route.stravaStats.averageTime}</div>
                <div className="text-orange-700">Snitt</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-900">{route.stravaStats.kom}</div>
                <div className="text-orange-700">KOM</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart(route);
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" />
            Starta rutt
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all transform hover:scale-105"
          >
            <Share className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SuggestedRoutesPage; 