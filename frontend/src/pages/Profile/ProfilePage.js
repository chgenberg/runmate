import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  User, 
  MapPin, 
  Activity,
  Save,
  X,
  Plus,
  Edit3,
  Target,
  Trash2,
  Star,
  Trophy,
  Calendar,
  TrendingUp,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api, { getProfilePictureUrl } from '../../services/api';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';
import UserRatingProfile from '../../components/Rating/UserRatingProfile';

const ProfilePage = () => {
  const { user: authUser, updateProfile } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    age: '',
    location: '',
    sports: [],
    activityLevel: '',
    preferredTimes: [],
    goals: '',
    personalBests: {
      '5k': '',
      '10k': '',
      'halfMarathon': '',
      'marathon': ''
    },
    stats: {
      totalRuns: 0,
      totalDistance: 0,
      totalTime: 0,
      averagePace: '0:00'
    }
  });

  const [photos, setPhotos] = useState([]);

  const activityLevels = [
    { id: 'beginner', name: 'Nybörjare', desc: '1-2 gånger per vecka', color: 'from-green-400 to-green-600' },
    { id: 'recreational', name: 'Rekreation', desc: '3-4 gånger per vecka', color: 'from-blue-400 to-blue-600' },
    { id: 'serious', name: 'Seriös', desc: '5+ gånger per vecka', color: 'from-purple-400 to-purple-600' },
    { id: 'competitive', name: 'Tävling', desc: 'Daglig träning', color: 'from-red-400 to-red-600' },
    { id: 'elite', name: 'Elit', desc: 'Professionell', color: 'from-yellow-400 to-yellow-600' }
  ];

  const timeOptions = [
    { id: 'early-morning', name: 'Tidig morgon', time: '05:00-07:00', icon: '🌅' },
    { id: 'morning', name: 'Morgon', time: '07:00-10:00', icon: '☀️' },
    { id: 'afternoon', name: 'Eftermiddag', time: '12:00-16:00', icon: '🌤️' },
    { id: 'evening', name: 'Kväll', time: '17:00-21:00', icon: '🌙' }
  ];

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Hämta användarens fullständiga profil från backend
      const [profileResponse, statsResponse] = await Promise.allSettled([
        api.get('/users/profile'),
        api.get('/users/stats/summary')
      ]);
      
      const userData = profileResponse.status === 'fulfilled' ? profileResponse.value.data : null;
      const statsData = statsResponse.status === 'fulfilled' ? statsResponse.value.data : null;
      
      console.log('Loaded user profile:', userData);
      console.log('Loaded user stats:', statsData);
      
      if (!userData) {
        throw new Error('Kunde inte hämta användardata');
      }
      
      // Beräkna ålder från dateOfBirth
      const age = userData.dateOfBirth ? 
        Math.floor((new Date() - new Date(userData.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 
        null;
      
      // Använd verklig statistik från statsData eller fallback till userData
      const realStats = statsData?.data?.stats || {};
      
      // Formatera data för komponenten
      const formattedUser = {
        ...userData,
        age: age ? age.toString() : '',
        location: userData.location?.city || '',
        personalBests: {
          '5k': userData.trainingStats?.bestTimes?.fiveK ? 
            formatTimeFromSeconds(userData.trainingStats.bestTimes.fiveK) : '',
          '10k': userData.trainingStats?.bestTimes?.tenK ? 
            formatTimeFromSeconds(userData.trainingStats.bestTimes.tenK) : '',
          'halfMarathon': userData.trainingStats?.bestTimes?.halfMarathon ? 
            formatTimeFromSeconds(userData.trainingStats.bestTimes.halfMarathon) : '',
          'marathon': userData.trainingStats?.bestTimes?.marathon ? 
            formatTimeFromSeconds(userData.trainingStats.bestTimes.marathon) : ''
        },
        stats: {
          totalRuns: realStats.totalActivities || userData.trainingStats?.totalRuns || 0,
          totalDistance: Math.round(realStats.totalDistance || userData.trainingStats?.totalDistance || 0),
          totalTime: Math.round((realStats.totalTime || userData.trainingStats?.totalTime || 0) / 3600), // Convert to hours
          averagePace: realStats.avgPace ? formatTimeFromSeconds(realStats.avgPace * 60) : 
                      (userData.trainingStats?.averagePace || '0:00')
        },
        preferredTimes: userData.trainingPreferences?.preferredTimes || [],
        goals: userData.goals || '',
        sports: userData.sportTypes || ['running']
      };
      
      setUser(formattedUser);
      setProfileData(formattedUser);
      
      // Hantera foton
      if (userData.profilePhoto) {
        setPhotos([userData.profilePhoto, ...(userData.additionalPhotos || [])]);
      } else if (userData.additionalPhotos?.length > 0) {
        setPhotos(userData.additionalPhotos);
      }
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Kunde inte ladda profil');
      
      // Fallback med AuthContext-data om API misslyckas
      if (authUser) {
        const fallbackUser = {
          firstName: authUser.firstName || '',
          lastName: authUser.lastName || '',
          email: authUser.email || '',
          bio: authUser.bio || '',
          age: authUser.age ? authUser.age.toString() : '',
          location: authUser.location?.city || '',
          sports: authUser.sportTypes || ['running'],
          activityLevel: authUser.activityLevel || 'recreational',
          preferredTimes: authUser.trainingPreferences?.preferredTimes || [],
          goals: '',
          personalBests: {
            '5k': '',
            '10k': '',
            'halfMarathon': '',
            'marathon': ''
          },
          stats: {
            totalRuns: 0,
            totalDistance: 0,
            totalTime: 0,
            averagePace: '0:00'
          }
        };
        setUser(fallbackUser);
        setProfileData(fallbackUser);
      }
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const formatTimeFromSeconds = (seconds) => {
    if (!seconds || seconds === 0) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Uppdatera profil via API
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        location: profileData.location,
      };
      
      const result = await updateProfile(updateData);
      
      if (result.success) {
        setUser(profileData);
        setEditing(false);
        // Förhindra duplicerade toast-meddelanden med unik ID
        toast.success('Profil uppdaterad!', {
          id: 'profile-save-success',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Kunde inte uppdatera profil', {
        id: 'profile-save-error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos([...photos, e.target.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const toggleTime = (timeId) => {
    const newTimes = profileData.preferredTimes.includes(timeId)
      ? profileData.preferredTimes.filter(t => t !== timeId)
      : [...profileData.preferredTimes, timeId];
    setProfileData({ ...profileData, preferredTimes: newTimes });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <LoadingSpinner 
          variant="pulse" 
          size="xl" 
          text="Laddar din profil..." 
        />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Översikt', icon: User },
    { id: 'photos', label: 'Foton', icon: Camera },
    { id: 'stats', label: 'Statistik', icon: Trophy },
    { id: 'training', label: 'Träning', icon: Activity },
    { id: 'ratings', label: 'Betyg', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-90"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative container mx-auto px-4 pt-16 pb-24">
          <div className="flex items-center justify-between mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Min Profil
            </motion.h1>
            
            {editing ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-white/90 transition-all flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Spara</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all flex items-center space-x-2"
              >
                <Edit3 className="w-5 h-5" />
                <span>Redigera</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="p-6 md:p-8 pt-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <img
                  src={getProfilePictureUrl(user) || photos[0] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
                {editing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-all">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 md:mt-0">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center justify-center md:justify-start space-x-4 mt-2 text-gray-600">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </span>
                  <span>•</span>
                  <span>{user.age} år</span>
                </div>
                
                {/* Quick Stats - Focus on Distance & Points */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{profileData.stats.totalDistance}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">km totalt</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{user.points || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Poäng</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{profileData.stats.totalRuns}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Löppass</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{profileData.stats.averagePace}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Snitt-tempo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 space-y-6"
            >
              {/* Bio */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Om mig</h3>
                {editing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all resize-none"
                    placeholder="Berätta lite om dig själv..."
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">{profileData.bio}</p>
                )}
              </div>

              {/* Goals */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-orange-500" />
                  Mina mål
                </h3>
                {editing ? (
                  <textarea
                    value={profileData.goals}
                    onChange={(e) => setProfileData({ ...profileData, goals: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all resize-none"
                    placeholder="Vad vill du uppnå med din träning?"
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">{profileData.goals}</p>
                )}
              </div>

              {/* Personal Bests */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-orange-500" />
                  Personliga rekord
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {Object.entries(profileData.personalBests).map(([distance, time]) => (
                    <div key={distance} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 md:p-4 text-center">
                      <p className="text-xs md:text-sm text-gray-600 mb-1 truncate">
                        {distance === 'halfMarathon' ? 'Halvmara' : distance.toUpperCase()}
                      </p>
                      <p className="text-lg md:text-xl font-bold text-gray-900 truncate">{time || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Mina foton</h3>
                  <p className="text-sm text-gray-600">{photos.length}/6 foton</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      {editing && (
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Huvudfoto
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {editing && photos.length < 6 && (
                    <motion.label 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
                    >
                      <Plus className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Lägg till foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </motion.label>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 space-y-6"
            >
              {/* Activity Overview */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Aktivitetsöversikt</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <Activity className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold mb-1">{profileData.stats.totalDistance} km</p>
                    <p className="text-blue-100">Total distans</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <Calendar className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold mb-1">{profileData.stats.totalRuns}</p>
                    <p className="text-green-100">Antal pass</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold mb-1">{profileData.stats.averagePace}</p>
                    <p className="text-purple-100">Snittempo/km</p>
                  </div>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Utmärkelser</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { icon: '🏃', title: '100 pass' },
                    { icon: '🏆', title: 'PB 5K' },
                    { icon: '🔥', title: 'Streak 30' },
                    { icon: '🌟', title: 'Top löpare' },
                    { icon: '💪', title: '500 km' },
                    { icon: '🎯', title: 'Måluppfyllare' }
                  ].map((badge, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center text-2xl mb-2 mx-auto">
                        {badge.icon}
                      </div>
                      <p className="text-xs text-gray-600">{badge.title}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'training' && (
            <motion.div
              key="training"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 space-y-6"
            >
              {/* Activity Level */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Träningsnivå</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activityLevels.map((level) => (
                    <motion.button
                      key={level.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => editing && setProfileData({ ...profileData, activityLevel: level.id })}
                      disabled={!editing}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        profileData.activityLevel === level.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!editing && profileData.activityLevel !== level.id ? 'opacity-50' : ''}`}
                    >
                      {profileData.activityLevel === level.id && (
                        <div className="absolute top-3 right-3">
                          <Check className="w-6 h-6 text-orange-500" />
                        </div>
                      )}
                      <div className={`w-16 h-16 bg-gradient-to-br ${level.color} rounded-full mb-4 mx-auto`} />
                      <h4 className="font-semibold text-gray-900">{level.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{level.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Preferred Times */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Föredragna träningstider</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {timeOptions.map((time) => (
                    <motion.button
                      key={time.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => editing && toggleTime(time.id)}
                      disabled={!editing}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        profileData.preferredTimes.includes(time.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!editing ? 'cursor-default' : ''}`}
                    >
                      <div className="text-2xl mb-2">{time.icon}</div>
                      <h4 className="font-semibold text-gray-900">{time.name}</h4>
                      <p className="text-xs text-gray-600">{time.time}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ratings' && (
            <motion.div
              key="ratings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <UserRatingProfile userId={user.id || '6854fe50b7a8e3befa884139'} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
  };
  
export default ProfilePage; 