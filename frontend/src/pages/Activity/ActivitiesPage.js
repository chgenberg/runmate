import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon,
  ClockIcon,
  MapPinIcon,
  FireIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
  PlusIcon,
  TrophyIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ActivitiesPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalTime: 0,
    avgPace: '0:00',
    totalCalories: 0
  });

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [filter, sortBy]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/activities?filter=${filter}&sort=${sortBy}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Demo data
      setActivities([
        {
          id: 1,
          type: 'run',
          distance: 8.2,
          duration: 42,
          pace: '5:07',
          calories: 520,
          date: '2024-01-15',
          time: '07:30',
          route: 'Morgonrunda Djurgården',
          heartRate: 145,
          elevation: 85,
          weather: 'Soligt, 18°C'
        },
        {
          id: 2,
          type: 'run',
          distance: 5.5,
          duration: 28,
          pace: '5:05',
          calories: 350,
          date: '2024-01-14',
          time: '18:00',
          route: 'Kvällsjogg Hagaparken',
          heartRate: 142,
          elevation: 45,
          weather: 'Molnigt, 15°C'
        },
        {
          id: 3,
          type: 'run',
          distance: 12.1,
          duration: 65,
          pace: '5:22',
          calories: 780,
          date: '2024-01-13',
          time: '09:00',
          route: 'Långpass Kungsholmen',
          heartRate: 138,
          elevation: 120,
          weather: 'Regn, 12°C'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/activities/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalDistance: 142.5,
        totalTime: 720,
        avgPace: '5:15',
        totalCalories: 8420
      });
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Alla', icon: ChartBarIcon },
    { value: 'week', label: 'Denna vecka', icon: CalendarIcon },
    { value: 'month', label: 'Denna månad', icon: CalendarIcon },
    { value: 'running', label: 'Löpning', icon: PlayIcon },
    { value: 'personal-best', label: 'Personbästa', icon: TrophyIcon }
  ];

  const sortOptions = [
    { value: 'date', label: 'Datum' },
    { value: 'distance', label: 'Distans' },
    { value: 'pace', label: 'Tempo' },
    { value: 'duration', label: 'Tid' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'run': return PlayIcon;
      case 'bike': return BoltIcon;
      default: return PlayIcon;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'run': return 'orange';
      case 'bike': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mina Aktiviteter</h1>
              <p className="text-sm text-gray-600 mt-1">
                {activities.length} aktiviteter registrerade
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
              </motion.button>
              
              <Link to="/app/log-activity">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Ny aktivitet</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="container-app py-4 space-y-4">
              {/* Filter Pills */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Filter</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilter(option.value)}
                        className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                          filter === option.value
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Sortera efter</p>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortBy(option.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        sortBy === option.value
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-app py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <MapPinIcon className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="stat-value">{stats.totalDistance}</p>
            <p className="stat-label">Kilometer</p>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="stat-value">{Math.floor(stats.totalTime / 60)}</p>
            <p className="stat-label">Timmar</p>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <BoltIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-gray-500">Snitt</span>
            </div>
            <p className="stat-value">{stats.avgPace}</p>
            <p className="stat-label">Min/km</p>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <FireIcon className="w-5 h-5 text-red-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="stat-value">{stats.totalCalories}</p>
            <p className="stat-label">Kalorier</p>
          </div>
    Footprints, ChevronRight, Repeat, Target, MapPin, Mountain, 
    Plus, Navigation, Calendar, Timer, TrendingUp,
    Zap, Award, Filter, Activity
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ActivitiesLoader } from '../../components/Layout/LoadingSpinner';

const formatPace = (secondsPerKm) => {
  if (!secondsPerKm) return 'N/A';
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

const ActivityFeedItem = ({ activity, index }) => {
    const icons = {
        recovery: { icon: Repeat, color: 'from-green-400 to-emerald-600', bg: 'from-green-100 to-emerald-100' },
        interval: { icon: Target, color: 'from-red-400 to-rose-600', bg: 'from-red-100 to-rose-100' },
        long: { icon: MapPin, color: 'from-blue-400 to-indigo-600', bg: 'from-blue-100 to-indigo-100' },
        hill: { icon: Mountain, color: 'from-orange-400 to-amber-600', bg: 'from-orange-100 to-amber-100' },
        tempo: { icon: Zap, color: 'from-purple-400 to-violet-600', bg: 'from-purple-100 to-violet-100' },
        race: { icon: Award, color: 'from-yellow-400 to-amber-600', bg: 'from-yellow-100 to-amber-100' }
    };
    
    const activityConfig = icons[activity.activityType] || { 
        icon: Footprints, 
        color: 'from-gray-400 to-gray-600', 
        bg: 'from-gray-100 to-gray-200' 
    };
    const Icon = activityConfig.icon;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link to={`/app/activities/${activity._id}`}>
                <motion.div 
                    className="group relative bg-white rounded-2xl p-6 mb-4 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* Background decoration */}
                    <div className={`absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br ${activityConfig.bg} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700`} />
                    
                    <div className="relative flex items-center">
                        {/* Activity Type Icon */}
                        <motion.div 
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activityConfig.color} flex items-center justify-center mr-4 shadow-lg`}
                            whileHover={{ rotate: 5 }}
                        >
                            <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        {/* Activity Info */}
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{activity.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(activity.startTime).toLocaleDateString('sv-SE', { 
                                        weekday: 'short', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Timer className="w-4 h-4" />
                                    {Math.floor(activity.duration / 60)} min
                                </div>
                            </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="text-right mr-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {activity.distance.toFixed(1)} 
                                <span className="text-sm font-normal text-gray-500 ml-1">km</span>
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                                {formatPace(activity.averagePace)}
                            </div>
                        </div>
                        
                        {/* Arrow */}
                        <motion.div
                            className="text-gray-400 group-hover:text-gray-600 transition-colors"
                            animate={{ x: 0 }}
                            whileHover={{ x: 5 }}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </motion.div>
                    </div>
                    
                    {/* Progress bar for completed percentage if available */}
                    {activity.completionRate && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Genomförande</span>
                                <span>{activity.completionRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div 
                                    className={`h-2 rounded-full bg-gradient-to-r ${activityConfig.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${activity.completionRate}%` }}
                                    transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>
            </Link>
        </motion.div>
    );
};

const ActivitiesPage = () => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('date_desc');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/activities');
                setActivities(response.data);
            } catch (error) {
                toast.error("Kunde inte hämta aktiviteter.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const filteredAndSortedActivities = useMemo(() => {
        let filtered = activities;
        if (filter !== 'all') {
            filtered = activities.filter(a => a.activityType === filter);
        }

        return [...filtered].sort((a, b) => {
            switch (sort) {
                case 'date_asc': return new Date(a.startTime) - new Date(b.startTime);
                case 'distance_desc': return b.distance - a.distance;
                case 'distance_asc': return a.distance - b.distance;
                case 'pace_asc': return a.averagePace - b.averagePace;
                case 'pace_desc': return b.averagePace - a.averagePace;
                default: return new Date(b.startTime) - new Date(a.startTime); // date_desc
            }
        });
    }, [activities, filter, sort]);

    // Calculate stats
    const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
    const totalTime = activities.reduce((sum, a) => sum + a.duration, 0);
    const totalActivities = activities.length;
    const avgPace = totalTime > 0 ? (totalTime / totalDistance) / 60 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10" />
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-sm rounded-full mb-4 border border-primary/20"
                        >
                            <Activity className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-sm font-semibold text-primary">Din träningshistorik</span>
                        </motion.div>
                        
                        <h1 className="text-5xl font-black text-gray-900 mb-4">
                            Mina Aktiviteter
                        </h1>
                        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                            Spåra din utveckling och se din kompletta träningshistorik
                        </p>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-4 mb-16"
                    >
                        <button 
                            onClick={() => toast.info('GPS-spårning kommer snart!')}
                            className="group relative inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <Navigation className="w-5 h-5" />
                            <span>GPS Spårning</span>
                        </button>
                        <Link to="/app/log-activity">
                            <motion.button 
                                className="group relative inline-flex items-center gap-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Plus className="w-5 h-5" />
                                <span>Logga Pass</span>
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 -mt-8 relative z-10"
                >
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                        <div className="relative bg-white backdrop-blur-xl rounded-2xl p-6 border border-blue-100 shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {totalDistance.toFixed(1)} km
                            </div>
                            <div className="text-sm font-medium text-gray-600">Total distans</div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                        <div className="relative bg-white backdrop-blur-xl rounded-2xl p-6 border border-purple-100 shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {totalActivities}
                            </div>
                            <div className="text-sm font-medium text-gray-600">Aktiviteter</div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                        <div className="relative bg-white backdrop-blur-xl rounded-2xl p-6 border border-orange-100 shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4 shadow-lg">
                                <Timer className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {formatPace(avgPace)}
                            </div>
                            <div className="text-sm font-medium text-gray-600">Genomsnittlig fart</div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Filter and Sort Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Dina träningspass</h2>
                        <motion.button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Filter className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Filter & Sortering</span>
                            <motion.div
                                animate={{ rotate: showFilters ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronRight className="w-4 h-4 text-gray-400 transform rotate-90" />
                            </motion.div>
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="filter" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Filtrera efter typ
                                            </label>
                                            <select 
                                                id="filter" 
                                                value={filter} 
                                                onChange={e => setFilter(e.target.value)} 
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            >
                                                <option value="all">Alla typer</option>
                                                <option value="long">Långpass</option>
                                                <option value="interval">Intervall</option>
                                                <option value="tempo">Tempo</option>
                                                <option value="hill">Backe</option>
                                                <option value="recovery">Återhämtning</option>
                                                <option value="race">Tävling</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="sort" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Sortera efter
                                            </label>
                                            <select 
                                                id="sort" 
                                                value={sort} 
                                                onChange={e => setSort(e.target.value)} 
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            >
                                                <option value="date_desc">Datum (Nyast först)</option>
                                                <option value="date_asc">Datum (Äldst först)</option>
                                                <option value="distance_desc">Distans (Längst först)</option>
                                                <option value="distance_asc">Distans (Kortast först)</option>
                                                <option value="pace_asc">Fart (Snabbast först)</option>
                                                <option value="pace_desc">Fart (Långsammast först)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Activities List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {isLoading ? (
                        <ActivitiesLoader />
                    ) : filteredAndSortedActivities.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {filteredAndSortedActivities.map((activity, index) => (
                                <ActivityFeedItem key={activity._id} activity={activity} index={index} />
                            ))}
                        </AnimatePresence>
                    ) : filter !== 'all' ? (
                        <motion.div 
                            className="text-center p-24 bg-white rounded-2xl shadow-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <Filter className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Inga aktiviteter hittades</h3>
                            <p className="text-lg text-gray-600 mb-6">Inga aktiviteter matchade ditt filter.</p>
                            <motion.button
                                onClick={() => setFilter('all')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Visa alla aktiviteter
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            className="text-center p-24 bg-white rounded-2xl shadow-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <Footprints className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Inga aktiviteter än</h3>
                            <p className="text-lg text-gray-600 mb-6">Du har inte loggat några aktiviteter än. Börja spåra din träning idag!</p>
                            <Link to="/app/log-activity">
                                <motion.button
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Plus className="w-5 h-5" />
                                    Logga ditt första pass
                                </motion.button>
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ActivitiesPage; 