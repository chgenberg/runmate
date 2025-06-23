import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Activity, Star, Heart, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { getFullImageUrl } from '../../services/api';

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/public/${userId}`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to mock data
      setUser(generateMockUser());
    } finally {
      setLoading(false);
    }
  };

  const generateMockUser = () => ({
    _id: userId,
    firstName: 'Emma',
    lastName: 'Johansson',
    profilePicture: `https://ui-avatars.com/api/?name=Emma+Johansson&background=random&size=400`,
    location: 'Stockholm',
    pace: '5:30',
    bio: 'Passionerad löpare som älskar att utforska nya rutter och träffa nya träningskompisar. Tränar för mitt första marathon!',
    rating: 4.8,
    totalRuns: 156,
    weeklyGoal: 30,
    totalDistance: 1250,
    favoriteActivities: ['Löpning', 'Trail', 'Intervaller'],
    achievements: [
      { icon: '🏃', title: 'Första 10K', date: '2023-05-15' },
      { icon: '🏆', title: 'Halvmarathon', date: '2023-09-20' },
      { icon: '⭐', title: '100 träningspass', date: '2023-11-01' }
    ],
    stats: {
      avgPace: '5:30',
      longestRun: '21.1 km',
      weeklyAvg: '25 km',
      totalTime: '156 timmar'
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Användaren hittades inte</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka</span>
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
          >
            Gå med & matcha
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Cover Section */}
          <div className="relative h-64 bg-gradient-to-r from-orange-400 to-red-400">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end space-x-6">
                <img 
                  src={getFullImageUrl(user.profilePicture || user.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'User')}+${encodeURIComponent(user.lastName || '')}&size=200&background=random`}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    if (!e.target.src.includes('ui-avatars.com')) {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'User')}+${encodeURIComponent(user.lastName || '')}&size=200&background=random`;
                    }
                  }}
                />
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center space-x-4 text-white/90">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {user.location}
                    </span>
                    <span className="flex items-center">
                      <Activity className="w-4 h-4 mr-1" />
                      {user.pace} min/km
                    </span>
                    {user.rating && (
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {user.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{user.totalDistance || 0}km</p>
              <p className="text-sm text-gray-500">Total distans</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{user.points || '6850'}</p>
              <p className="text-sm text-gray-500">Poäng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{user.totalRuns}</p>
              <p className="text-sm text-gray-500">Träningspass</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{user.stats?.avgPace || user.pace}</p>
              <p className="text-sm text-gray-500">Snitt-tempo</p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-3">Om mig</h2>
            <p className="text-gray-600 leading-relaxed">{user.bio}</p>
          </div>

          {/* Activities */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-3">Favoritaktiviteter</h2>
            <div className="flex flex-wrap gap-2">
              {user.favoriteActivities?.map((activity, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-medium"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>

          {/* Achievements */}
          {user.achievements && user.achievements.length > 0 && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-3">Prestationer</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <p className="font-medium text-gray-900">{achievement.title}</p>
                      <p className="text-sm text-gray-500">{new Date(achievement.date).toLocaleDateString('sv-SE')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="p-8 bg-gradient-to-r from-orange-50 to-red-50 text-center">
            <h3 className="text-2xl font-bold mb-3">Vill du träna med {user.firstName}?</h3>
            <p className="text-gray-600 mb-6">Gå med i RunMate för att matcha och börja träna tillsammans!</p>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold text-lg transform transition-all hover:scale-105 hover:shadow-lg"
            >
              <Heart className="w-6 h-6 mr-2" />
              Skapa konto & matcha
            </button>
          </div>
        </motion.div>

        {/* Similar Users */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Fler löpare i {user.location}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate('/')}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=User${idx}&background=random`}
                    alt="User"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">Användare {idx}</p>
                    <p className="text-sm text-gray-500">{user.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  };
  
export default PublicProfilePage; 