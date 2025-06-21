import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Award, 
  Medal, 
  TrendingUp, 
  MapPin, 
  Filter,
  Calendar,
  Users,
  Target,
  Activity,
  Star,
  Globe,
  ChevronDown,
  X
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState(dummyLeaderboard);
  const [currentUserRank, setCurrentUserRank] = useState({ rank: 15, points: 1650 });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'points', // points, level, distance
    timeframe: 'all', // week, month, all
    location: 'national' // national, local
  });
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');

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
      case 'level':
        return sorted.sort((a, b) => b.level - a.level);
      case 'distance':
        return sorted.sort((a, b) => b.stats.totalDistance - a.stats.totalDistance);
      default:
        return sorted;
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
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur rounded-2xl px-6 py-3 border border-white/30">
                  <p className="text-sm text-white/80">Din position</p>
                  <p className="text-2xl font-black">#{currentUserRank.rank}</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-2xl px-6 py-3 border border-white/30">
                  <p className="text-sm text-white/80">Dina poäng</p>
                  <p className="text-2xl font-black">{currentUserRank.points}</p>
                </div>
              </div>
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
                { key: 'level', label: 'Nivå', icon: TrendingUp },
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
                filters.type === 'level' ? 'nivå' :
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
                  <div className="flex items-center gap-6">
                    
                    {/* Rank */}
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${rankConfig.bg} rounded-2xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${rankConfig.color}`} />
                      </div>
                      <span className="text-2xl font-black text-gray-900 min-w-[50px]">
                        #{runner.rank}
                      </span>
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <img 
                        src={runner.profilePhoto || `https://ui-avatars.com/api/?name=${runner.firstName}+${runner.lastName}&background=random`}
                        alt={runner.firstName}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
                      />
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-gray-900">
                          {runner.firstName} {runner.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{runner.city}</span>
                          <span>•</span>
                          <span>Nivå {runner.level}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-8">
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

                    {/* Primary Metric */}
                    <div className="text-right">
                      {filters.type === 'points' && (
                        <>
                          <p className="text-3xl font-black text-gray-900">{runner.points}</p>
                          <p className="text-sm text-gray-500 font-medium">poäng</p>
                        </>
                      )}
                      {filters.type === 'level' && (
                        <>
                          <p className="text-3xl font-black text-gray-900">Nivå {runner.level}</p>
                          <p className="text-sm text-gray-500 font-medium">{runner.points} poäng</p>
                        </>
                      )}
                      {filters.type === 'distance' && (
                        <>
                          <p className="text-3xl font-black text-gray-900">{runner.stats.totalDistance}</p>
                          <p className="text-sm text-gray-500 font-medium">km totalt</p>
                        </>
                      )}
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
    </div>
  );
};

export default LeaderboardPage; 