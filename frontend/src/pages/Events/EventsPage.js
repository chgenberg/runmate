import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Filter, 
  Globe, Trophy, ChevronLeft, X,
  Search, Sparkles, Zap, Heart, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const EventsPage = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    distance: 'all',
    date: 'all',
    location: 'all',
    type: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for events - will be replaced with scraped data
  const mockEvents = [
    {
      id: 1,
      title: 'Stockholm Marathon',
      date: '2024-06-01',
      location: 'Stockholm',
      distance: '42.2km',
      participants: 15000,
      price: '1200 SEK',
      image: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800',
      description: 'Sveriges största maraton genom huvudstadens vackraste delar',
      organizer: 'Stockholm Marathon AB',
      website: 'stockholmmarathon.se',
      categories: ['Maraton', 'Landsväg'],
      difficulty: 'Medel'
    },
    {
      id: 2,
      title: 'Göteborgsvarvet',
      date: '2024-05-18',
      location: 'Göteborg',
      distance: '21.1km',
      participants: 60000,
      price: '650 SEK',
      image: 'https://images.unsplash.com/photo-1490483004594-277c66b4e5c9?w=800',
      description: 'Världens största halvmaraton med fantastisk stämning',
      organizer: 'Göteborgsvarvet',
      website: 'goteborgsvarvet.se',
      categories: ['Halvmaraton', 'Landsväg'],
      difficulty: 'Medel'
    },
    {
      id: 3,
      title: 'Lidingöloppet',
      date: '2024-09-28',
      location: 'Lidingö',
      distance: '30km',
      participants: 35000,
      price: '895 SEK',
      image: 'https://images.unsplash.com/photo-1474546652694-a33dd8161d66?w=800',
      description: 'Världens största terränglöpning genom Lidingös skogar',
      organizer: 'Lidingöloppet',
      website: 'lidingoloppet.se',
      categories: ['Trail', 'Terräng'],
      difficulty: 'Svår'
    },
    {
      id: 4,
      title: 'Midnattsloppet',
      date: '2024-08-10',
      location: 'Stockholm',
      distance: '10km',
      participants: 20000,
      price: '450 SEK',
      image: 'https://images.unsplash.com/photo-1523309996740-d5315f9cc28b?w=800',
      description: 'Löp genom Stockholm i skymningen',
      organizer: 'Midnattsloppet',
      website: 'midnattsloppet.com',
      categories: ['10K', 'Landsväg'],
      difficulty: 'Lätt'
    },
    {
      id: 5,
      title: 'Ultravasan',
      date: '2024-08-16',
      location: 'Sälen-Mora',
      distance: '90km',
      participants: 2000,
      price: '1950 SEK',
      image: 'https://images.unsplash.com/photo-1456613820599-bfe244172af5?w=800',
      description: 'En av Sveriges tuffaste ultralopp längs Vasaloppsleden',
      organizer: 'Vasaloppet',
      website: 'vasaloppet.se',
      categories: ['Ultra', 'Trail'],
      difficulty: 'Mycket svår'
    },
    {
      id: 6,
      title: 'Malmö Halvmarathon',
      date: '2024-09-07',
      location: 'Malmö',
      distance: '21.1km',
      participants: 8000,
      price: '550 SEK',
      image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
      description: 'Snabb bana genom Malmös centrum och längs havet',
      organizer: 'Malmö Halvmarathon',
      website: 'malmohalvmarathon.se',
      categories: ['Halvmaraton', 'Landsväg'],
      difficulty: 'Medel'
    }
  ];

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistance = filters.distance === 'all' || 
                           (filters.distance === '5-10' && (event.distance === '5km' || event.distance === '10km')) ||
                           (filters.distance === 'half' && event.distance === '21.1km') ||
                           (filters.distance === 'marathon' && event.distance === '42.2km') ||
                           (filters.distance === 'ultra' && parseInt(event.distance) > 42);
    const matchesLocation = filters.location === 'all' || event.location === filters.location;
    
    return matchesSearch && matchesDistance && matchesLocation;
  });

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Lätt': return 'text-green-600 bg-green-100';
      case 'Medel': return 'text-yellow-600 bg-yellow-100';
      case 'Svår': return 'text-orange-600 bg-orange-100';
      case 'Mycket svår': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center mb-4">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Löpningsevent</h1>
              <p className="text-sm text-gray-600">Upptäck löpningar över hela Sverige</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök event eller plats..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>
        
        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 px-4 overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {/* Distance filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Distans</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'Alla' },
                      { value: '5-10', label: '5-10 km' },
                      { value: 'half', label: 'Halvmaraton' },
                      { value: 'marathon', label: 'Maraton' },
                      { value: 'ultra', label: 'Ultra' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setFilters(prev => ({ ...prev, distance: option.value }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filters.distance === option.value
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Location filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Plats</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'Hela Sverige' },
                      { value: 'Stockholm', label: 'Stockholm' },
                      { value: 'Göteborg', label: 'Göteborg' },
                      { value: 'Malmö', label: 'Malmö' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setFilters(prev => ({ ...prev, location: option.value }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filters.location === option.value
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero Banner */}
      <div className="relative px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Kommande Event</h2>
            </div>
            <p className="text-white/90 mb-6">
              Vi samlar löpningsevent från hela Sverige. Hitta din nästa utmaning!
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{mockEvents.length}+ event</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Hela Sverige</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>2024</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="p-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Inga event hittades</h3>
            <p className="text-gray-600">Prova att ändra dina filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setSelectedEvent(event)}
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {/* Date badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-gray-600">
                      {new Date(event.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  
                  {/* Distance badge */}
                  <div className="absolute top-4 right-4 bg-orange-500 text-white rounded-xl px-3 py-1">
                    <p className="text-sm font-bold">{event.distance}</p>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location?.name || event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.participants.toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(event.difficulty)}`}>
                      {event.difficulty}
                    </span>
                    <span className="text-lg font-bold text-gray-900">{event.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Coming Soon Notice */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Fler event kommer snart!</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Vi arbetar på att integrera fler eventkällor för att ge dig en komplett översikt över alla löpningsevent i Sverige.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="w-4 h-4" />
              <span>Automatisk uppdatering</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Heart className="w-4 h-4" />
              <span>Personliga rekommendationer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Event header image */}
              <div className="relative h-64 rounded-t-3xl overflow-hidden">
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedEvent.title}</h2>
                  <p className="text-lg opacity-90">{formatDate(selectedEvent.date)}</p>
                </div>
              </div>
              
              <div className="p-8">
                {/* Key info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-orange-50 rounded-2xl p-4 text-center">
                    <MapPin className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Plats</p>
                    <p className="font-bold text-gray-900">{selectedEvent.location?.name || selectedEvent.location}</p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4 text-center">
                    <Activity className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Distans</p>
                    <p className="font-bold text-gray-900">{selectedEvent.distance}</p>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4 text-center">
                    <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Deltagare</p>
                    <p className="font-bold text-gray-900">{selectedEvent.participants.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 text-center">
                    <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Svårighet</p>
                    <p className="font-bold text-gray-900">{selectedEvent.difficulty}</p>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Om eventet</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                </div>
                
                {/* Categories */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Kategorier</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.categories.map((category, idx) => (
                      <span key={idx} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Organizer info */}
                <div className="mb-8 p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-gray-600 mb-1">Arrangör</p>
                  <p className="font-semibold text-gray-900">{selectedEvent.organizer}</p>
                  <a href={`https://${selectedEvent.website}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 text-sm">
                    {selectedEvent.website} →
                  </a>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      toast.success('Länk kopierad!');
                      setSelectedEvent(null);
                    }}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                  >
                    Dela event
                  </button>
                  <a
                    href={`https://${selectedEvent.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-center flex items-center justify-center gap-2"
                  >
                    <Globe className="w-5 h-5" />
                    Gå till hemsida
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsPage; 