import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Star, 
  MessageCircle, 
  X, 
  Check,
  ChevronRight,
  Heart,
  MapPin,
  Clock,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [recentMatches, setRecentMatches] = useState([]);
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageModal, setMessageModal] = useState({ open: false, match: null });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [matchesRes, eventsRes, challengesRes, ratingsRes, topUsersRes] = await Promise.all([
        api.get('/users/matches'),
        api.get('/runevents'),
        api.get('/challenges/my-challenges'),
        api.get('/ratings/my-stats'),
        api.get('/users/leaderboard?limit=5')
      ]);

      setRecentMatches(matchesRes.data.matches || []);
      setEvents(eventsRes.data.events || []);
      setChallenges(challengesRes.data.challenges || []);
      setUserRating(ratingsRes.data);
      setTopUsers(topUsersRes.data.users || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = (match) => {
    setMessageModal({ open: true, match });
  };

  const handleRejectMatch = async (matchId) => {
    try {
      await api.delete(`/users/matches/${matchId}`);
      setRecentMatches(prev => prev.filter(m => m.id !== matchId));
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !messageModal.match) return;
    
    try {
      await api.post('/chat/message', {
        recipientId: messageModal.match.userId,
        message: message.trim()
      });
      
      setMessageModal({ open: false, match: null });
      setMessage('');
      navigate('/app/matches');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">RunMate</h1>
          <p className="text-sm text-gray-600 mt-1">Välkommen {user?.firstName}!</p>
        </div>
      </div>

      {/* Recent Matches Section */}
      <div className="p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div 
            onClick={() => navigate('/app/matches')}
            className="p-4 cursor-pointer hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-orange-500" />
                <h2 className="text-lg font-semibold">Löparkompis</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            
            {recentMatches.length > 0 ? (
              <div className="space-y-3">
                {recentMatches.slice(0, 3).map((match) => (
                  <div key={match.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={match.profilePicture || '/default-avatar.png'} 
                        alt={match.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{match.name}</p>
                        <p className="text-sm text-gray-600">{match.pace} min/km</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectMatch(match.id);
                        }}
                        className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                      >
                        <X className="w-5 h-5 text-red-600" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptMatch(match);
                        }}
                        className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                      >
                        <Check className="w-5 h-5 text-green-600" />
                      </motion.button>
                    </div>
                  </div>
                ))}
                
                {recentMatches.length > 3 && (
                  <p className="text-sm text-orange-500 text-center pt-2">
                    +{recentMatches.length - 3} fler matchningar
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Inga nya matchningar</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Events Section - Horizontal Scroll */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Event</h2>
          <button 
            onClick={() => navigate('/app/events')}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            Alla
          </button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {events.map((event) => (
            <motion.div
              key={event._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/app/events/${event._id}`)}
              className="flex-shrink-0 w-72 bg-white rounded-xl shadow-md p-4 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-100 rounded-lg p-3">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {new Date(event.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {event.location}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {event.time}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {event.participants?.length || 0} deltagare
                </span>
                <span className="text-sm font-medium text-orange-500">
                  Gå med →
                </span>
              </div>
            </motion.div>
          ))}
          
          {events.length === 0 && (
            <div className="flex-shrink-0 w-72 bg-gray-100 rounded-xl p-8 flex items-center justify-center">
              <p className="text-gray-500">Inga event tillgängliga</p>
            </div>
          )}
        </div>
      </div>

      {/* Challenges Section */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Utmaningar</h2>
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge._id}
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate(`/app/challenges/${challenge._id}`)}
              className="bg-white rounded-xl shadow-md p-4 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold">{challenge.name}</h3>
                    <p className="text-sm text-gray-600">
                      {challenge.progress}% genomfört
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${challenge.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Rating Section */}
      <div className="px-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">Ditt betyg</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-6 h-6 ${i < Math.floor(userRating?.averageRating || 0) ? 'fill-yellow-300 text-yellow-300' : 'text-white/50'}`} 
                  />
                ))}
              </div>
              <p className="text-2xl font-bold">{userRating?.averageRating?.toFixed(1) || '0.0'}</p>
              <p className="text-sm opacity-90">{userRating?.totalRatings || 0} omdömen</p>
            </div>
            <Award className="w-16 h-16 text-white/20" />
          </div>
        </motion.div>
      </div>

      {/* Top Users Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Topplista</h2>
          <button 
            onClick={() => navigate('/app/leaderboard')}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            Se alla
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {topUsers.map((topUser, index) => (
            <div 
              key={topUser._id}
              className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                  ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'}`}>
                  {index + 1}
                </div>
                <img 
                  src={topUser.profilePicture || '/default-avatar.png'} 
                  alt={topUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{topUser.firstName} {topUser.lastName?.charAt(0)}.</p>
                  <p className="text-sm text-gray-600">{topUser.totalDistance?.toFixed(0) || 0} km</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-orange-500">{topUser.points || 0}</p>
                <p className="text-xs text-gray-600">poäng</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {messageModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setMessageModal({ open: false, match: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={messageModal.match?.profilePicture || '/default-avatar.png'} 
                  alt={messageModal.match?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">Skicka meddelande</h3>
                  <p className="text-sm text-gray-600">till {messageModal.match?.name}</p>
                </div>
              </div>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Skriv ett meddelande..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                autoFocus
              />
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setMessageModal({ open: false, match: null })}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
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

export default DashboardPage; 