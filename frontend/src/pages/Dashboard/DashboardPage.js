import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  Mountain,
  Plus,
  Target,
  Trophy,
  Users,
  Award,
  Activity,
  Star,
  ArrowUp,
  ArrowDown,
  Wind,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import moment from 'moment';
import 'moment/locale/sv'; // for Swedish locale
import { DashboardLoader } from '../../components/Layout/LoadingSpinner';
import PendingRatings from '../../components/Rating/PendingRatings';
import UserRatingProfile from '../../components/Rating/UserRatingProfile';

// Helper function to format time from seconds
const formatPace = (secondsPerKm) => {
  if (!secondsPerKm || secondsPerKm === 0) return 'N/A';
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

const formatDuration = (seconds) => {
  if (!seconds) return '0h 0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const formatDateRelative = (date) => {
    moment.locale('sv');
    return moment(date).fromNow();
};

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Optionally, set an error state to show in the UI
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  const stats = timePeriod === 'weekly' ? dashboardData?.weeklyStats : dashboardData?.monthlyStats;
  const user = dashboardData?.user;

  if (isLoading || !dashboardData || !user) {
    return <DashboardLoader />;
  }

  const Header = () => (
    <div className="relative mb-8">
      {/* Modern gradient background with animated elements */}
      <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-3xl p-8 lg:p-12 text-white shadow-2xl overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            {/* Left side - Welcome section */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                  alt={user.firstName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-white/30 shadow-xl"
                />
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black mb-1">
                    Hej, {user.firstName}! <span className="inline-block animate-bounce">👋</span>
                  </h1>
                  <p className="text-lg text-white/90">Redo att krossa nya löparmål?</p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Level Card */}
                <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <Trophy className="w-8 h-8 text-yellow-300 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Nivå</span>
                    </div>
                    <p className="text-4xl font-black text-white">{user.level}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-xs text-white/70">65%</span>
                    </div>
                  </div>
                </div>
                
                {/* Points Card */}
                <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <Star className="w-8 h-8 text-blue-300 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Poäng</span>
                    </div>
                    <p className="text-4xl font-black text-white">{user.points}</p>
                    <p className="text-xs text-white/70 mt-2">+25 denna vecka</p>
                  </div>
                </div>
                
                {/* Rating Card */}
                <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-8 h-8 text-green-300 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Betyg</span>
                    </div>
                    <UserRatingProfile userId={user._id} compact={true} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Action buttons */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              <Link to="/app/log-activity" className="group relative overflow-hidden bg-white text-gray-900 px-6 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 group-hover:text-white" />
                  <span className="group-hover:text-white transition-colors duration-300">Logga pass</span>
                </div>
              </Link>
              <Link to="/app/discover" className="group relative overflow-hidden bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-4 rounded-2xl font-bold hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Hitta partner</span>
                </div>
              </Link>
              <Link to="/app/runevents" className="group relative overflow-hidden bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-4 rounded-2xl font-bold hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Event</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-full blur-sm"></div>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, unit, color, trend }) => {
    const gradientClasses = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-emerald-500 to-green-500',
      indigo: 'from-indigo-500 to-purple-500',
      red: 'from-rose-500 to-pink-500',
      orange: 'from-orange-500 to-amber-500',
      yellow: 'from-yellow-500 to-orange-500',
    };

    const bgClasses = {
      blue: 'bg-blue-100',
      green: 'bg-emerald-100',
      indigo: 'bg-indigo-100',
      red: 'bg-rose-100',
      orange: 'bg-orange-100',
      yellow: 'bg-yellow-100',
    };

    const iconBgClasses = {
      blue: 'bg-gradient-to-br from-blue-400 to-cyan-400',
      green: 'bg-gradient-to-br from-emerald-400 to-green-400',
      indigo: 'bg-gradient-to-br from-indigo-400 to-purple-400',
      red: 'bg-gradient-to-br from-rose-400 to-pink-400',
      orange: 'bg-gradient-to-br from-orange-400 to-amber-400',
      yellow: 'bg-gradient-to-br from-yellow-400 to-orange-400',
    };

    return (
      <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
        {/* Gradient border effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        
        {/* Inner content with margin for border effect */}
        <div className="relative bg-white m-[2px] rounded-[14px] h-full">
          <div className="p-6">
            {/* Top section */}
            <div className="flex items-center justify-between mb-4">
              <div className={`relative w-14 h-14 ${iconBgClasses[color]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
              </div>
              {trend !== null && trend !== undefined && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${bgClasses[color]} ${
                  trend > 0 ? 'text-green-700' : trend < 0 ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {trend > 0 ? (
                    <>
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>+{trend}%</span>
                    </>
                  ) : trend < 0 ? (
                    <>
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>{trend}%</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                      <span>0%</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Title */}
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
            
            {/* Value */}
            <div className="flex items-baseline gap-1">
              <span className={`font-black text-gray-900 ${value && value.toString().length > 6 ? 'text-lg' : 'text-xl'}`}>
                {value}
              </span>
              {unit && <span className="text-xs font-bold text-gray-500">{unit}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const PersonalBestItem = ({ record }) => (
    <div className="group flex items-center justify-between py-4 px-4 rounded-xl hover:bg-gray-50 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
          <Trophy className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900">{record.distance}</p>
          {record.date && <p className="text-xs text-gray-500">{record.date}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-black text-gray-900 group-hover:text-amber-600 transition-colors">
          {record.time}
        </p>
      </div>
    </div>
  );

  const WeeklyGoal = () => {
    // This component is now static or needs a new data source, as weeklyGoal was removed from the backend response.
    // For now, let's disable it or show a placeholder.
    // We can re-implement this later if needed.
    return null;
    /*
    const percentage = (dashboardData.weeklyGoal.current / dashboardData.weeklyGoal.target) * 100;
    const remaining = dashboardData.weeklyGoal.target - dashboardData.weeklyGoal.current;
    
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-black text-xl text-gray-900 mb-1">Veckans Mål</h3>
            <p className="text-sm text-gray-600">Distansutmaning</p>
          </div>
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <Target className="w-7 h-7 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-end justify-between mb-3">
              <span className="text-3xl font-black text-gray-900">{dashboardData.weeklyGoal.current}</span>
              <span className="text-sm text-gray-500 mb-1">av {dashboardData.weeklyGoal.target} km</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">
              {percentage >= 100 ? '🎉 Mål uppnått!' : `${remaining.toFixed(1)} km kvar`}
            </span>
            <span className="text-green-600 font-black text-lg">{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
    */
  };

  const ActivityFeedItem = ({ activity }) => {
    const iconConfig = {
      recovery: { icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
      interval: { icon: Flame, color: 'text-red-600', bg: 'bg-red-100' },
      long: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
      hill: { icon: Mountain, color: 'text-orange-600', bg: 'bg-orange-100' },
      easy: { icon: Wind, color: 'text-sky-600', bg: 'bg-sky-100' },
      tempo: { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-100' },
      race: { icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100' },
    };
    
    const config = iconConfig[activity.activityType] || { 
      icon: Activity, 
      color: 'text-gray-600', 
      bg: 'bg-gray-100' 
    };
    const Icon = config.icon;
    
    return (
      <Link to={`/app/activity/${activity._id}`} className="group block">
        <div className="relative p-4 rounded-xl hover:bg-gray-50 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${config.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                {activity.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateRelative(activity.startTime)}
                </span>
                {activity.elevationGain && (
                  <span className="flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5" />
                    {activity.elevationGain}m
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-black text-gray-900">{activity.distance.toFixed(1)} km</p>
              <p className="text-sm font-medium text-gray-500">{formatPace(activity.averagePace)}</p>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Header />

          {/* Stats Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Dina Prestationer</h2>
                <p className="text-gray-600 mt-1 text-lg">Håll koll på din utveckling</p>
              </div>
              <div className="inline-flex bg-white rounded-2xl p-1 shadow-lg border border-gray-200">
                <button 
                  onClick={() => setTimePeriod('weekly')} 
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    timePeriod === 'weekly' 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Denna Vecka
                </button>
                <button 
                  onClick={() => setTimePeriod('monthly')} 
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    timePeriod === 'monthly' 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Denna Månad
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
              <StatCard 
                icon={Activity} 
                title="Antal Pass" 
                value={stats.runs || 0} 
                color="blue" 
                trend={stats.runs > 0 ? 12 : null} 
              />
              <StatCard 
                icon={MapPin} 
                title="Total Distans" 
                value={stats.distance ? stats.distance.toFixed(1) : "0.0"} 
                unit="km" 
                color="green" 
                trend={stats.distance > 0 ? 8 : null} 
              />
              <StatCard 
                icon={Clock} 
                title="Total Tid" 
                value={formatDuration(stats.time)} 
                color="indigo" 
                trend={stats.time > 0 ? -5 : null} 
              />
              <StatCard 
                icon={Wind} 
                title="Snittfart" 
                value={stats.pace && stats.pace > 0 ? formatPace(stats.pace).replace(' /km', '') : "-"} 
                unit={stats.pace && stats.pace > 0 ? "/km" : ""} 
                color="red" 
                trend={stats.pace > 0 ? 15 : null} 
              />
              <StatCard 
                icon={Mountain} 
                title="Höjdmeter" 
                value={stats.elevation || 0} 
                unit="m" 
                color="orange" 
                trend={stats.elevation > 0 ? 22 : null} 
              />
              <StatCard 
                icon={Flame} 
                title="Streak" 
                value={stats.streak || 0} 
                unit="dagar" 
                color="yellow" 
                trend={null} 
              />
            </div>
          </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Senaste Aktiviteterna</h3>
                            <p className="text-sm text-gray-600 mt-1">Dina senaste löppass</p>
                        </div>
                        <Link to="/app/activities" className="group flex items-center gap-2 text-gray-700 hover:text-gray-900 font-bold text-sm">
                            <span>Visa alla</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
                <div className="divide-y divide-gray-100">
                    {dashboardData.recentActivities.map(act => <ActivityFeedItem key={act._id} activity={act} />)}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Kommande Pass</h3>
                            <p className="text-sm text-gray-600 mt-1">Planerade löprundor</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    {dashboardData.upcomingRuns.length > 0 ? dashboardData.upcomingRuns.map(run => (
                        <div key={run._id} className="group relative bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={run.host.profilePhoto || `https://ui-avatars.com/api/?name=${run.host.firstName}+${run.host.lastName}&background=random`} alt={run.host.firstName} className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-md"/>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 text-lg">Löpning med {run.host.firstName}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                            <Clock className="w-4 h-4 text-gray-400"/>
                                            <span>{formatDateRelative(run.date)}</span>
                                        </span>
                                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-gray-400"/>
                                            <span>{run.location.name}</span>
                                        </span>
                                    </div>
                                </div>
                                <Link to={`/app/chat/${run.chatId}`} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transform hover:scale-105 transition-all duration-200">
                                    Chatta
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-4">Du har inga kommande pass inplanerade.</p>
                    )}
                </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PendingRatings />
            
            <WeeklyGoal />
            
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Personbästa</h3>
                            <p className="text-sm text-gray-600 mt-1">Dina snabbaste tider</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
                <div className="p-4 space-y-1">
                    {dashboardData.personalBests.map(pb => <PersonalBestItem key={pb.distance} record={pb} />)}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Utmaningar</h3>
                            <p className="text-sm text-gray-600 mt-1">Tävla och utvecklas</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                   {dashboardData.challenges.length > 0 ? dashboardData.challenges.map(ch => (
                       <div key={ch.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-300">
                           <div className="flex justify-between items-center mb-3">
                               <h4 className="font-bold text-gray-900">{ch.title}</h4>
                               <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{ch.goal}</span>
                           </div>
                           <div className="relative">
                               <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div className="bg-blue-500 h-3 rounded-full transition-all duration-700 ease-out" style={{ width: `${ch.progress}%` }}>
                                    </div>
                               </div>
                               <div className="flex justify-between items-center mt-2">
                                   <span className="text-xs text-gray-600 font-medium">{ch.progress}% slutfört</span>
                                   <span className="text-xs text-blue-600 font-bold">{ch.progress.toFixed(1)} km</span>
                               </div>
                           </div>
                       </div>
                   )) : (
                    <p className="text-center text-gray-500 py-4">Du deltar inte i några utmaningar just nu.</p>
                   )}
                </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 