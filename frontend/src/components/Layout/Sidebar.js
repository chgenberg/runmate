import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  TrendingUp, 
  MessageCircle, 
  Trophy, 
  MapPin, 
  Activity,
  Heart,
  Settings,
  Star,
  Users,
  Calendar,
  Brain,
  LogOut,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/app/dashboard', name: 'Översikt', icon: Home },
    { path: '/app/profile', name: 'Profil', icon: User },
    { path: '/app/activities', name: 'Aktiviteter', icon: Activity },
    { path: '/app/leaderboard', name: 'Topplista', icon: Trophy },
    { path: '/app/statistics', name: 'Statistik', icon: TrendingUp },
    { path: '/app/challenges', name: 'Utmaningar', icon: Star },
    { path: '/app/discover', name: 'Upptäck', icon: Search },
    { path: '/app/matches', name: 'Matcha', icon: Heart },
    { path: '/app/messages', name: 'Meddelanden', icon: MessageCircle },
    { path: '/app/community', name: 'Community', icon: Users },
    { path: '/app/events', name: 'Event', icon: Calendar },
    { path: '/app/runevents', name: 'Löp-events', icon: MapPin },
    { path: '/app/ai-coach', name: 'AI Coach', icon: Brain },
    { path: '/app/settings', name: 'Inställningar', icon: Settings },
  ];

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:flex flex-col h-full bg-white border-r border-gray-200 w-64"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <img 
          src="/logo.png" 
          alt="RunMate" 
          className="h-10"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDx0ZXh0IHg9IjEwIiB5PSIyOCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NGIE1lZGl1bScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiNlNTc1NGQiPgogICAgUnVuTWF0ZQogIDwvdGV4dD4KPC9zdmc+';
          }}
        />
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=e5754d&color=fff`}
            alt={user?.firstName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              @{user?.username}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-runmate-orange text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium">Logga ut</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar; 