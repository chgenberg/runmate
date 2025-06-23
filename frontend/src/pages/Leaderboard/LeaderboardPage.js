import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Award, 
  Medal, 
  MapPin,
  Activity,
  Star,
  Globe,
  ChevronDown,
  X,
  Info,
  Sparkles,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dummy data för topplistan
const dummyLeaderboard = [
  {
    _id: '1',
    firstName: 'Anna',
    lastName: 'Karlsson',
    profilePhoto: null,
    points: 2850,
    level: 8,
    city: 'Stockholm',
    stats: { totalDistance: 425.5, totalRuns: 89, averagePace: 285 },
    rank: 1
  },
  {
    _id: '2',
    firstName: 'Erik',
    lastName: 'Andersson',
    profilePhoto: null,
    points: 2720,
    level: 7,
    city: 'Göteborg',
    stats: { totalDistance: 398.2, totalRuns: 82, averagePace: 295 },
    rank: 2
  },
  {
    _id: '3',
    firstName: 'Sara',
    lastName: 'Lindqvist',
    profilePhoto: null,
    points: 2650,
    level: 7,
    city: 'Stockholm',
    stats: { totalDistance: 380.1, totalRuns: 76, averagePace: 275 },
    rank: 3
  },
  {
    _id: '4',
    firstName: 'Marcus',
    lastName: 'Johansson',
    profilePhoto: null,
    points: 2480,
    level: 6,
    city: 'Malmö',
    stats: { totalDistance: 365.8, totalRuns: 71, averagePace: 305 },
    rank: 4
  },
  {
    _id: '5',
    firstName: 'Emma',
    lastName: 'Nilsson',
    profilePhoto: null,
    points: 2320,
    level: 6,
    city: 'Stockholm',
    stats: { totalDistance: 342.4, totalRuns: 68, averagePace: 290 },
    rank: 5
  },
  {
    _id: '6',
    firstName: 'Johan',
    lastName: 'Berg',
    profilePhoto: null,
    points: 2180,
    level: 5,
    city: 'Uppsala',
    stats: { totalDistance: 325.6, totalRuns: 64, averagePace: 310 },
    rank: 6
  },
  {
    _id: '7',
    firstName: 'Lisa',
    lastName: 'Holm',
    profilePhoto: null,
    points: 2050,
    level: 5,
    city: 'Göteborg',
    stats: { totalDistance: 308.2, totalRuns: 59, averagePace: 280 },
    rank: 7
  },
  {
    _id: '8',
    firstName: 'Daniel',
    lastName: 'Svensson',
    profilePhoto: null,
    points: 1950,
    level: 5,
    city: 'Stockholm',
    stats: { totalDistance: 295.1, totalRuns: 57, averagePace: 315 },
    rank: 8
  },
  {
    _id: '9',
    firstName: 'Mia',
    lastName: 'Persson',
    profilePhoto: null,
    points: 1850,
    level: 4,
    city: 'Lund',
    stats: { totalDistance: 278.5, totalRuns: 54, averagePace: 300 },
    rank: 9
  },
  {
    _id: '10',
    firstName: 'Oscar',
    lastName: 'Gustafsson',
    profilePhoto: null,
    points: 1780,
    level: 4,
    city: 'Stockholm',
    stats: { totalDistance: 265.8, totalRuns: 52, averagePace: 295 },
    rank: 10
  }
];

