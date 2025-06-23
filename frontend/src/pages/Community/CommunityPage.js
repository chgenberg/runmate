import React, { useState, useEffect } from 'react';
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
  Star
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

  const categories = [
    { value: 'all', label: 'Alla', icon: Hash },
    { value: 'location', label: 'Plats', icon: MapPin },
    { value: 'training', label: 'Träning', icon: TrendingUp },
    { value: 'events', label: 'Event', icon: Star },
    { value: 'beginners', label: 'Nybörjare', icon: Users },
    { value: 'advanced', label: 'Avancerat', icon: TrendingUp }
  ];

  useEffect(() => {
    fetchRooms();
    fetchMyRooms();
  }, [selectedCategory, selectedCity, searchTerm]);

  const fetchRooms = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCity) params.append('city', selectedCity);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/community/rooms?${params}`);
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRooms = async () => {
    try {
      const response = await api.get('/community/my-rooms');
      setMyRooms(response.data);
    } catch (error) {
      console.error('Error fetching my rooms:', error);
    }
  };

  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Aktiv nu';
    if (diffHours < 24) return `${diffHours}h sedan`;
    return `${Math.floor(diffHours / 24)}d sedan`;
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData ? categoryData.icon : Hash;
  };

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [newRoom, ...prev]);
    setMyRooms(prev => [newRoom, ...prev]);
    fetchRooms(); // Refresh the list
  };

  const RoomCard = ({ room, isMember = false }) => {
    const Icon = getCategoryIcon(room.category);
    
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
        onClick={() => window.location.href = `/app/community/${room._id}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{room.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{room.category}</p>
            </div>
          </div>
          {isMember && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Medlem
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>

        {/* Location */}
        {room.location?.city && (
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{room.location.city}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{room.stats.memberCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{room.stats.messageCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              {formatLastActivity(room.stats.lastActivity)}
            </span>
          </div>
        </div>

        {/* Tags */}
        {room.tags && room.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {room.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {room.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{room.tags.length - 3} fler</span>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community</h1>
              <p className="text-gray-600 mt-1">Hitta och gå med i löpargrupper</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Skapa rum</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Search */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök community-rum..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* City filter */}
              <input
                type="text"
                placeholder="Filtrera på stad..."
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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