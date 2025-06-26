import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Mountain, Target, Zap, Navigation,
  Search, Heart, Share, Play,
  TrendingUp, Route, Filter
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
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [filters, setFilters] = useState({
    distance: 'all',
    difficulty: 'all',
    terrain: 'all',
    source: 'all' // ai, osm, strava, popular
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map', 'cards'
  const [favorites, setFavorites] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const [showStartRoute, setShowStartRoute] = useState(false);
  const [routeToStart, setRouteToStart] = useState(null);

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
      const lat = userLocation?.lat || 59.3293; // Fallback to Stockholm
      const lng = userLocation?.lng || 18.0686;
      
      console.log('Loading routes for coordinates:', { lat, lng, userLocation });

      // 1. AI-baserade rutter baserat på coaching data
      if (filters.source === 'all' || filters.source === 'ai') {
        const aiRoutes = generateAiRoutes();
        routeSources.push(...aiRoutes);
      }

      // 2. OpenStreetMap rutter via Overpass API
      if (filters.source === 'all' || filters.source === 'osm') {
        const osmRoutes = await loadOsmRoutes(lat, lng);
        routeSources.push(...osmRoutes);
      }

      // 3. Populära community rutter
      if (filters.source === 'all' || filters.source === 'popular') {
        const popularRoutes = await loadPopularRoutes(lat, lng);
        routeSources.push(...popularRoutes);
      }

      // 4. Strava Segments (mock for now)
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
      if (response.data.user.aiCoachData) {
        setAiCoachData(response.data.user.aiCoachData);
      }
    } catch (error) {
      console.error('Error loading AI coach data:', error);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using Stockholm fallback');
      setLocationPermission('denied');
      setUserLocation({ lat: 59.3293, lng: 18.0686 }); // Fallback to Stockholm
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
        // Fallback to Stockholm for demo
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
          radius: 20000, // 20km radius
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
        image: '/lopning1.png'
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
        image: '/lopning2.png'
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
        image: '/lopning3.png'
      });
    }

    return baseRoutes;
  };

  const generateStravaRoutes = () => {
    // Mock Strava segments - i produktionen skulle detta kopplas till Strava API
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
        }
      }
    ];
  };

  const generateRouteCoordinates = (center, distance) => {
    // Enkel algoritm för att generera rutt-koordinater
    const coords = [];
    const points = Math.max(10, Math.round(distance * 3));
    // Better radius calculation: ~111km per degree latitude
    const radiusLat = (distance / 111) * 0.3; // Smaller radius for more realistic routes
    const radiusLng = radiusLat / Math.cos(center.lat * Math.PI / 180); // Adjust for longitude

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
            if (distance < 10) return false; 
            break;
          default:
            break;
        }
      }
      
      if (filters.difficulty !== 'all' && route.difficulty !== filters.difficulty) {
        return false;
      }
      
      if (filters.terrain !== 'all' && route.terrain !== filters.terrain) {
        return false;
      }
      
      if (searchQuery && !route.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
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
    // This would integrate with a live tracking system
    console.log('Starting route tracking:', trackingData);
    
    // For now, just navigate to a tracking page or show a placeholder
    toast.success('Live-spårning skulle starta här (ej implementerat än)');
    
    // In a real implementation, this might navigate to:
    // navigate('/app/live-tracking', { state: { trackingData } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Laddar rutter..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Route className="h-8 w-8 text-blue-600" />
                Hitta löprutter
              </h1>
              <p className="text-gray-600 mt-1">
                {locationPermission === 'granted' 
                  ? `Upptäck rutter inom 20 km från din position`
                  : 'Upptäck rutter runt om i Sverige'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Karta
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Kort
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Interactive Map */}
        {viewMode === 'map' && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Interaktiv ruttkarta</h2>
                <div className="text-sm text-gray-500">
                  {routes.length} rutter visas • Klicka på rutter för detaljer
                </div>
              </div>
              
              <RouteMap
                routes={routes}
                userLocation={userLocation}
                selectedRoute={selectedRoute}
                onRouteSelect={handleRouteSelect}
                onRouteStart={handleRouteStart}
                onRouteFavorite={toggleFavorite}
                favorites={favorites}
                height="500px"
              />
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filter och sök</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Sök rutter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Distance Filter */}
            <select
              value={filters.distance}
              onChange={(e) => setFilters(prev => ({ ...prev, distance: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla distanser</option>
              <option value="short">Kort (0-5 km)</option>
              <option value="medium">Medel (5-10 km)</option>
              <option value="long">Lång (10+ km)</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla svårigheter</option>
              <option value="Lätt">Lätt</option>
              <option value="Medel">Medel</option>
              <option value="Svår">Svår</option>
            </select>

            {/* Source Filter */}
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla källor</option>
              <option value="ai">AI Coach</option>
              <option value="osm">OpenStreetMap</option>
              <option value="popular">Populära</option>
              <option value="strava">Strava</option>
            </select>
          </div>
        </div>

        {/* Routes Grid - only show if cards view or as supplement to map */}
        {(viewMode === 'cards' || viewMode === 'map') && (
          <div>
            {viewMode === 'map' && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">AI-rekommenderade rutter</h2>
                <p className="text-gray-600">Baserat på din AI-coaching och preferenser</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {routes
                  .filter(route => viewMode === 'cards' || route.source === 'AI Coach')
                  .slice(0, viewMode === 'map' ? 6 : routes.length)
                  .map((route) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                    onClick={() => handleRouteSelect(route)}
                  >
                    {/* Route Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-green-500">
                      <img
                        src={route.image}
                        alt={route.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Match Score Badge */}
                      {route.matchScore && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-green-600">
                          {route.matchScore}% match
                        </div>
                      )}
                      
                      {/* Source Badge */}
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-white">
                        {route.source}
                      </div>
                      
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(route.id);
                        }}
                        className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      >
                        <Heart 
                          className={`h-5 w-5 ${
                            favorites.includes(route.id) 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-600'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Route Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {route.name}
                      </h3>
                      
                      {route.aiReason && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800">{route.aiReason}</p>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {route.description}
                      </p>

                      {/* Route Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Navigation className="h-4 w-4" />
                          <span>{route.distance} km</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{route.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mountain className="h-4 w-4" />
                          <span>{route.elevation} m</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Zap className="h-4 w-4" />
                          <span>{route.calories} kcal</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      {route.highlights && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {route.highlights.slice(0, 3).map((highlight, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Strava Stats */}
                      {route.stravaStats && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">Strava Stats</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-orange-700">
                            <div>{route.stravaStats.attempts} försök</div>
                            <div>KOM: {route.stravaStats.kom}</div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRouteStart(route);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Starta
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Share className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* No Routes Found */}
        {routes.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Route className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inga rutter hittades</h3>
            <p className="text-gray-600 mb-4">
              Prova att justera dina filter eller sök efter något annat.
            </p>
            <button
              onClick={() => {
                setFilters({ distance: 'all', difficulty: 'all', terrain: 'all', source: 'all' });
                setSearchQuery('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Rensa filter
            </button>
          </div>
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

export default SuggestedRoutesPage; 