// Svenska kommuner
const swedishMunicipalities = [
  'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 
  'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå', 'Gävle', 'Borås', 
  'Södertälje', 'Eskilstuna', 'Halmstad', 'Växjö', 'Karlstad', 'Sundsvall',
  'Trollhättan', 'Östersund', 'Borlänge', 'Falun', 'Kalmar', 'Kristianstad',
  'Karlskrona', 'Skövde', 'Uddevalla', 'Motala'
];

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState(dummyLeaderboard);
  const [filters, setFilters] = useState({
    type: 'points', // points, level, distance
    timeframe: 'all', // week, month, all
    location: 'national' // national, local
  });
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [showPointsModal, setShowPointsModal] = useState(false);

  const formatPace = (secondsPerKm) => {
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-100' };
    if (rank === 2) return { icon: Award, color: 'text-gray-400', bg: 'bg-gray-100' };
    if (rank === 3) return { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-100' };
    return { icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-100' };
  };

  const handleMunicipalitySelect = (municipality) => {
    setSelectedMunicipality(municipality);
    setFilters(prev => ({ ...prev, location: 'local' }));
    setShowMunicipalityModal(false);
    toast.success(`Visar topplista för ${municipality}`);
    
    // Filter data för vald kommun
    const filteredData = dummyLeaderboard.filter(user => user.city === municipality);
    setLeaderboard(filteredData.length > 0 ? filteredData : dummyLeaderboard.slice(0, 3));
  };

  // Sortera data baserat på vald typ
  const sortLeaderboard = (data, type) => {
    const sorted = [...data];
    switch (type) {
      case 'points':
        return sorted.sort((a, b) => b.points - a.points);
      case 'distance':
        return sorted.sort((a, b) => b.stats.totalDistance - a.stats.totalDistance);
      default:
        return sorted.sort((a, b) => b.points - a.points);
    }
  };

  // Filtrera och sortera data
  let filteredAndSortedData = filters.location === 'local' && selectedMunicipality
    ? leaderboard.filter(user => user.city === selectedMunicipality)
    : leaderboard;
  
  filteredAndSortedData = sortLeaderboard(filteredAndSortedData, filters.type);
  
  // Uppdatera rank baserat på sortering
  const filteredLeaderboard = filteredAndSortedData.map((user, index) => ({
    ...user,
    rank: index + 1
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 mb-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black mb-2">🏆 Topplistan</h1>
              <p className="text-xl text-white/90 mb-6">Se hur du mäter dig mot andra löpare</p>
            </div>
            <div className="text-6xl">🏃‍♂️</div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Ranking baserat på</h3>
            <div className="flex gap-2">
              {[
                { key: 'points', label: 'Poäng', icon: Star },
                { key: 'distance', label: 'Distans', icon: Activity }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilters(prev => ({ ...prev, type: key }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    filters.type === key
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Område</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, location: 'national' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filters.location === 'national'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                Nationellt
              </button>
              <button
                onClick={() => setShowMunicipalityModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filters.location === 'local'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {selectedMunicipality || 'Välj kommun'}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <button
              onClick={() => setShowPointsModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl w-full"
            >
              <Info className="w-4 h-4" />
              Så fungerar poängsystemet
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-black text-gray-900">
              {filters.location === 'local' && selectedMunicipality 
                ? `Topplista - ${selectedMunicipality}` 
                : 'Nationell Topplista'
              }
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredLeaderboard.length} löpare • Sorterat efter {
                filters.type === 'points' ? 'poäng' :
                filters.type === 'distance' ? 'distans' : 'poäng'
              }
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredLeaderboard.map((runner, index) => {
              const rankConfig = getRankIcon(runner.rank);
              const Icon = rankConfig.icon;
              
              return (
                <motion.div
                  key={runner._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    
                    {/* Mobile: Rank + Profile + Primary Metric in top row */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {/* Rank */}
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={`w-10 h-10 md:w-12 md:h-12 ${rankConfig.bg} rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${rankConfig.color}`} />
                        </div>
                        <span className="text-xl md:text-2xl font-black text-gray-900 min-w-[35px] md:min-w-[50px]">
                          #{runner.rank}
                        </span>
                      </div>

                      {/* Profile */}
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <img 
                          src={runner.profilePhoto || runner.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(runner.firstName || 'User')}+${encodeURIComponent(runner.lastName || '')}&background=random`}
                          alt={runner.firstName}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover ring-2 md:ring-4 ring-white shadow-lg flex-shrink-0"
                          onError={(e) => {
                            if (!e.target.src.includes('ui-avatars.com')) {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(runner.firstName || 'User')}+${encodeURIComponent(runner.lastName || '')}&background=random`;
                            }
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base md:text-xl font-bold text-gray-900 truncate">
                            {runner.firstName} {runner.lastName}
                          </h3>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                            <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                            <span className="truncate">{runner.city}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{runner.stats.totalDistance}km totalt</span>
                          </div>
                        </div>
                      </div>

                      {/* Primary Metric - Mobile */}
                      <div className="text-right flex-shrink-0 md:hidden">
                        {filters.type === 'points' && (
                          <div>
                            <p className="text-xl font-black text-gray-900">{runner.points}</p>
                            <p className="text-xs text-gray-500 font-medium">poäng</p>
                          </div>
                        )}

                        {filters.type === 'distance' && (
                          <div>
                            <p className="text-xl font-black text-gray-900">{runner.stats.totalDistance}</p>
                            <p className="text-xs text-gray-500 font-medium">km</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats - Desktop Only */}
                    <div className="hidden md:flex items-center gap-8 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 font-medium">Distans</p>
                        <p className="text-lg font-bold text-gray-900">{runner.stats.totalDistance} km</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 font-medium">Pass</p>
                        <p className="text-lg font-bold text-gray-900">{runner.stats.totalRuns}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 font-medium">Snittfart</p>
                        <p className="text-lg font-bold text-gray-900">{formatPace(runner.stats.averagePace)}/km</p>
                      </div>
                    </div>

                    {/* Primary Metric - Desktop */}
                    <div className="hidden md:block text-right flex-shrink-0 ml-auto">
                      {filters.type === 'points' && (
                        <>
                          <p className="text-3xl font-black text-gray-900">{runner.points}</p>
                          <p className="text-sm text-gray-500 font-medium">poäng</p>
                        </>
                      )}

                      {filters.type === 'distance' && (
                        <>
                          <p className="text-3xl font-black text-gray-900">{runner.stats.totalDistance}</p>
                          <p className="text-sm text-gray-500 font-medium">km totalt</p>
                        </>
                      )}
                    </div>

                    {/* Mobile Stats Row */}
                    <div className="flex justify-between text-xs text-gray-500 md:hidden">
                      <span>{runner.points} poäng</span>
                      <span>{runner.stats.totalDistance} km totalt</span>
                      <span>{runner.stats.totalRuns} pass</span>
                      <span>{formatPace(runner.stats.averagePace)}/km</span>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Municipality Modal */}
      {showMunicipalityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">Välj kommun</h2>
                <button
                  onClick={() => setShowMunicipalityModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">Se topplistan för din kommun</p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {swedishMunicipalities.map((municipality) => (
                  <button
                    key={municipality}
                    onClick={() => handleMunicipalitySelect(municipality)}
                    className="p-3 text-left rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                      <span className="font-medium text-gray-900 group-hover:text-blue-700">
                        {municipality}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Points System Modal */}
      <AnimatePresence>
        {showPointsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black">Poängsystemet</h2>
                  </div>
                  <button
                    onClick={() => setShowPointsModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/90 mt-2">Tjäna poäng för varje träningspass</p>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Base Points */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-orange-500" />
                    Grundpoäng
                  </h3>
                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-black text-orange-600">10 poäng per kilometer</p>
                        <p className="text-gray-700 mt-1">Varje kilometer du springer ger dig 10 poäng</p>
                      </div>
                      <div className="text-5xl">🏃‍♂️</div>
                    </div>
                  </div>
                </div>
                
                {/* Distance Bonuses */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Distansbonusar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-green-50 p-4 rounded-xl border border-green-200"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🏅</div>
                        <p className="font-bold text-lg text-green-700">10K Bonus</p>
                        <p className="text-3xl font-black text-green-600 my-1">+50p</p>
                        <p className="text-sm text-gray-600">När du springer 10km+</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-blue-50 p-4 rounded-xl border border-blue-200"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🥈</div>
                        <p className="font-bold text-lg text-blue-700">Halvmaraton</p>
                        <p className="text-3xl font-black text-blue-600 my-1">+100p</p>
                        <p className="text-sm text-gray-600">När du springer 21.1km+</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-purple-50 p-4 rounded-xl border border-purple-200"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🥇</div>
                        <p className="font-bold text-lg text-purple-700">Maraton</p>
                        <p className="text-3xl font-black text-purple-600 my-1">+200p</p>
                        <p className="text-sm text-gray-600">När du springer 42.2km+</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Activity Type Multipliers */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Aktivitetstyp-multiplikatorer
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-yellow-800">Intervallträning</p>
                          <p className="text-2xl font-black text-yellow-600">1.5x poäng</p>
                        </div>
                        <div className="text-3xl">⚡</div>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-red-800">Tempolöpning</p>
                          <p className="text-2xl font-black text-red-600">1.3x poäng</p>
                        </div>
                        <div className="text-3xl">🔥</div>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-indigo-800">Backlöpning</p>
                          <p className="text-2xl font-black text-indigo-600">1.4x poäng</p>
                        </div>
                        <div className="text-3xl">⛰️</div>
                      </div>
                    </div>
                    
                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-pink-800">Tävling</p>
                          <p className="text-2xl font-black text-pink-600">2.0x poäng</p>
                        </div>
                        <div className="text-3xl">🏆</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Time Bonus */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Tidsbonus
                  </h3>
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-black text-blue-600">+30 poäng</p>
                        <p className="text-gray-700 mt-1">När ditt träningspass är längre än 1 timme</p>
                      </div>
                      <div className="text-5xl">⏱️</div>
                    </div>
                  </div>
                </div>
                
                {/* Examples */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Exempel på poängberäkning</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-semibold text-gray-900">5 km vanlig löpning</p>
                      <p className="text-gray-600">5 × 10 = <span className="font-bold text-orange-600">50 poäng</span></p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-semibold text-gray-900">10 km löpning</p>
                      <p className="text-gray-600">10 × 10 + 50 (bonus) = <span className="font-bold text-orange-600">150 poäng</span></p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-semibold text-gray-900">10 km intervallträning</p>
                      <p className="text-gray-600">150 × 1.5 = <span className="font-bold text-orange-600">225 poäng</span></p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-semibold text-gray-900">Halvmaraton tävling</p>
                      <p className="text-gray-600">(211 + 100) × 2.0 = <span className="font-bold text-orange-600">622 poäng</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardPage; 