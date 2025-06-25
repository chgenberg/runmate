import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  FireIcon, 
  TrophyIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  PlayIcon,
  UserGroupIcon,
  MapPinIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalTime: 0,
    totalActivities: 0,
    currentStreak: 0,
    weeklyDistance: 0,
    weeklyGoal: 50,
    calories: 0,
    avgPace: '0:00'
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get(`/dashboard/stats?period=${selectedPeriod}`),
        api.get('/activities/recent?limit=5')
      ]);

      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set demo data
      setStats({
        totalDistance: 142.5,
        totalTime: 720,
        totalActivities: 28,
        currentStreak: 7,
        weeklyDistance: 32.4,
        weeklyGoal: 50,
        calories: 8420,
        avgPace: '5:23'
      });
      setRecentActivities([
        { id: 1, type: 'run', distance: 8.2, duration: 42, date: '2024-01-15', pace: '5:07' },
        { id: 2, type: 'run', distance: 5.5, duration: 28, date: '2024-01-14', pace: '5:05' },
        { id: 3, type: 'run', distance: 12.1, duration: 65, date: '2024-01-13', pace: '5:22' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const weeklyProgress = (stats.weeklyDistance / stats.weeklyGoal) * 100;

  const statCards = [
    {
      icon: MapPinIcon,
      label: 'Total Distans',
      value: `${stats.totalDistance}`,
      unit: 'km',
      color: 'orange',
      trend: '+12%'
    },
    {
      icon: ClockIcon,
      label: 'Total Tid',
      value: `${Math.floor(stats.totalTime / 60)}`,
      unit: 'timmar',
      color: 'blue',
      trend: '+8%'
    },
    {
      icon: FireIcon,
      label: 'Streak',
      value: stats.currentStreak,
      unit: 'dagar',
      color: 'red',
      trend: '🔥'
    },
    {
      icon: BoltIcon,
      label: 'Snitt-tempo',
      value: stats.avgPace,
      unit: 'min/km',
      color: 'yellow',
      trend: '-0:05'
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-white border-b-4 border-orange-500">
        <div className="absolute inset-0 pattern-dots opacity-5"></div>
        <div className="container-app py-8 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Hej <span className="gradient-text">{user?.name || 'Löpare'}</span>! 👋
              </h1>
              <p className="text-gray-600">Låt oss kolla hur du presterat denna vecka</p>
            </div>
            
            {/* Period Selector */}
            <div className="mt-4 md:mt-0 flex gap-2">
              {['day', 'week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedPeriod === period
                      ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {period === 'day' ? 'Idag' : 
                   period === 'week' ? 'Vecka' :
                   period === 'month' ? 'Månad' : 'År'}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-app py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="card-retro cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <span className={`text-sm font-bold text-${stat.color}-600`}>
                      {stat.trend}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold mono">{stat.value}</span>
                      <span className="text-sm text-gray-500">{stat.unit}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Weekly Goal Progress */}
            <motion.div variants={itemVariants} className="card-retro">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Veckans Mål</h2>
                <TrophyIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-bold mono">
                      {stats.weeklyDistance} / {stats.weeklyGoal} km
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(weeklyProgress)}% klart
                    </span>
                  </div>
                  <div className="progress">
                    <motion.div
                      className="progress-bar progress-striped"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                {weeklyProgress >= 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-green-100 rounded-lg"
                  >
                    <TrophyIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Grattis! Du har nått veckans mål! 🎉
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Recent Activities */}
              <motion.div variants={itemVariants} className="card-retro">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Senaste Aktiviteter</h2>
                  <Link to="/app/activities" className="text-orange-500 hover:text-orange-600 font-semibold">
                    Se alla →
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <PlayIcon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{activity.distance} km</span>
                          <span className="text-sm text-gray-500">{activity.date}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {activity.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <BoltIcon className="w-4 h-4" />
                            {activity.pace} min/km
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Snabbåtgärder</h2>
                
                <Link to="/app/log-activity">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="card-retro flex items-center gap-4 cursor-pointer group"
                  >
                    <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white group-hover:shadow-lg transition-shadow">
                      <PlayIcon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Starta Löprunda</h3>
                      <p className="text-sm text-gray-600">Börja tracka din nästa aktivitet</p>
                    </div>
                    <ChartBarIcon className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
                  </motion.div>
                </Link>

                <Link to="/app/ai-coach">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="card-retro flex items-center gap-4 cursor-pointer group"
                  >
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white group-hover:shadow-lg transition-shadow">
                      <SparklesIcon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">AI Coach</h3>
                      <p className="text-sm text-gray-600">Få personlig träningsrådgivning</p>
                    </div>
                    <ArrowTrendingUpIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </motion.div>
                </Link>

                <Link to="/app/challenges">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="card-retro flex items-center gap-4 cursor-pointer group"
                  >
                    <div className="p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl text-white group-hover:shadow-lg transition-shadow">
                      <TrophyIcon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Utmaningar</h3>
                      <p className="text-sm text-gray-600">Delta i spännande tävlingar</p>
                    </div>
                    <UserGroupIcon className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                  </motion.div>
                </Link>
              </motion.div>
            </div>

            {/* Motivational Quote */}
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white"
            >
              <div className="absolute inset-0 pattern-diagonal opacity-10"></div>
              <div className="relative z-10 text-center">
                <SparklesIcon className="w-12 h-12 mx-auto mb-4 animate-pulse-slow" />
                <h3 className="text-2xl font-bold mb-2">Dagens Motivation</h3>
                <p className="text-lg opacity-90">
                  "Varje steg framåt är en seger. Fortsätt springa, fortsätt drömma!"
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <Link to="/app/log-activity">
        <motion.button
          className="fab"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <PlayIcon className="w-6 h-6" />
        </motion.button>
      </Link>
    </div>
  );
};

export default DashboardPage; 