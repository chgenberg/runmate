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
  Activity,
  Star,
  Wind,
  Zap
} from 'lucide-react';
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
    <div className="relative mb-6">
      {/* Mobile-optimized gradient background */}
      <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-2xl p-6 text-white shadow-xl overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Welcome section */}
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=ff4757&color=fff`}
              alt={user.firstName}
              className="w-14 h-14 rounded-full object-cover ring-3 ring-white/30 shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-xl font-black">
                Hej, {user.firstName}! 👋
              </h1>
              <p className="text-sm text-white/90">Redo att krossa nya löparmål?</p>
            </div>
          </div>
          
          {/* Quick Stats - Horizontal scroll on mobile */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {/* Level Card */}
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[120px]">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-6 h-6 text-yellow-300" />
                <span className="text-xs font-bold text-white/70">NIVÅ</span>
              </div>
              <p className="text-2xl font-black text-white">{user.level}</p>
              <div className="mt-2 bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            {/* Points Card */}
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[120px]">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-6 h-6 text-blue-300" />
                <span className="text-xs font-bold text-white/70">POÄNG</span>
              </div>
              <p className="text-2xl font-black text-white">{user.points}</p>
              <p className="text-xs text-white/70 mt-1">+25 denna vecka</p>
            </div>
            
            {/* Rating Card */}
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[120px]">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 text-green-300" />
                <span className="text-xs font-bold text-white/70">BETYG</span>
              </div>
              <UserRatingProfile userId={user._id} compact={true} />
            </div>
          </div>
          
          {/* Action buttons - Horizontal on mobile */}
          <div className="flex gap-2 mt-4">
            <Link to="/app/log-activity" className="flex-1 bg-white text-gray-900 px-4 py-3 rounded-xl font-bold shadow-lg text-center">
              <Plus className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Logga pass</span>
            </Link>
            <Link to="/app/discover" className="flex-1 bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-3 rounded-xl font-bold text-center">
              <Users className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Hitta partner</span>
            </Link>
            <Link to="/app/runs" className="flex-1 bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-3 rounded-xl font-bold text-center">
              <Calendar className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Event</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, unit, color, trend }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      red: 'bg-red-50 text-red-600',
      orange: 'bg-orange-50 text-orange-600',
      yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5" strokeWidth={2.5} />
          </div>
          {trend !== null && trend !== undefined && (
            <div className={`text-xs font-bold ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend > 0 ? `↑${trend}%` : trend < 0 ? `↓${Math.abs(trend)}%` : '→'}
            </div>
          )}
        </div>
        
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-gray-900">
            {value}
          </span>
          {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
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
      <div className="p-4 pb-20"> {/* Add padding bottom for mobile nav */}
        <div className="max-w-7xl mx-auto">
          <Header />

          {/* Stats Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">Dina Prestationer</h2>
              <div className="flex bg-white rounded-lg p-0.5 shadow-sm">
                <button 
                  onClick={() => setTimePeriod('weekly')} 
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    timePeriod === 'weekly' 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-600'
                  }`}
                >
                  Vecka
                </button>
                <button 
                  onClick={() => setTimePeriod('monthly')} 
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    timePeriod === 'monthly' 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-600'
                  }`}
                >
                  Månad
                </button>
              </div>
            </div>
            
            {/* Mobile optimized stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard 
                icon={Activity} 
                title="Antal Pass" 
                value={stats.runs || 0} 
                color="blue" 
                trend={stats.runs > 0 ? 12 : null} 
              />
              <StatCard 
                icon={MapPin} 
                title="Distans" 
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