import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Zap
} from 'lucide-react';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import api from '../../services/api';

const SuperLanding = () => {
  const navigate = useNavigate();
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

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [membersRes, challengesRes, eventsRes, leaderboardRes] = await Promise.all([
        api.get('/users/public').catch(() => ({ data: { users: [] } })),
        api.get('/challenges/public').catch(() => ({ data: { challenges: [] } })),
        api.get('/runevents/upcoming').catch(() => ({ data: { events: [] } })),
        api.get('/users/leaderboard/public').catch(() => ({ data: { leaderboard: [] } }))
      ]);

      setMembers(membersRes.data.users || generateMockMembers());
      setChallenges(challengesRes.data.challenges || generateMockChallenges());
      setEvents(eventsRes.data.events || generateMockEvents());
      setLeaderboard(leaderboardRes.data.leaderboard || generateMockLeaderboard());
      
      // Mock user stats for demo
      setUserStats({
        totalKm: 156,
        nationalRank: 24,
        rating: 4.7,
        totalRatings: 38
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use mock data as fallback
      setMembers(generateMockMembers());
      setChallenges(generateMockChallenges());
      setEvents(generateMockEvents());
      setLeaderboard(generateMockLeaderboard());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const generateMockMembers = () => {
    const mockData = [
      { name: 'Emma Johansson', location: 'Stockholm', pb10k: '42:15', motivation: 'Älskar känslan efter ett långpass', activities: ['Löpning', 'Trail'] },
      { name: 'Marcus Berg', location: 'Göteborg', pb10k: '38:45', motivation: 'Tränar för mitt första maraton', activities: ['Löpning', 'Cykling'] },
      { name: 'Sara Lindqvist', location: 'Malmö', pb10k: '45:30', motivation: 'Springer för hälsan och gemenskapen', activities: ['Löpning'] },
      { name: 'Johan Nilsson', location: 'Uppsala', pb10k: '41:00', motivation: 'Jagar nya PB varje vecka!', activities: ['Löpning', 'Gym'] },
      { name: 'Anna Svensson', location: 'Lund', pb10k: '44:20', motivation: 'Löpning är min meditation', activities: ['Löpning', 'Yoga'] }
    ];

    return mockData.map((data, idx) => ({
      _id: idx.toString(),
      firstName: data.name.split(' ')[0],
      lastName: data.name.split(' ')[1],
      profilePicture: `https://ui-avatars.com/api/?name=${data.name}&background=random&size=400`,
      location: data.location,
      personalBests: { '10k': data.pb10k },
      motivation: data.motivation,
      favoriteActivities: data.activities,
      rating: 4 + Math.random(),
      weeklyKm: Math.floor(Math.random() * 50) + 20
    }));
  };

  const generateMockChallenges = () => {
    return [
      { _id: '1', title: 'Veckans Mil', participants: 156, daysLeft: 5, reward: '500 poäng' },
      { _id: '2', title: 'Oktober Marathon', participants: 89, daysLeft: 18, reward: '1000 poäng' },
      { _id: '3', title: 'Höstrusket 5K', participants: 234, daysLeft: 3, reward: '300 poäng' },
      { _id: '4', title: '100km på 30 dagar', participants: 67, daysLeft: 24, reward: '2000 poäng' }
    ];
  };

  const generateMockEvents = () => {
    const dates = [
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    ];

    return [
      { _id: '1', title: 'Morgonlöpning Djurgården', date: dates[0], participants: 8, distance: '8 km' },
      { _id: '2', title: 'Intervaller Ladugårdsgärde', date: dates[1], participants: 5, distance: '6 km' },
      { _id: '3', title: 'Långpass Haga', date: dates[2], participants: 12, distance: '15 km' }
    ];
  };

  const generateMockLeaderboard = () => {
    return [
      { _id: '1', name: 'Erik Gustafsson', location: 'Stockholm', weeklyKm: 78, avatar: 'EG' },
      { _id: '2', name: 'Maria Andersson', location: 'Göteborg', weeklyKm: 72, avatar: 'MA' },
      { _id: '3', name: 'Johan Lindberg', location: 'Malmö', weeklyKm: 68, avatar: 'JL' },
      { _id: '4', name: 'Anna Nilsson', location: 'Uppsala', weeklyKm: 65, avatar: 'AN' },
      { _id: '5', name: 'Peter Svensson', location: 'Lund', weeklyKm: 61, avatar: 'PS' }
    ];
  };

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
      // Handle like action
      console.log('Liked:', member.firstName);
    }
  };

  const sendMessage = () => {
    console.log('Sending message to:', selectedMember.firstName, message);
    setShowMessageModal(false);
    setMessage('');
    setSelectedMember(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar din löparupplevelse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 z-10"></div>
        <div className="container mx-auto px-4 pt-20 pb-12 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Din löparresa börjar
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                här och nu
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Upptäck löparkompisar, utmaningar och events i hela Sverige
            </p>
          </motion.div>
        </div>
      </div>

      {/* Members Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Upptäck löpare</h2>
              <span className="text-sm text-gray-500">({members.length}+ aktiva)</span>
            </div>
            <button 
              onClick={() => navigate('/members')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
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
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold">{member.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <ProfileAvatar 
                          user={member} 
                          size="md"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 truncate">
                            {member.firstName} {member.lastName?.charAt(0)}.
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{member.location || 'Sverige'}</span>
                          </div>
                        </div>
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
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Aktiva utmaningar</h2>
            </div>
            <button 
              onClick={() => navigate('/challenges')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
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
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">{challenge.participants} deltagare</span>
                      <span className="text-sm font-semibold text-orange-600">{challenge.reward}</span>
                    </div>
                    
                    <button className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                      Delta nu
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Kommande aktiviteter</h2>
            </div>
            <button 
              onClick={() => navigate('/activities')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
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
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
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
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{event.participants} deltagare</span>
                  <span className="text-sm font-semibold text-orange-600">{event.distance}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Veckans topplista</h2>
            </div>
            <button 
              onClick={() => navigate('/leaderboard')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              <span>Visa mer</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Your stats */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Din vecka</p>
                  <p className="text-3xl font-bold">{userStats?.totalKm || 0} km</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm mb-1">Nationell ranking</p>
                  <p className="text-2xl font-bold">#{userStats?.nationalRank || '-'}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Zap className="w-8 h-8" />
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold">
                      {runner.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{runner.name}</p>
                      <p className="text-sm text-gray-600">{runner.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{runner.weeklyKm} km</p>
                    <p className="text-sm text-gray-600">denna vecka</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rating Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 text-white text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Ditt betyg</h2>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-8 h-8 ${i < Math.floor(userStats?.rating || 0) ? 'fill-current' : ''}`} 
                />
              ))}
              <span className="text-3xl font-bold ml-2">{userStats?.rating || '4.7'}</span>
            </div>
            <p className="text-white/80">Baserat på {userStats?.totalRatings || 38} omdömen</p>
            <button 
              onClick={() => navigate('/register')}
              className="mt-6 px-8 py-3 bg-white text-orange-600 rounded-full font-bold hover:shadow-lg transition-all"
            >
              Gå med och börja springa
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
                placeholder="Skriv ditt meddelande här..."
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Skicka
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperLanding; 