import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  RadarAxis, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Activity, Heart, TrendingUp, Calendar, Clock,
  Zap, Mountain, Award, Target, BarChart3,
  Timer, Footprints, Wind, Brain, Moon,
  ArrowUp, ArrowDown, Gauge, Waves
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState({});

  // Färgschema för grafer
  const colors = {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    tertiary: '#45b7d1',
    quaternary: '#96ceb4',
    warning: '#feca57',
    danger: '#ee5a6f',
    success: '#1dd1a1',
    info: '#54a0ff'
  };

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
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
      setActivities(activitiesData);
      
      // Förbered data för grafer
      prepareChartData(activitiesData, statsData);
      
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Kunde inte ladda statistik');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (activities, stats) => {
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

    // Prestandamått radar
    const performanceRadar = [
      { metric: 'Hastighet', value: stats.avgPaceFormatted ? (10 - parseFloat(stats.avgPaceFormatted)) * 10 : 0 },
      { metric: 'Uthållighet', value: stats.longestRun ? (stats.longestRun / 42.195) * 100 : 0 },
      { metric: 'Konsistens', value: (stats.weeklyConsistency / 4) * 100 },
      { metric: 'Volym', value: stats.totalDistance ? Math.min((stats.totalDistance / 200) * 100, 100) : 0 },
      { metric: 'Intensitet', value: stats.avgHeartRate ? ((stats.avgHeartRate - 60) / 140) * 100 : 0 }
    ];

    setChartData({
      distanceOverTime,
      heartRateZones,
      weeklyStats,
      activityTypes,
      performanceRadar
    });
  };

  const calculateHeartRateZones = (activities) => {
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
  };

  const calculateWeeklyStats = (activities) => {
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
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Laddar statistik..." />
      </div>
    );
  }

  const metricCards = [
    {
      icon: Activity,
      label: 'Total Distans',
      value: `${stats?.totalDistance || 0} km`,
      change: '+12%',
      color: 'bg-blue-500'
    },
    {
      icon: Clock,
      label: 'Total Tid',
      value: `${stats?.totalHours || 0} h`,
      change: '+8%',
      color: 'bg-green-500'
    },
    {
      icon: Heart,
      label: 'Genomsnittspuls',
      value: `${stats?.avgHeartRate || 0} bpm`,
      change: '-2%',
      color: 'bg-red-500'
    },
    {
      icon: Mountain,
      label: 'Höjdmeter',
      value: `${stats?.totalElevation || 0} m`,
      change: '+25%',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Statistik & Analys</h1>
            
            {/* Period Selector */}
            <div className="flex items-center space-x-2">
              {['week', 'month', 'year', 'all'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period === 'week' ? 'Vecka' :
                   period === 'month' ? 'Månad' :
                   period === 'year' ? 'År' : 'Allt'}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide mt-4 -mx-4 px-4 space-x-4">
            {[
              { id: 'overview', label: 'Översikt', icon: BarChart3 },
              { id: 'performance', label: 'Prestation', icon: TrendingUp },
              { id: 'health', label: 'Hälsa', icon: Heart },
              { id: 'training', label: 'Träningsbelastning', icon: Gauge },
              { id: 'recovery', label: 'Återhämtning', icon: Moon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedMetric === tab.id
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${
                  card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-600 mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content based on selected metric */}
        {selectedMetric === 'overview' && (
          <>
            {/* Distance & Pace Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Distans & Tempo över tid</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.distanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="distance"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.3}
                    name="Distans (km)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pace"
                    stroke={colors.secondary}
                    strokeWidth={2}
                    dot={{ fill: colors.secondary }}
                    name="Tempo (min/km)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Volume */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Veckovolym</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="distance" fill={colors.primary} name="Distans (km)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="elevation" fill={colors.tertiary} name="Höjdmeter (m)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Heart Rate Zones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Pulszoner</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.heartRateZones}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartData.heartRateZones?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Radar */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Prestandaprofil</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={chartData.performanceRadar}>
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="metric" stroke="#666" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Prestanda" 
                      dataKey="value" 
                      stroke={colors.primary} 
                      fill={colors.primary} 
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {selectedMetric === 'performance' && (
          <>
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">VO2 Max</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">52.3</p>
                <p className="text-sm text-gray-600 mt-1">ml/kg/min</p>
                <div className="mt-4 bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-green-700">Utmärkt för din ålder</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Löpekonomi</h3>
                  <Footprints className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">178</p>
                <p className="text-sm text-gray-600 mt-1">steg/min kadens</p>
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-700">Optimal kadens</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Effektivitet</h3>
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">8.2</p>
                <p className="text-sm text-gray-600 mt-1">cm vertikal oscillation</p>
                <div className="mt-4 bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">Bra löpeffektivitet</p>
                </div>
              </div>
            </div>

            {/* Progress Tracking */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Prestandautveckling</h2>
              <div className="space-y-6">
                {[
                  { label: '5K Tid', current: '19:45', best: '19:12', progress: 85 },
                  { label: '10K Tid', current: '42:30', best: '41:15', progress: 78 },
                  { label: 'Halvmaraton', current: '1:35:20', best: '1:33:45', progress: 82 },
                  { label: 'Maraton', current: '3:25:00', best: '3:22:15', progress: 75 }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <div className="text-right">
                        <span className="text-gray-900 font-semibold">{item.current}</span>
                        <span className="text-gray-500 text-sm ml-2">PB: {item.best}</span>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedMetric === 'health' && (
          <>
            {/* Health Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Heart Rate Analysis */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Pulsanalys
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Vilopuls</span>
                    <span className="font-semibold text-gray-900">48 bpm</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Max puls</span>
                    <span className="font-semibold text-gray-900">{stats?.maxHeartRate || 185} bpm</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">HRV (RMSSD)</span>
                    <span className="font-semibold text-gray-900">45 ms</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Återhämtningspuls</span>
                    <span className="font-semibold text-gray-900">32 bpm/min</span>
                  </div>
                </div>
              </div>

              {/* Recovery Metrics */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Moon className="w-5 h-5 mr-2 text-purple-500" />
                  Återhämtning
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Sömn (genomsnitt)</span>
                    <span className="font-semibold text-gray-900">7.5 h</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Djupsömn</span>
                    <span className="font-semibold text-gray-900">1.8 h</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">REM-sömn</span>
                    <span className="font-semibold text-gray-900">2.1 h</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Återhämtningspoäng</span>
                    <span className="font-semibold text-gray-900">82/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stress & Energy */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Stress & Energinivåer</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[
                  { time: '06:00', stress: 20, energy: 40 },
                  { time: '09:00', stress: 35, energy: 70 },
                  { time: '12:00', stress: 45, energy: 60 },
                  { time: '15:00', stress: 40, energy: 50 },
                  { time: '18:00', stress: 30, energy: 65 },
                  { time: '21:00', stress: 25, energy: 30 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="stress" stroke={colors.danger} name="Stress" strokeWidth={2} />
                  <Line type="monotone" dataKey="energy" stroke={colors.success} name="Energi" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {selectedMetric === 'training' && (
          <>
            {/* Training Load */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-6">Träningsbelastning (TSS)</h3>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Akut belastning (7 dagar)</span>
                  <span className="font-semibold text-gray-900">342 TSS</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-400 to-yellow-500 h-3 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Kronisk belastning (42 dagar)</span>
                  <span className="font-semibold text-gray-900">285 TSS</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Form</p>
                  <p className="text-2xl font-bold text-blue-600">+12</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Fitness</p>
                  <p className="text-2xl font-bold text-green-600">87</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Trötthet</p>
                  <p className="text-2xl font-bold text-yellow-600">75</p>
                </div>
              </div>
            </div>

            {/* Training Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Träningsfördelning</h3>
              <div className="space-y-4">
                {[
                  { zone: 'Återhämtning', percentage: 25, color: 'bg-blue-500' },
                  { zone: 'Grundträning', percentage: 45, color: 'bg-green-500' },
                  { zone: 'Tempo', percentage: 20, color: 'bg-yellow-500' },
                  { zone: 'Tröskel', percentage: 8, color: 'bg-orange-500' },
                  { zone: 'VO2 Max', percentage: 2, color: 'bg-red-500' }
                ].map((zone, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">{zone.zone}</span>
                      <span className="text-sm font-medium text-gray-900">{zone.percentage}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${zone.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${zone.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedMetric === 'recovery' && (
          <>
            {/* Recovery Score */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                Återhämtningspoäng
              </h3>
              
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    <circle 
                      cx="96" cy="96" r="88" 
                      stroke="url(#gradient)" 
                      strokeWidth="12" 
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 88 * 0.82} ${2 * Math.PI * 88}`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">82</span>
                    <span className="text-sm text-gray-600">Mycket bra</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Redo för träning</p>
                  <p className="text-lg font-semibold text-green-700">Hög intensitet OK</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Nästa vila</p>
                  <p className="text-lg font-semibold text-blue-700">Om 3 dagar</p>
                </div>
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Sömnkvalitet (senaste 7 dagar)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { day: 'Mån', total: 7.5, deep: 1.8, rem: 2.1, light: 3.6 },
                  { day: 'Tis', total: 8.2, deep: 2.0, rem: 2.3, light: 3.9 },
                  { day: 'Ons', total: 6.8, deep: 1.5, rem: 1.8, light: 3.5 },
                  { day: 'Tor', total: 7.3, deep: 1.7, rem: 2.0, light: 3.6 },
                  { day: 'Fre', total: 7.8, deep: 1.9, rem: 2.2, light: 3.7 },
                  { day: 'Lör', total: 8.5, deep: 2.1, rem: 2.4, light: 4.0 },
                  { day: 'Sön', total: 7.2, deep: 1.6, rem: 1.9, light: 3.7 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="deep" stackId="a" fill="#7c3aed" name="Djupsömn" />
                  <Bar dataKey="rem" stackId="a" fill="#3b82f6" name="REM" />
                  <Bar dataKey="light" stackId="a" fill="#60a5fa" name="Lätt sömn" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage; 