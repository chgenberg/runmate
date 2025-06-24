import React, { useState, useEffect, useRef } from 'react';
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
  MessageCircle,
  Send,
  X,
  Activity,
  Heart
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
  const [userStats] = useState({});
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
          api.get('/users/discover?limit=10'),
          api.get('/challenges?limit=5'),
          api.get('/runevents?limit=5'), 
          api.get('/users/leaderboard?limit=5')
        ]);
        
        setMembers(membersRes.data.users || []);
        setChallenges(challengesRes.data || challengesRes.data.challenges || []);
        setEvents(eventsRes.data.data || eventsRes.data.events || []);
        setLeaderboard(leaderboardRes.data.data?.leaderboard || leaderboardRes.data.users || []);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-runmate-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar din dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Minimalist Design */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight">
              VÄLKOMMEN TILLBAKA,
            </h1>
            <h2 className="text-5xl md:text-7xl font-bold text-runmate-orange mt-2">
              {user?.firstName?.toUpperCase()}!
            </h2>
            <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
              Här är din överblick för dagen
            </p>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats - Minimalist Cards */}
      <section className="py-8 px-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 text-center"
            >
              <Activity className="w-8 h-8 text-runmate-orange mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">{userStats?.stats?.totalDistance || 42}</p>
              <p className="text-sm text-gray-600 mt-1">km denna vecka</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-2xl p-6 text-center"
            >
              <Trophy className="w-8 h-8 text-runmate-orange mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">{userStats?.user?.points || 8420}</p>
              <p className="text-sm text-gray-600 mt-1">totala poäng</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 rounded-2xl p-6 text-center"
            >
              <Users className="w-8 h-8 text-runmate-orange mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">{members.length}</p>
              <p className="text-sm text-gray-600 mt-1">nya löpare</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 rounded-2xl p-6 text-center"
            >
              <Heart className="w-8 h-8 text-runmate-orange mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">{userStats?.streak || 12}</p>
              <p className="text-sm text-gray-600 mt-1">dagars streak</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Members Section - Minimalist Cards */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Upptäck löpare</h2>
            <button 
              onClick={() => navigate('/app/members')}
              className="text-runmate-orange hover:text-runmate-600 font-medium transition-colors"
            >
              Visa alla →
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => scroll(membersScrollRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 p-2 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={() => scroll(membersScrollRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 p-2 rounded-full shadow-sm hover:shadow-md transition-all"
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-shrink-0 w-72"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                    {/* Profile Image */}
                    <div className="relative h-48">
                      {member.profilePicture ? (
                        <img 
                          src={member.profilePicture} 
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-4xl font-bold text-gray-400">
                            {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Rating badge */}
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-runmate-orange fill-current" />
                          <span className="text-sm font-medium">{member.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {member.firstName} {member.lastName?.charAt(0)}.
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {member.location || 'Stockholm'}
                      </p>

                      {/* Stats */}
                      <div className="flex justify-between mb-4 text-sm">
                        <div>
                          <p className="text-gray-500">PB 10k</p>
                          <p className="font-semibold">{member.personalBests?.['10k'] || '45:00'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">Vecka</p>
                          <p className="font-semibold">{member.weeklyKm || 30} km</p>
                        </div>
                      </div>

                      {/* Action button */}
                      <button 
                        onClick={() => handleMemberAction(member, 'message')}
                        className="w-full py-2.5 bg-runmate-orange text-white rounded-xl font-medium hover:bg-runmate-600 transition-colors"
                      >
                        Kontakta
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section - Minimalist Design */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Aktiva utmaningar</h2>
            <button 
              onClick={() => navigate('/app/challenges')}
              className="text-runmate-orange hover:text-runmate-600 font-medium transition-colors"
            >
              Visa alla →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {challenges.slice(0, 3).map((challenge) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-runmate-orange" />
                  <span className="text-sm text-gray-500">{challenge.daysLeft || 7} dagar kvar</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title || 'Veckans utmaning'}</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{challenge.progress || 60}% genomfört</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${challenge.progress || 60}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-runmate-orange"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/app/challenges/${challenge._id}`)}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Se detaljer
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section - Minimalist */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Kommande event</h2>
            <button 
              onClick={() => navigate('/app/runevents')}
              className="text-runmate-orange hover:text-runmate-600 font-medium transition-colors"
            >
              Visa alla →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/app/runevents/${event._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(event.date || Date.now()).toLocaleDateString('sv-SE', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-runmate-orange" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.location?.name || event.location || 'Stockholm'}
                  </p>
                  <p className="text-gray-600">
                    {event.distance || '10 km'} • {event.participants || 5} deltagare
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Skicka meddelande till {selectedMember?.firstName}
                </h3>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessage('');
                    setSelectedMember(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Skriv ditt meddelande här..."
                className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-runmate-orange focus:border-transparent"
                rows={4}
              />

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessage('');
                    setSelectedMember(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="flex-1 py-2.5 bg-runmate-orange text-white rounded-xl font-medium hover:bg-runmate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Skicka</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage; 