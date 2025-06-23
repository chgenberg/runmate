import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  MessageCircle, 
  MapPin,
  Star,
  ArrowLeft,
  Send
} from 'lucide-react';
import api from '../../services/api';

const AllMembersPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState('');
  const [swipedMembers, setSwipedMembers] = useState(new Set());

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/public?limit=50');
      const allMembers = response.data.users || generateMockMembers();
      setMembers(allMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers(generateMockMembers());
    } finally {
      setLoading(false);
    }
  };

  const generateMockMembers = () => {
    const names = [
      'Emma Johansson', 'Marcus Andersson', 'Sara Lindqvist', 'Johan Nilsson',
      'Anna Svensson', 'Viktor Bergman', 'Lisa Karlsson', 'Andreas Olsson',
      'Maja Eriksson', 'Oscar Lindberg', 'Julia Pettersson', 'Erik Gustafsson',
      'Klara Henriksson', 'Simon Larsson', 'Elin Persson', 'Filip Jansson'
    ];
    
    const locations = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Lund', 'Örebro', 'Linköping', 'Västerås'];
    const motivations = [
      'Älskar känslan efter ett långpass',
      'Tränar för mitt första maraton',
      'Springer för hälsan och gemenskapen',
      'Jagar nya PB varje vecka!',
      'Löpning är min meditation',
      'Tränar för Vasaloppet',
      'Gillar att utmana mig själv',
      'Springer för att må bra'
    ];

    return names.map((name, idx) => ({
      _id: idx.toString(),
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
      profilePicture: `https://ui-avatars.com/api/?name=${name}&background=random&size=400`,
      location: locations[idx % locations.length],
      personalBests: { 
        '5k': `${20 + Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        '10k': `${40 + Math.floor(Math.random() * 15)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        'halfMarathon': `${90 + Math.floor(Math.random() * 30)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
      },
      motivation: motivations[idx % motivations.length],
      favoriteActivities: ['Löpning', 'Trail', 'Intervaller', 'Långpass'].slice(0, Math.floor(Math.random() * 3) + 1),
      rating: 3.5 + Math.random() * 1.5,
      weeklyKm: Math.floor(Math.random() * 60) + 15,
      totalRuns: Math.floor(Math.random() * 200) + 50,
      memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const handleSwipe = (action) => {
    if (currentIndex >= members.length) return;
    
    const member = members[currentIndex];
    setSwipedMembers(prev => new Set(prev).add(member._id));
    
    if (action === 'message') {
      setSelectedMember(member);
      setShowMessageModal(true);
    } else if (action === 'like') {
      // Handle like action
      console.log('Liked:', member.firstName);
      // Move to next member
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    } else if (action === 'pass') {
      // Handle pass action
      console.log('Passed:', member.firstName);
      // Move to next member
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }
  };

  const sendMessage = () => {
    console.log('Sending message to:', selectedMember.firstName, message);
    setShowMessageModal(false);
    setMessage('');
    setSelectedMember(null);
    // Move to next member after sending message
    setCurrentIndex(prev => prev + 1);
  };

  const currentMember = members[currentIndex];

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Alla medlemmar</h1>
          <div className="text-sm text-gray-600">
            {currentIndex + 1} / {members.length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentIndex < members.length ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMember._id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Member Header with Image */}
              <div className="relative h-48 md:h-64 bg-gradient-to-br from-orange-400 to-red-400">
                <img 
                  src={currentMember.profilePicture}
                  alt={currentMember.firstName}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{currentMember.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                </div>
              </div>

              {/* Member Info */}
              <div className="p-6 md:p-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {currentMember.firstName} {currentMember.lastName}
                </h2>
                <div className="flex items-center justify-center text-gray-600 mb-6">
                  <MapPin className="w-5 h-5 mr-1" />
                  <span>{currentMember.location || 'Sverige'}</span>
                </div>

                {/* Personal Bests */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">5K PB</p>
                    <p className="text-xl font-bold text-gray-900">{currentMember.personalBests?.['5k'] || '25:00'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">10K PB</p>
                    <p className="text-xl font-bold text-gray-900">{currentMember.personalBests?.['10k'] || '50:00'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Halvmara</p>
                    <p className="text-xl font-bold text-gray-900">{currentMember.personalBests?.halfMarathon || '2:00:00'}</p>
                  </div>
                </div>

                {/* Motivation */}
                <div className="bg-orange-50 rounded-xl p-6 mb-6">
                  <p className="text-lg text-gray-700 italic">
                    "{currentMember.motivation || 'Älskar att springa och träffa nya träningskompisar!'}"
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Veckosnitt</p>
                    <p className="text-2xl font-bold text-gray-900">{currentMember.weeklyKm || 30} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Totalt antal pass</p>
                    <p className="text-2xl font-bold text-gray-900">{currentMember.totalRuns || 100}</p>
                  </div>
                </div>

                {/* Activities */}
                {currentMember.favoriteActivities && (
                  <div className="mb-8">
                    <p className="text-sm text-gray-500 mb-3">Favoritaktiviteter</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentMember.favoriteActivities.map((activity, idx) => (
                        <span 
                          key={idx}
                          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => handleSwipe('pass')}
                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-all transform hover:scale-110"
                  >
                    <X className="w-8 h-8 text-gray-700" />
                  </button>
                  
                  <button
                    onClick={() => handleSwipe('message')}
                    className="p-4 bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg rounded-full transition-all transform hover:scale-110"
                  >
                    <MessageCircle className="w-8 h-8 text-white" />
                  </button>
                  
                  <button
                    onClick={() => handleSwipe('like')}
                    className="p-4 bg-green-500 hover:bg-green-600 rounded-full transition-all transform hover:scale-110"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Du har sett alla medlemmar!
            </h2>
            <p className="text-gray-600 mb-8">
              Kom tillbaka senare för att se fler löpare
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Tillbaka till startsidan
            </button>
          </div>
        )}
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Skicka meddelande till {selectedMember?.firstName}
                </h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hej! Jag såg din profil och skulle gärna vilja springa tillsammans..."
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Avbryt
                </button>
                <button
                  onClick={sendMessage}
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Skicka</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllMembersPage; 