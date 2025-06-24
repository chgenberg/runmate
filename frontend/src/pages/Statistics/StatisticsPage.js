import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Activity, Heart, TrendingUp, Clock,
  Zap, Mountain, BarChart3,
  Gauge, Apple
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({});

  // Färgschema för grafer
  const colors = useMemo(() => ({
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    tertiary: '#45b7d1',
    quaternary: '#96ceb4',
    warning: '#feca57',
    danger: '#ee5a6f',
    success: '#1dd1a1',
    info: '#54a0ff'
  }), []);

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const calculateHeartRateZones = useCallback((activities) => {
    const zones = [
      { name: 'Vila', range: '< 60%', count: 0, color: colors.info },
      { name: 'Lätt', range: '60-70%', count: 0, color: colors.success },
      { name: 'Aerob', range: '70-80%', count: 0, color: colors.warning },
      { name: 'Tröskel', range: '80-90%', count: 0, color: colors.primary },
      { name: 'Max', range: '> 90%', count: 0, color: colors.danger }
    ];

    activities.forEach(act => {
      if (act.averageHeartRate) {
        const percentage = (act.averageHeartRate / 190) * 100; // Assuming max HR of 190
        if (percentage < 60) zones[0].count++;
        else if (percentage < 70) zones[1].count++;
        else if (percentage < 80) zones[2].count++;
        else if (percentage < 90) zones[3].count++;
        else zones[4].count++;
      }
    });

    return zones;
  }, [colors]);

  const calculateWeeklyStats = useCallback((activities) => {
    const weeks = {};
    activities.forEach(act => {
      const week = getWeekNumber(new Date(act.startTime));
      if (!weeks[week]) {
        weeks[week] = { distance: 0, time: 0, activities: 0, elevation: 0 };
      }
      weeks[week].distance += act.distance;
      weeks[week].time += act.duration;
      weeks[week].activities += 1;
      weeks[week].elevation += act.elevationGain || 0;
    });

    return Object.entries(weeks)
      .map(([week, data]) => ({
        week: `V${week}`,
        ...data,
        avgPace: data.time > 0 ? (data.time / data.distance / 60).toFixed(2) : 0
      }))
      .slice(-8); // Last 8 weeks
  }, []);

  const prepareChartData = useCallback((activities, stats) => {
    // Distans över tid
    const distanceOverTime = activities
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .map(act => ({
        date: new Date(act.startTime).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
        distance: act.distance,
        pace: act.averagePace / 60 // Convert to minutes
      }));

    // Pulszoner
    const heartRateZones = calculateHeartRateZones(activities);

    // Veckosummering
    const weeklyStats = calculateWeeklyStats(activities);

    // Aktivitetstyper
    const activityTypes = activities.reduce((acc, act) => {
      acc[act.activityType] = (acc[act.activityType] || 0) + 1;
      return acc;
    }, {});

    // Prestandamått radar - Using REAL Apple Health data
    const performanceRadar = [
      { metric: 'Hastighet', value: stats.avgPace ? Math.max(0, 100 - (stats.avgPace / 60) * 10) : 0 },
      { metric: 'Uthållighet', value: stats.longestRun ? Math.min((stats.longestRun / 42.195) * 100, 100) : 0 },
      { metric: 'Konsistens', value: (stats.weeklyConsistency / 4) * 100 },
      { metric: 'Volym', value: stats.totalDistance ? Math.min((stats.totalDistance / 200) * 100, 100) : 0 },
      { metric: 'Intensitet', value: stats.avgHeartRate ? Math.min(((stats.avgHeartRate - 60) / 140) * 100, 100) : 0 }
    ];

    setChartData({
      distanceOverTime,
      heartRateZones,
      weeklyStats,
      activityTypes,
      performanceRadar
    });
  }, [calculateHeartRateZones, calculateWeeklyStats]);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Hämta statistik och aktiviteter parallellt
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/users/stats/summary'),
        api.get(`/activities?period=${selectedPeriod}`)
      ]);

      const statsData = statsResponse.data.data.stats;
      const activitiesData = activitiesResponse.data.activities || [];

      setStats(statsData);
      
      // Förbered data för grafer
      prepareChartData(activitiesData, statsData);
      
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Kunde inte ladda statistik');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, prepareChartData]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Laddar statistik..." />
      </div>
    );
  }

  // Real Apple Health metrics cards using actual data
  const metricCards = [
    {
      icon: Activity,
      label: 'Total Distans',
      value: `${stats?.totalDistance || 0} km`,
      subValue: `${stats?.totalActivities || 0} aktiviteter`,
      change: stats?.thisMonth?.distance > 0 ? `+${stats.thisMonth.distance} km denna månad` : '',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      isAppleHealth: true
    },
    {
      icon: Clock,
      label: 'Total Tid',
      value: `${stats?.totalHours || 0} h`,
      subValue: `Ø ${stats?.avgRunTime || 0} min/pass`,
      change: stats?.avgPaceFormatted ? `Genomsnitt: ${stats.avgPaceFormatted}` : '',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      isAppleHealth: true
    },
    {
      icon: Heart,
      label: 'Genomsnittspuls',
      value: `${stats?.avgHeartRate || 0} bpm`,
      subValue: `Max: ${stats?.maxHeartRate || 0} bpm`,
      change: stats?.totalCalories ? `${stats.totalCalories} kalorier` : '',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      isAppleHealth: true
    },
    {
      icon: Mountain,
      label: 'Höjdmeter',
      value: `${stats?.totalElevation || 0} m`,
      subValue: `Största klättring: ${stats?.biggestClimb || 0} m`,
      change: stats?.weeklyConsistency ? `${stats.weeklyConsistency}/4 veckor aktiv` : '',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      isAppleHealth: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Mobile-First Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Apple Health Statistik</h1>
              <div className="flex items-center mt-1">
                <Apple className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-500">Riktig data från hälsoappen</span>
              </div>
            </div>
          </div>

          {/* Period Selector - Mobile Scrollable */}
          <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 space-x-2 mb-4">
            {['week', 'month', 'year', 'all'].map(period => (
              <motion.button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {period === 'week' ? 'Vecka' :
                 period === 'month' ? 'Månad' :
                 period === 'year' ? 'År' : 'Allt'}
              </motion.button>
            ))}
          </div>

          {/* Metric Tabs - Mobile Scrollable */}
          <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 space-x-3">
            {[
              { id: 'overview', label: 'Översikt', icon: BarChart3 },
              { id: 'performance', label: 'Prestation', icon: TrendingUp },
              { id: 'health', label: 'Hälsa', icon: Heart },
              { id: 'training', label: 'Träning', icon: Gauge }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedMetric === tab.id
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats - Mobile Optimized Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              {/* Apple Health Badge */}
              {card.isAppleHealth && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1">
                    <Apple className="w-3 h-3 text-gray-600" />
                    <span className="text-xs text-gray-600 font-medium">Health</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.color} p-3 rounded-xl text-white shadow-lg`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-600">{card.label}</p>
                {card.subValue && (
                  <p className="text-xs text-gray-500">{card.subValue}</p>
                )}
                {card.change && (
                  <p className="text-xs text-orange-600 font-medium">{card.change}</p>
                )}
              </div>
              
              {/* Decorative gradient */}
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-gray-50 to-transparent rounded-full transform translate-x-6 translate-y-6" />
            </motion.div>
          ))}
        </div>

        {/* Main Content based on selected metric */}
        {selectedMetric === 'overview' && (
          <div className="space-y-6">
            {/* Performance Radar - Mobile Optimized */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-500" />
                Prestandaprofil från Apple Health
              </h2>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData.performanceRadar}>
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="metric" stroke="#666" fontSize={12} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                    <Radar 
                      name="Prestanda" 
                      dataKey="value" 
                      stroke={colors.primary} 
                      fill={colors.primary} 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Weekly Stats */}
            {chartData.weeklyStats?.length > 0 && (
              <motion.div 
                className="bg-white rounded-2xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Veckovolym</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="distance" fill={colors.primary} name="Distans (km)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="elevation" fill={colors.tertiary} name="Höjdmeter (m)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {selectedMetric === 'performance' && (
          <div className="space-y-6">
            {/* Personal Records from Apple Health */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Apple className="w-5 h-5 mr-2 text-gray-500" />
                Personliga rekord
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-900">Längsta löpning</h3>
                  <p className="text-2xl font-bold text-blue-800">{stats?.longestRun || 0} km</p>
                  <p className="text-sm text-blue-600">Från Apple Health</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <h3 className="font-semibold text-green-900">Bästa tempo</h3>
                  <p className="text-2xl font-bold text-green-800">{stats?.bestPaceFormatted || '0:00'}</p>
                  <p className="text-sm text-green-600">per kilometer</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-900">Genomsnittsdistans</h3>
                  <p className="text-2xl font-bold text-purple-800">{stats?.avgRunDistance || 0} km</p>
                  <p className="text-sm text-purple-600">per träningspass</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                  <h3 className="font-semibold text-orange-900">Aktiva dagar</h3>
                  <p className="text-2xl font-bold text-orange-800">{stats?.activeDays || 0}</p>
                  <p className="text-sm text-orange-600">senaste 30 dagarna</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedMetric === 'health' && (
          <div className="space-y-6">
            {/* Health Metrics from Apple Health */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Hälsomått från Apple Health
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Genomsnittspuls</span>
                    <span className="font-bold text-red-600">{stats?.avgHeartRate || 0} bpm</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Max puls</span>
                    <span className="font-bold text-red-600">{stats?.maxHeartRate || 0} bpm</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Total kalorier</span>
                    <span className="font-bold text-orange-600">{stats?.totalCalories || 0} kcal</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Konsistens</span>
                    <span className="font-bold text-blue-600">{stats?.weeklyConsistency || 0}/4 veckor</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Träning denna månad</span>
                    <span className="font-bold text-green-600">{stats?.thisMonth?.distance || 0} km</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Bästa månadstempo</span>
                    <span className="font-bold text-purple-600">{stats?.thisMonth?.bestPaceFormatted || '0:00'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedMetric === 'training' && (
          <div className="space-y-6">
            {/* Training Load */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Träningsbelastning</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Total träningstid</span>
                    <span className="font-bold text-gray-900">{stats?.totalHours || 0} timmar</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((stats?.totalHours || 0) / 100 * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Genomsnittlig passtid</span>
                    <span className="font-bold text-gray-900">{stats?.avgRunTime || 0} minuter</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((stats?.avgRunTime || 0) / 60 * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Månadsaktiviteter</span>
                    <span className="font-bold text-gray-900">{stats?.thisMonth?.activities || 0} pass</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((stats?.thisMonth?.activities || 0) / 20 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage; 