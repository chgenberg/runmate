import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  MessageCircle, 
  MapPin,
  Clock,
  Hash,
  TrendingUp,
  Sparkles,
  Zap,
  Heart,
  Trophy
} from 'lucide-react';
import api from '../../services/api';
import CreateRoomModal from '../../components/Community/CreateRoomModal';

const CommunityPage = () => {
  const [rooms, setRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: 'Alla kategorier', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { value: 'location', label: 'Platsbaserat', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { value: 'training', label: 'Träningsgrupper', icon: Zap, color: 'from-orange-500 to-red-500' },
    { value: 'events', label: 'Event & Tävlingar', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { value: 'beginners', label: 'Nybörjare', icon: Heart, color: 'from-green-500 to-emerald-500' },
    { value: 'advanced', label: 'Avancerat', icon: TrendingUp, color: 'from-indigo-500 to-purple-500' }
  ];

  const popularCities = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Lund', 'Linköping'];

  const fetchRooms = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCity) params.append('city', selectedCity);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/community/rooms?${params}`);
      setRooms(response.data.rooms || generateMockRooms());
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Use mock data on error
      setRooms(generateMockRooms());
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedCity, searchTerm]);

  useEffect(() => {
    fetchRooms();
    fetchMyRooms();
  }, [fetchRooms]);

  const fetchMyRooms = async () => {
    try {
      const response = await api.get('/community/my-rooms');
      setMyRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching my rooms:', error);
    }
  };

  const generateMockRooms = () => {
    return [
      {
        _id: '1',
        title: 'Stockholms Morgonlöpare',
        description: 'Vi träffas varje tisdag och torsdag kl 06:00 vid Hötorget för gemensamma löppass. Alla nivåer välkomna!',
        category: 'location',
        location: { city: 'Stockholm' },
        stats: { memberCount: 156, messageCount: 892, lastActivity: new Date() },
        tags: ['morgon', '5-10km', 'nybörjarvänlig'],
        isHot: true
      },
      {
        _id: '2',
        title: 'Trail Running Göteborg',
        description: 'För dig som älskar att springa i naturen! Vi utforskar stigar runt Göteborg varje helg.',
        category: 'training',
        location: { city: 'Göteborg' },
        stats: { memberCount: 89, messageCount: 456, lastActivity: new Date(Date.now() - 3600000) },
        tags: ['trail', 'helger', 'natur', 'kuperat']
      },
      {
        _id: '3',
        title: 'Malmö Marathon Träning',
        description: 'Träningsgrupp för Malmö Marathon 2024. Strukturerade träningsprogram och gruppträningar.',
        category: 'events',
        location: { city: 'Malmö' },
        stats: { memberCount: 234, messageCount: 1567, lastActivity: new Date(Date.now() - 7200000) },
        tags: ['marathon', 'träningsprogram', 'långdistans'],
        isNew: true
      },
      {
        _id: '4',
        title: 'Nybörjare Uppsala',
        description: 'Perfekt för dig som just börjat springa! Vi kör lugna pass och fokuserar på teknik och glädje.',
        category: 'beginners',
        location: { city: 'Uppsala' },
        stats: { memberCount: 67, messageCount: 234, lastActivity: new Date(Date.now() - 86400000) },
        tags: ['nybörjare', 'teknik', 'social']
      },
      {
        _id: '5',
        title: 'Intervallträning Lund',
        description: 'Intensiva intervallpass för dig som vill förbättra din hastighet och kondition.',
        category: 'advanced',
        location: { city: 'Lund' },
        stats: { memberCount: 45, messageCount: 789, lastActivity: new Date() },
        tags: ['intervaller', 'hastighet', 'avancerat']
      },
      {
        _id: '6',
        title: 'Kvinnor som springer - Stockholm',
        description: 'Ett tryggt rum för kvinnor som springer. Vi stöttar varandra och har kul tillsammans!',
        category: 'location',
        location: { city: 'Stockholm' },
        stats: { memberCount: 198, messageCount: 2345, lastActivity: new Date() },
        tags: ['kvinnor', 'trygghet', 'gemenskap'],
        isHot: true
      }
    ];
  };

  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Aktiv nu';
    if (diffHours < 24) return `${diffHours}h sedan`;
    return `${Math.floor(diffHours / 24)}d sedan`;
  };

  const getCategoryData = (category) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [newRoom, ...prev]);
    setMyRooms(prev => [newRoom, ...prev]);
    fetchRooms();
  };

  const RoomCard = ({ room, isMember = false }) => {
    const categoryData = getCategoryData(room.category);
    const Icon = categoryData.icon;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
        onClick={() => window.location.href = `/app/community/${room._id}`}
      >
        {/* Header with gradient */}
        <div className={`h-2 bg-gradient-to-r ${categoryData.color}`}></div>
        
        <div className="p-6">
          {/* Room info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${categoryData.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 transition-all">
                    {room.title}
                  </h3>
                  {room.isHot && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Hot
                    </span>
                  )}
                  {room.isNew && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                      Ny
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 capitalize">{categoryData.label}</p>
              </div>
            </div>
            {isMember && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs rounded-full font-medium shadow-md"
              >
                Medlem
              </motion.span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {room.description}
          </p>

          {/* Location */}
          {room.location?.city && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{room.location.city}</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{room.stats.memberCount}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="p-1.5 bg-pink-50 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{room.stats.messageCount}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatLastActivity(room.stats.lastActivity)}
              </span>
            </div>
          </div>

          {/* Tags */}
          {room.tags && room.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {room.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 text-xs rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
              {room.tags.length > 3 && (
                <span className="px-3 py-1 text-xs text-gray-400 font-medium">
                  +{room.tags.length - 3} fler
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Community
              </h1>
              <p className="text-gray-600 mt-1">Hitta din löpargrupp och få nya vänner</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-700" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Skapa rum</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Search */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                Sök & Filtrera
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Sök community-rum..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                
                {/* City filter with popular cities */}
                <div>
                  <input
                    type="text"
                    placeholder="Alla städer..."
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {popularCities.map(city => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(selectedCity === city ? '' : city)}
                        className={`px-3 py-1 text-xs rounded-full transition-all ${
                          selectedCity === city
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Kategorier</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* My Rooms */}
            {myRooms.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Mina rum</h3>
                <div className="space-y-3">
                  {myRooms.slice(0, 5).map((room) => (
                    <div
                      key={room._id}
                      onClick={() => window.location.href = `/app/community/${room._id}`}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Hash className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {room.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {room.stats.memberCount} medlemmar
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Inga rum hittades
                </h3>
                <p className="text-gray-500 mb-6">
                  Prova att ändra dina sökfilter eller skapa ett nytt rum
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Skapa första rummet
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    isMember={myRooms.some(myRoom => myRoom._id === room._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
};

export default CommunityPage; 