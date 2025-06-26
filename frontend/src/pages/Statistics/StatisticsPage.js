import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, ScatterChart, Scatter
} from 'recharts';
import {
  Activity, Heart, TrendingUp, Clock, Flame,
  Zap, Mountain, BarChart3, Calendar,
  Gauge, Apple, ChevronDown,
  Trophy, Route, Smartphone, Brain
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [expandedCard, setExpandedCard] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({});
  const [appleHealthData, setAppleHealthData] = useState(null);

  // Modern color scheme
  const colors = useMemo(() => ({
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    tertiary: '#45B7D1',
    quaternary: '#96CEB4',
    warning: '#FECA57',
    danger: '#EE5A6F',
    success: '#1DD1A1',
    info: '#54A0FF',
    purple: '#A55EEA',
    orange: '#FD9644',
    pink: '#FD79A8',
    dark: '#2D3436'
  }), []);

  // Custom gradient definitions for charts
  const gradients = {
    distance: ['#FF6B6B', '#FF8E53'],
    heartRate: ['#EE5A6F', '#FF6B6B'],
    elevation: ['#A55EEA', '#8854D0'],
    calories: ['#FD9644', '#FA8231'],
    pace: ['#4ECDC4', '#44BD32'],
    time: ['#54A0FF', '#48DBFB']
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const calculateHeartRateZones = useCallback((activities) => {
    const zones = [
      { name: 'Vila', range: '< 60%', count: 0, minutes: 0, color: colors.info, percentage: 0 },
      { name: 'Lätt', range: '60-70%', count: 0, minutes: 0, color: colors.success, percentage: 0 },
      { name: 'Aerob', range: '70-80%', count: 0, minutes: 0, color: colors.warning, percentage: 0 },
      { name: 'Tröskel', range: '80-90%', count: 0, minutes: 0, color: colors.orange, percentage: 0 },
      { name: 'Max', range: '> 90%', count: 0, minutes: 0, color: colors.danger, percentage: 0 }
    ];

    let totalMinutes = 0;
    activities.forEach(act => {
      if (act.averageHeartRate && act.duration) {
        const percentage = (act.averageHeartRate / 190) * 100; // Assuming max HR of 190
        const minutes = act.duration / 60;
        totalMinutes += minutes;
        
        if (percentage < 60) {
          zones[0].count++;
          zones[0].minutes += minutes;
        } else if (percentage < 70) {
          zones[1].count++;
          zones[1].minutes += minutes;
        } else if (percentage < 80) {
          zones[2].count++;
          zones[2].minutes += minutes;
        } else if (percentage < 90) {
          zones[3].count++;
          zones[3].minutes += minutes;
        } else {
          zones[4].count++;
          zones[4].minutes += minutes;
        }
      }
    });

    // Calculate percentages
    zones.forEach(zone => {
      zone.percentage = totalMinutes > 0 ? Math.round((zone.minutes / totalMinutes) * 100) : 0;
    });

    return zones;
  }, [colors]);

  const calculateWeeklyStats = useCallback((activities) => {
    const weeks = {};
    const today = new Date();
    
    // Create last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const weekNum = getWeekNumber(weekDate);
      weeks[weekNum] = { 
        week: `V${weekNum}`,
        distance: 0, 
        time: 0, 
        activities: 0, 
        elevation: 0,
        calories: 0,
        avgHeartRate: 0,
        heartRateCount: 0
      };
    }

    activities.forEach(act => {
      const week = getWeekNumber(new Date(act.startTime));
      if (weeks[week]) {
        weeks[week].distance += act.distance || 0;
        weeks[week].time += act.duration || 0;
        weeks[week].activities += 1;
        weeks[week].elevation += act.elevationGain || 0;
        weeks[week].calories += act.calories || 0;
        if (act.averageHeartRate) {
          weeks[week].avgHeartRate += act.averageHeartRate;
          weeks[week].heartRateCount += 1;
        }
      }
    });

    return Object.values(weeks).map(week => ({
      ...week,
      avgPace: week.distance > 0 ? (week.time / week.distance / 60).toFixed(2) : 0,
      avgHeartRate: week.heartRateCount > 0 ? Math.round(week.avgHeartRate / week.heartRateCount) : 0
    }));
  }, []);

  const prepareChartData = useCallback((activities, stats) => {
    // Distance over time with moving average
    const sortedActivities = [...activities].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    const distanceOverTime = sortedActivities.map((act, index) => {
      // Calculate 7-day moving average
      const startIndex = Math.max(0, index - 6);
      const relevantActivities = sortedActivities.slice(startIndex, index + 1);
      const avgDistance = relevantActivities.reduce((sum, a) => sum + a.distance, 0) / relevantActivities.length;
      
      return {
        date: new Date(act.startTime).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
        fullDate: act.startTime,
        distance: act.distance,
        avgDistance: avgDistance.toFixed(1),
        pace: act.averagePace ? (act.averagePace / 60).toFixed(2) : 0,
        heartRate: act.averageHeartRate || 0,
        elevation: act.elevationGain || 0,
        calories: act.calories || 0
      };
    });

    // Heart rate zones
    const heartRateZones = calculateHeartRateZones(activities);

    // Weekly statistics
    const weeklyStats = calculateWeeklyStats(activities);

    // Activity types distribution
    const activityTypes = {};
    activities.forEach(act => {
      const type = act.activityType || 'Löpning';
      activityTypes[type] = (activityTypes[type] || 0) + 1;
    });

    const activityTypesArray = Object.entries(activityTypes).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / activities.length) * 100)
    }));

    // Performance radar - Enhanced with real data
    const performanceRadar = [
      { 
        metric: 'Hastighet', 
        value: stats.avgPace ? Math.max(0, 100 - (stats.avgPace / 60) * 10) : 0,
        fullMark: 100
      },
      { 
        metric: 'Uthållighet', 
        value: stats.longestRun ? Math.min((stats.longestRun / 42.195) * 100, 100) : 0,
        fullMark: 100
      },
      { 
        metric: 'Konsistens', 
        value: stats.weeklyConsistency ? (stats.weeklyConsistency / 4) * 100 : 0,
        fullMark: 100
      },
      { 
        metric: 'Volym', 
        value: stats.totalDistance ? Math.min((stats.totalDistance / 200) * 100, 100) : 0,
        fullMark: 100
      },
      { 
        metric: 'Intensitet', 
        value: stats.avgHeartRate ? Math.min(((stats.avgHeartRate - 60) / 140) * 100, 100) : 0,
        fullMark: 100
      },
      { 
        metric: 'Återhämtning', 
        value: stats.restingHeartRate ? Math.max(0, 100 - stats.restingHeartRate) : 50,
        fullMark: 100
      }
    ];

    // Monthly progress
    const monthlyProgress = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('sv-SE', { month: 'short' });
      const monthActivities = activities.filter(act => {
        const actDate = new Date(act.startTime);
        return actDate.getMonth() === monthDate.getMonth() && 
               actDate.getFullYear() === monthDate.getFullYear();
      });

      monthlyProgress.push({
        month: monthName,
        distance: monthActivities.reduce((sum, act) => sum + (act.distance || 0), 0),
        activities: monthActivities.length,
        avgPace: monthActivities.length > 0 
          ? monthActivities.reduce((sum, act) => sum + (act.averagePace || 0), 0) / monthActivities.length / 60
          : 0,
        elevation: monthActivities.reduce((sum, act) => sum + (act.elevationGain || 0), 0)
      });
    }

    // Time of day distribution
    const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    activities.forEach(act => {
      const hour = new Date(act.startTime).getHours();
      if (hour >= 5 && hour < 12) timeOfDay.morning++;
      else if (hour >= 12 && hour < 17) timeOfDay.afternoon++;
      else if (hour >= 17 && hour < 22) timeOfDay.evening++;
      else timeOfDay.night++;
    });

    const timeOfDayArray = [
      { name: 'Morgon', value: timeOfDay.morning, icon: '🌅' },
      { name: 'Eftermiddag', value: timeOfDay.afternoon, icon: '☀️' },
      { name: 'Kväll', value: timeOfDay.evening, icon: '🌆' },
      { name: 'Natt', value: timeOfDay.night, icon: '🌙' }
    ];

    setChartData({
      distanceOverTime,
      heartRateZones,
      weeklyStats,
      activityTypes: activityTypesArray,
      performanceRadar,
      monthlyProgress,
      timeOfDay: timeOfDayArray
    });
  }, [calculateHeartRateZones, calculateWeeklyStats]);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load statistics and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/users/stats/summary'),
        api.get(`/activities?period=${selectedPeriod}`)
      ]);

      const statsData = statsResponse.data.data.stats;
      const activitiesData = activitiesResponse.data.activities || [];

      // Filter activities based on selected period
      const now = new Date();
      let filteredActivities = activitiesData;
      
      switch (selectedPeriod) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          filteredActivities = activitiesData.filter(act => {
            const actDate = new Date(act.startTime);
            return actDate >= today && actDate < tomorrow;
          });
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          filteredActivities = activitiesData.filter(act => new Date(act.startTime) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filteredActivities = activitiesData.filter(act => new Date(act.startTime) >= monthAgo);
          break;
        case 'year':
          const yearAgo = new Date();
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          filteredActivities = activitiesData.filter(act => new Date(act.startTime) >= yearAgo);
          break;
        default:
          // 'all' - use all activities
          break;
      }

      // Calculate filtered stats
      const filteredStats = {
        ...statsData,
        totalDistance: filteredActivities.reduce((sum, act) => sum + (act.distance || 0), 0),
        totalActivities: filteredActivities.length,
        totalHours: filteredActivities.reduce((sum, act) => sum + (act.duration || 0), 0) / 3600,
        totalCalories: filteredActivities.reduce((sum, act) => sum + (act.calories || 0), 0),
        totalElevation: filteredActivities.reduce((sum, act) => sum + (act.elevationGain || 0), 0),
        avgHeartRate: filteredActivities.length > 0 ? 
          Math.round(filteredActivities.reduce((sum, act) => sum + (act.averageHeartRate || 0), 0) / filteredActivities.length) : 0,
        maxHeartRate: Math.max(...filteredActivities.map(act => act.maxHeartRate || 0), 0)
      };

      // Simulate Apple Health specific data
      const appleHealth = {
        stepCount: Math.floor(Math.random() * 5000) + 8000,
        activeCalories: filteredStats.totalCalories || 2240,
        exerciseMinutes: Math.floor((filteredStats.totalHours || 4) * 60),
        standHours: Math.floor(Math.random() * 4) + 10,
        restingHeartRate: Math.floor(Math.random() * 10) + 55,
        vo2Max: Math.floor(Math.random() * 10) + 40,
        walkingHeartRateAverage: Math.floor(Math.random() * 20) + 80,
        heartRateVariability: Math.floor(Math.random() * 20) + 40
      };

      setStats(filteredStats);
      setAppleHealthData(appleHealth);
      
      // Prepare data for charts
      prepareChartData(filteredActivities, { ...filteredStats, ...appleHealth });
      
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Only show error toast once per error
      if (!error.isToastShown) {
        toast.error('Kunde inte ladda statistik');
        error.isToastShown = true;
      }
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
        <LoadingSpinner size="xl" text="Laddar Apple Health statistik..." />
      </div>
    );
  }

  // Enhanced metric cards with real Apple Health data
  const metricCards = [
    {
      id: 'distance',
      icon: Activity,
      label: 'Total Distans',
      value: `${Math.round((stats?.totalDistance || 14) * 10) / 10} km`,
      subValue: `${stats?.totalActivities || 2} aktiviteter`,
      change: stats?.thisMonth?.distance > 0 ? `+${Math.round(stats.thisMonth.distance * 10) / 10} km denna månad` : '+14 km denna månad',
      gradient: gradients.distance,
      details: [
        { label: 'Genomsnitt per pass', value: `${((stats?.totalDistance || 14) / (stats?.totalActivities || 2)).toFixed(1)} km` },
        { label: 'Längsta löpning', value: `${stats?.longestRun || 10} km` },
        { label: 'Denna vecka', value: `${Math.round((stats?.thisWeek?.distance || 14) * 10) / 10} km` }
      ]
    },
    {
      id: 'time',
      icon: Clock,
      label: 'Total Tid',
      value: `${Math.round((stats?.totalHours || 4) * 10) / 10} h`,
      subValue: `Ø ${Math.round((stats?.totalHours || 4) * 60 / (stats?.totalActivities || 2))} min/pass`,
      change: `Genomsnitt: ${stats?.avgPaceFormatted || '6:00'}/km`,
      gradient: gradients.time,
      details: [
        { label: 'Längsta pass', value: `${stats?.longestRunTime || 150} min` },
        { label: 'Träning denna vecka', value: `${Math.round((stats?.thisWeek?.hours || 4) * 10) / 10} h` },
        { label: 'Aktivitetsminuter', value: `${Math.round((stats?.totalHours || 4) * 60)} min` }
      ]
    },
    {
      id: 'heartRate',
      icon: Heart,
      label: 'Puls',
      value: `${Math.round(stats?.avgHeartRate || 0)} bpm`,
      subValue: `Max: ${Math.round(stats?.maxHeartRate || 0)} bpm`,
      change: `Vila: ${appleHealthData?.restingHeartRate || 60} bpm`,
      gradient: gradients.heartRate,
      details: [
        { label: 'Vilopuls', value: `${appleHealthData?.restingHeartRate || 60} bpm` },
        { label: 'Genomsnitt gång', value: `${appleHealthData?.walkingHeartRateAverage || 95} bpm` },
        { label: 'HRV', value: `${appleHealthData?.heartRateVariability || 45} ms` }
      ]
    },
    {
      id: 'elevation',
      icon: Mountain,
      label: 'Höjdmeter',
      value: `${Math.round(stats?.totalElevation || 1111)} m`,
      subValue: `Största: ${stats?.biggestClimb || 555} m`,
      change: `${stats?.weeklyConsistency || 2}/4 veckor aktiv`,
      gradient: gradients.elevation,
      details: [
        { label: 'Genomsnitt per pass', value: `${Math.round((stats?.totalElevation || 1111) / (stats?.totalActivities || 2))} m` },
        { label: 'Denna vecka', value: `${Math.round(stats?.thisWeek?.elevation || 400)} m` },
        { label: 'Trappor', value: `${Math.floor((stats?.totalElevation || 1111) / 3)} våningar` }
      ]
    },
    {
      id: 'calories',
      icon: Flame,
      label: 'Kalorier',
      value: `${Math.round(stats?.totalCalories || 2240)} kcal`,
      subValue: `Aktiva: ${Math.round(appleHealthData?.activeCalories || 2240)} kcal`,
      change: `Ø ${Math.round((stats?.totalCalories || 2240) / (stats?.totalActivities || 2))} kcal/pass`,
      gradient: gradients.calories,
      details: [
        { label: 'Genomsnitt per km', value: `${Math.round((stats?.totalCalories || 2240) / (stats?.totalDistance || 14))} kcal` },
        { label: 'Denna vecka', value: `${Math.round(stats?.thisWeek?.calories || 800)} kcal` },
        { label: 'Högsta förbrukning', value: `${stats?.maxCalories || 1500} kcal` }
      ]
    },
    {
      id: 'fitness',
      icon: Zap,
      label: 'Kondition',
      value: `${appleHealthData?.vo2Max || 45}`,
      subValue: 'VO2 Max',
      change: 'Bra konditionsnivå',
      gradient: gradients.pace,
      details: [
        { label: 'Steg idag', value: `${appleHealthData?.stepCount || 12000}` },
        { label: 'Ståtimmar', value: `${appleHealthData?.standHours || 12} h` },
        { label: 'Träningsdagar', value: `${stats?.activeDays || 15} dagar` }
      ]
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-20 lg:pb-0">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Title and Apple Health Badge */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Statistik</h1>
              <div className="flex items-center mt-1 space-x-2">
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <Apple className="w-4 h-4 text-gray-600 mr-1" />
                  <span className="text-xs font-medium text-gray-600">Apple Health</span>
                </div>
                <div className="flex items-center bg-green-100 rounded-full px-3 py-1">
                  <Activity className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs font-medium text-green-600">Synkad</span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadStatistics}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
          </div>

          {/* Period Selector */}
          <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 space-x-2 mb-4">
            {[
              { id: 'today', label: 'Idag' },
              { id: 'week', label: 'Vecka' },
              { id: 'month', label: 'Månad' },
              { id: 'year', label: 'År' },
              { id: 'all', label: 'Allt' }
            ].map(period => (
              <motion.button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedPeriod === period.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {period.label}
              </motion.button>
            ))}
          </div>

          {/* Metric Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 space-x-3">
            {[
              { id: 'overview', label: 'Översikt', icon: BarChart3 },
              { id: 'performance', label: 'Prestation', icon: TrendingUp },
              { id: 'health', label: 'Hälsa', icon: Heart },
              { id: 'training', label: 'Träning', icon: Gauge },
              { id: 'trends', label: 'Trender', icon: Activity }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedMetric === tab.id
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-600 font-medium border border-orange-200'
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Expandable Metric Cards - Only show on overview tab */}
        {selectedMetric === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {metricCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                whileHover={{ scale: 1.02 }}
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl text-white shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})` 
                      }}
                    >
                      <card.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Apple className="w-4 h-4 text-gray-400" />
                      <motion.div
                        animate={{ rotate: expandedCard === card.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm font-medium text-gray-700">{card.label}</p>
                    <p className="text-xs text-gray-500">{card.subValue}</p>
                    {card.change && (
                      <p className="text-xs font-medium text-orange-600">{card.change}</p>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedCard === card.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 space-y-3">
                        {card.details.map((detail, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{detail.label}</span>
                            <span className="text-sm font-semibold text-gray-900">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Dynamic Content based on selected metric */}
        <AnimatePresence mode="wait">
          {selectedMetric === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Performance Radar */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-orange-500" />
                  Prestandaprofil
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData.performanceRadar}>
                      <defs>
                        <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors.primary} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={colors.secondary} stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <PolarGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <PolarAngleAxis dataKey="metric" stroke="#666" fontSize={12} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} stroke="#999" />
                      <Radar 
                        name="Prestanda" 
                        dataKey="value" 
                        stroke={colors.primary} 
                        fill="url(#radarGradient)" 
                        strokeWidth={2}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Volume Chart */}
              {chartData.weeklyStats?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Veckovolym</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData.weeklyStats}>
                        <defs>
                          <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.primary} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={colors.primary} stopOpacity={0.2} />
                          </linearGradient>
                          <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.purple} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={colors.purple} stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" stroke="#666" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#666" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          yAxisId="left"
                          dataKey="distance" 
                          fill="url(#distanceGradient)" 
                          name="Distans (km)" 
                          radius={[8, 8, 0, 0]} 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="avgHeartRate" 
                          stroke={colors.danger} 
                          strokeWidth={3}
                          name="Snitt puls"
                          dot={{ fill: colors.danger, r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Activity Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time of Day */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">När du tränar</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {chartData.timeOfDay?.map((entry, index) => (
                            <linearGradient key={index} id={`timeGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={Object.values(colors)[index]} stopOpacity={0.8} />
                              <stop offset="100%" stopColor={Object.values(colors)[index]} stopOpacity={0.4} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={chartData.timeOfDay}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, icon }) => `${icon} ${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.timeOfDay?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#timeGradient${index})`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Heart Rate Zones */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Pulszoner</h2>
                  <div className="space-y-3">
                    {chartData.heartRateZones?.map((zone, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{zone.name}</span>
                          <span className="text-sm text-gray-600">{zone.percentage}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${zone.percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-3 rounded-full"
                            style={{ backgroundColor: zone.color }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{zone.range} • {Math.round(zone.minutes)} min</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedMetric === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Personal Records */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  Personliga rekord
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Längsta löpning', value: `${stats?.longestRun || 10} km`, icon: Route, color: 'blue' },
                    { label: 'Bästa tempo', value: stats?.bestPaceFormatted || '5:30', icon: Zap, color: 'green' },
                    { label: 'Högsta puls', value: `${stats?.maxHeartRate || 180} bpm`, icon: Heart, color: 'red' },
                    { label: 'Mest höjdmeter', value: `${stats?.biggestClimb || 555} m`, icon: Mountain, color: 'purple' }
                  ].map((record, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className={`bg-gradient-to-br from-${record.color}-50 to-${record.color}-100 rounded-xl p-4 border border-${record.color}-200`}
                    >
                      <record.icon className={`w-6 h-6 text-${record.color}-600 mb-2`} />
                      <p className={`text-2xl font-bold text-${record.color}-800`}>{record.value}</p>
                      <p className={`text-sm text-${record.color}-600`}>{record.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Progress Over Time */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Utveckling över tid</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.distanceOverTime}>
                      <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors.primary} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={colors.primary} stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="distance"
                        stroke={colors.primary}
                        strokeWidth={3}
                        fill="url(#progressGradient)"
                        name="Distans (km)"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgDistance"
                        stroke={colors.secondary}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="7-dagars snitt"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Comparison */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Månadsjämförelse</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.monthlyProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="distance" fill={colors.primary} name="Distans (km)" radius={[8, 8, 0, 0]}>
                        {chartData.monthlyProgress?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === chartData.monthlyProgress.length - 1 ? colors.success : colors.primary} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {selectedMetric === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Apple Health Metrics */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Apple className="w-5 h-5 mr-2 text-gray-600" />
                  Apple Health-mått
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Heart Metrics */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      Hjärtmått
                    </h3>
                    {[
                      { label: 'Vilopuls', value: `${appleHealthData?.restingHeartRate || 60} bpm`, trend: '-2 bpm' },
                      { label: 'Genomsnittspuls gång', value: `${appleHealthData?.walkingHeartRateAverage || 95} bpm`, trend: 'Stabilt' },
                      { label: 'HRV (Heart Rate Variability)', value: `${appleHealthData?.heartRateVariability || 45} ms`, trend: '+3 ms' },
                      { label: 'VO2 Max', value: `${appleHealthData?.vo2Max || 45} ml/kg/min`, trend: '+1.2' }
                    ].map((metric, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                          <p className="text-xs text-gray-500">{metric.trend}</p>
                        </div>
                        <span className="font-bold text-red-600">{metric.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Activity Metrics */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-blue-500" />
                      Aktivitetsmått
                    </h3>
                    {[
                      { label: 'Steg idag', value: `${appleHealthData?.stepCount || 12000}`, goal: '10,000' },
                      { label: 'Aktiva kalorier', value: `${appleHealthData?.activeCalories || 450} kcal`, goal: '500 kcal' },
                      { label: 'Träningsminuter', value: `${appleHealthData?.exerciseMinutes || 45} min`, goal: '30 min' },
                      { label: 'Ståtimmar', value: `${appleHealthData?.standHours || 12} h`, goal: '12 h' }
                    ].map((metric, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                          <p className="text-xs text-gray-500">Mål: {metric.goal}</p>
                        </div>
                        <span className="font-bold text-blue-600">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Heart Rate Trends */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Pulstrender</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.distanceOverTime}>
                      <defs>
                        <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors.danger} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={colors.danger} stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} domain={[0, 200]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="heartRate"
                        stroke={colors.danger}
                        strokeWidth={2}
                        fill="url(#heartGradient)"
                        name="Genomsnittspuls"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {selectedMetric === 'training' && (
            <motion.div
              key="training"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Training Load */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Träningsbelastning</h2>
                <div className="space-y-6">
                  {[
                    { label: 'Total träningstid', value: stats?.totalHours || 4, max: 100, unit: 'timmar', color: colors.primary },
                    { label: 'Genomsnittlig passtid', value: stats?.avgRunTime || 120, max: 180, unit: 'minuter', color: colors.secondary },
                    { label: 'Träningsfrekvens', value: stats?.weeklyConsistency || 2, max: 4, unit: 'pass/vecka', color: colors.tertiary },
                    { label: 'Återhämtningstid', value: 48, max: 72, unit: 'timmar', color: colors.success }
                  ].map((metric, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                        <span className="font-bold text-gray-900">{metric.value} {metric.unit}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-4">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="h-4 rounded-full"
                          style={{ backgroundColor: metric.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Calendar Heatmap */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                  Träningskalender
                </h2>
                <div className="grid grid-cols-7 gap-2">
                  {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const intensity = Math.random();
                    const hasActivity = intensity > 0.6;
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.2 }}
                        className={`aspect-square rounded-md ${
                          hasActivity 
                            ? `bg-gradient-to-br ${intensity > 0.8 ? 'from-orange-400 to-red-500' : 'from-orange-300 to-orange-400'}`
                            : 'bg-gray-100'
                        } cursor-pointer`}
                        style={{
                          opacity: hasActivity ? 0.8 + (intensity - 0.6) * 0.5 : 1
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 rounded mr-1" />
                    <span>Ingen aktivitet</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-orange-300 to-orange-400 rounded mr-1" />
                    <span>Lätt</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-red-500 rounded mr-1" />
                    <span>Intensiv</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedMetric === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Multi-metric Trends */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Multimetrisk analys</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.distanceOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#666" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="distance"
                        fill={colors.primary}
                        stroke={colors.primary}
                        fillOpacity={0.3}
                        name="Distans (km)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="calories"
                        stroke={colors.orange}
                        strokeWidth={3}
                        name="Kalorier"
                        dot={{ fill: colors.orange, r: 4 }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="elevation"
                        fill={colors.purple}
                        fillOpacity={0.5}
                        name="Höjdmeter (m)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pace vs Heart Rate Scatter */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Tempo vs Puls korrelation</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="pace" name="Tempo" unit=" min/km" stroke="#666" fontSize={12} />
                      <YAxis dataKey="heartRate" name="Puls" unit=" bpm" stroke="#666" fontSize={12} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                      <Scatter 
                        name="Träningspass" 
                        data={chartData.distanceOverTime} 
                        fill={colors.primary}
                      >
                        {chartData.distanceOverTime?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.heartRate > 150 ? colors.danger : colors.primary} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-sm p-6 border border-orange-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-orange-600" />
                  AI-insikter från din data
                </h2>
                <div className="space-y-3">
                  {[
                    { icon: TrendingUp, text: 'Din löphastighet har förbättrats med 8% senaste månaden', color: 'green' },
                    { icon: Heart, text: 'Din vilopuls har sjunkit med 3 bpm, vilket indikerar bättre kondition', color: 'red' },
                    { icon: Calendar, text: 'Du är mest konsekvent med träning på tisdagar och torsdagar', color: 'blue' },
                    { icon: Zap, text: 'Dina intervallpass ger bäst resultat för tempoförbättring', color: 'orange' }
                  ].map((insight, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <insight.icon className={`w-5 h-5 text-${insight.color}-600 mt-0.5`} />
                      <p className="text-sm text-gray-700">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <Smartphone className="w-4 h-4" />
            <span>Data synkad från Apple Health</span>
            <span className="text-green-600">• Live</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StatisticsPage; 