import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  Trophy, 
  Calendar,
  Star,
  MapPin,
  Target,
  Clock,
  TrendingUp,
  Award,
  Heart,
  X,
  MessageCircle,
  Send
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import ProfileAvatar from '../../components/common/ProfileAvatar';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState('');

  const membersScrollRef = useRef(null);
  const challengesScrollRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [membersRes, challengesRes, eventsRes, leaderboardRes] = await Promise.all([
          api.get('/discover/users?limit=10'),
          api.get('/challenges?limit=5'),
          api.get('/runevents/upcoming?limit=5'), 
          api.get('/users/leaderboard?limit=5')
        ]);
        
        setMembers(membersRes.data.users || []);
        setChallenges(challengesRes.data.challenges || []);
        setEvents(eventsRes.data.events || []);
        setLeaderboard(leaderboardRes.data.users || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty arrays on error instead of mock data
        setMembers([]);
        setChallenges([]);
        setEvents([]);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 320;
      const currentScroll = ref.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      ref.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleMemberAction = (member, action) => {
    if (action === 'message') {
      setSelectedMember(member);
      setShowMessageModal(true);
    } else if (action === 'like') {
      // Handle like action - only show one toast
      console.log('Liked:', member.firstName);
    }
  };

  const sendMessage = async () => {
    try {
      // Create or find existing chat with the user
      const response = await api.post('/chat/create', {
        participantId: selectedMember._id,
        initialMessage: message.trim()
      });
      
      if (response.data.success) {
        // Navigate to the chat
        navigate(`/app/messages/${response.data.chatId}`);
        setShowMessageModal(false);
        setMessage('');
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Kunde inte skicka meddelandet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar din dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 z-10"></div>
        <div className="container mx-auto px-4 pt-6 pb-8 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
              Välkommen tillbaka,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                {user?.firstName}!
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Här är din överblick för dagen
            </p>
          </motion.div>
        </div>
      </div>

      {/* Members Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Upptäck löpare</h2>
              <span className="text-sm text-gray-500 whitespace-nowrap">({members.length}+ nya)</span>
            </div>
            <button 
              onClick={() => navigate('/app/discover')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium whitespace-nowrap"
            >
              <span>Visa alla</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => scroll(membersScrollRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all md:p-3"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={() => scroll(membersScrollRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all md:p-3"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <div 
              ref={membersScrollRef}
              className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {members.map((member) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-shrink-0 w-72 md:w-80"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
                    <div className="relative h-32 bg-gradient-to-br from-orange-400 to-red-400">
                      <div className="absolute bottom-4 left-6">
                        <ProfileAvatar 
                          user={member}
                          src={member.profilePicture}
                          size="lg"
                          className="border-4 border-white"
                        />
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold">{member.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 pt-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {member.firstName} {member.lastName?.charAt(0)}.
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {member.location || 'Sverige'}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">PB 10k</span>
                          <span className="font-semibold">{member.personalBests?.['10k'] || '45:00'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Veckosnitt</span>
                          <span className="font-semibold">{member.weeklyKm || 30} km</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 italic mb-4 line-clamp-2">
                        "{member.motivation || 'Älskar att springa!'}"
                      </p>

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleMemberAction(member, 'message')}
                          className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Kontakta</span>
                        </button>
                        <button 
                          onClick={() => handleMemberAction(member, 'like')}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Dina utmaningar</h2>
            </div>
            <button 
              onClick={() => navigate('/app/challenges')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium whitespace-nowrap"
            >
              <span>Visa alla</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <div 
              ref={challengesScrollRef}
              className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {challenges.map((challenge) => (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-shrink-0 w-72 md:w-80"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <Target className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="text-sm text-gray-500">{challenge.daysLeft} dagar kvar</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">{challenge.progress}% genomfört</span>
                        <span className="font-semibold text-orange-600">{challenge.reward}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${challenge.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/app/challenges/${challenge._id}`)}
                      className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Se detaljer
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Kommande aktiviteter</h2>
            </div>
            <button 
              onClick={() => navigate('/app/activities')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium whitespace-nowrap"
            >
              <span>Visa mer</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/app/runevents/${event._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(event.date).toLocaleDateString('sv-SE', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {event.location}
                  </span>
                  <span className="font-semibold text-orange-600">{event.distance}</span>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">{event.participants} deltagare</span>
                  <span className="text-sm font-medium text-orange-500">Gå med →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Veckans topplista</h2>
            </div>
            <button 
              onClick={() => navigate('/app/leaderboard')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium whitespace-nowrap"
            >
              <span>Visa mer</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Your stats - Focus on Distance & Points */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Din vecka</p>
                  <p className="text-3xl font-bold">{userStats?.stats?.totalDistance || 0} km</p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Totala poäng</p>
                  <p className="text-2xl font-bold">{userStats?.user?.points || '8420'}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm mb-1">Nationell ranking</p>
                  <p className="text-2xl font-bold">#{userStats?.rankings?.national || '-'}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Trophy className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Top 5 */}
            <div className="space-y-3">
              {leaderboard.map((runner, index) => (
                <div key={runner._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <ProfileAvatar 
                      user={{ firstName: runner.name.split(' ')[0], lastName: runner.name.split(' ')[1] }}
                      src={runner.profilePicture}
                      size="sm"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{runner.name}</p>
                      <p className="text-sm text-gray-600">{runner.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{runner.weeklyKm} km</p>
                    <p className="text-sm text-gray-600">{runner.points} poäng</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rating Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 text-white text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Ditt betyg</h2>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-8 h-8 ${i < Math.floor(userStats?.user?.rating || 4.5) ? 'fill-current' : ''}`} 
                />
              ))}
              <span className="text-3xl font-bold ml-2">{userStats?.user?.rating || '4.7'}</span>
            </div>
            <p className="text-white/80">Baserat på {userStats?.totalRatings || 38} omdömen</p>
            
            <button 
              onClick={() => navigate('/app/ratings')}
              className="mt-6 px-6 py-3 bg-white text-orange-600 rounded-full font-bold hover:shadow-lg transition-all"
            >
              Se alla omdömen
            </button>
          </div>
        </div>
      </section>

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

export default DashboardPage; 