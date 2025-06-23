import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Activity, Star, ChevronLeft, ChevronRight, Users, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileAvatar from '../../components/common/ProfileAvatar';

const InteractiveLanding = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/public');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback mock data for demonstration
      setUsers(generateMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const generateMockUsers = () => {
    const names = [
      'Emma Johansson', 'Marcus Andersson', 'Sara Lindqvist', 'Johan Nilsson',
      'Anna Svensson', 'Viktor Bergman', 'Lisa Karlsson', 'Andreas Olsson',
      'Maja Eriksson', 'Oscar Lindberg', 'Julia Pettersson', 'Erik Gustafsson'
    ];
    
    const locations = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Lund', 'Örebro'];
    const paces = ['4:30', '5:00', '5:30', '6:00', '6:30', '7:00'];
    const activities = ['Löpning', 'Cykling', 'Trail', 'Intervaller', 'Långdistans'];
    
    return names.map((name, index) => ({
      _id: index.toString(),
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
      profilePicture: `https://ui-avatars.com/api/?name=${name}&background=random&size=400`,
      location: locations[index % locations.length],
      pace: paces[index % paces.length],
      bio: `Älskar att ${activities[index % activities.length].toLowerCase()} och träffa nya träningskompisar!`,
      rating: 4 + Math.random(),
      totalRuns: Math.floor(Math.random() * 200) + 50,
      weeklyGoal: Math.floor(Math.random() * 50) + 20,
      favoriteActivities: [activities[index % activities.length], activities[(index + 1) % activities.length]]
    }));
  };

  const filteredUsers = users.filter(user => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'runners') return user.pace;
    if (selectedCategory === 'cyclists') return user.favoriteActivities?.includes('Cykling');
    return true;
  });

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleUserClick = (userId) => {
    // Navigate to public profile page
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar medlemmar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 z-10"></div>
        <div className="container mx-auto px-4 pt-20 pb-10 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-700 animate-pulse">
              <Sparkles className="w-4 h-4 mr-1" />
              {users.length}+ aktiva löpare väntar på dig
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Träffa dina nya
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                träningskompisar
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scrolla och utforska våra medlemmar. Klicka på någon du gillar för att komma igång!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex justify-center space-x-4">
          {[
            { id: 'all', label: 'Alla', icon: Users },
            { id: 'runners', label: 'Löpare', icon: Activity },
            { id: 'cyclists', label: 'Cyklister', icon: Activity }
          ].map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              <category.icon className="w-5 h-5" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Users Carousel */}
      <div className="relative">
        {/* Scroll buttons */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => scroll('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
          )}
          
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* User cards container */}
        <div 
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide px-8 py-8 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredUsers.length === 0 ? (
            <div className="w-full text-center py-20">
              <p className="text-xl text-gray-500 mb-4">Inga användare att visa för denna kategori</p>
              <p className="text-gray-400">Prova att välja "Alla" kategorin ovan</p>
            </div>
          ) : (
            filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleUserClick(user._id)}
              className="flex-shrink-0 w-80 cursor-pointer group"
            >
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                {/* Image */}
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={user.profilePicture || user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'User')}+${encodeURIComponent(user.lastName || '')}&size=400&background=random`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      if (!e.target.src.includes('ui-avatars.com')) {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'User')}+${encodeURIComponent(user.lastName || '')}&size=400&background=random`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* User info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">
                      {user.firstName} {user.lastName?.charAt(0)}.
                    </h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.location}
                      </span>
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        {user.pace} min/km
                      </span>
                    </div>
                  </div>

                  {/* Rating badge */}
                  {user.rating && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{user.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Card content */}
                <div className="p-6 space-y-4">
                  <p className="text-gray-600 line-clamp-2">{user.bio}</p>
                  
                  {/* Stats */}
                  <div className="flex justify-between text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.totalRuns || 0}</p>
                      <p className="text-sm text-gray-500">Träningspass</p>
                    </div>
                    <div className="border-l border-gray-200"></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.weeklyGoal || 0}km</p>
                      <p className="text-sm text-gray-500">Veckans mål</p>
                    </div>
                  </div>

                  {/* Activities */}
                  {user.favoriteActivities && (
                    <div className="flex flex-wrap gap-2">
                      {user.favoriteActivities.map((activity, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold transform transition-all group-hover:scale-105 group-hover:shadow-lg">
                    Se profil & matcha
                  </button>
                </div>
              </div>
            </motion.div>
          ))
          )}
        </div>
      </div>

      {/* Join CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="container mx-auto px-4 py-20 text-center"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Redo att börja din träningsresa?
          </h2>
          <p className="text-xl text-gray-600">
            Gå med idag och hitta din perfekta träningskompis bland {users.length}+ aktiva medlemmar
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold text-lg transform transition-all hover:scale-105 hover:shadow-lg"
          >
            <Heart className="w-6 h-6 mr-2" />
            Skapa konto gratis
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveLanding; 