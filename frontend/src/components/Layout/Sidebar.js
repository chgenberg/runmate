import React, { useState } from 'react';
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
  Search,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState(['training']);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuStructure = [
    { 
      path: '/app/dashboard', 
      name: 'Översikt', 
      icon: Home,
      single: true 
    },
    {
      id: 'training',
      name: 'Träning',
      icon: Activity,
      iconColor: 'text-sport-yellow-500',
      children: [
        { path: '/app/activities', name: 'Mina aktiviteter', icon: Zap },
        { path: '/app/statistics', name: 'Statistik', icon: BarChart3 },
        { path: '/app/ai-coach', name: 'AI Coach', icon: Brain, badge: 'NY' },
        { path: '/app/challenges', name: 'Utmaningar', icon: Star }
      ]
    },
    {
      id: 'social',
      name: 'Socialt',
      icon: Users,
      iconColor: 'text-sport-lime-500',
      children: [
        { path: '/app/discover', name: 'Upptäck löpare', icon: Search },
        { path: '/app/matches', name: 'Matcha', icon: Heart },
        { path: '/app/messages', name: 'Meddelanden', icon: MessageCircle },
        { path: '/app/community', name: 'Community', icon: Users }
      ]
    },
    {
      id: 'compete',
      name: 'Tävla',
      icon: Trophy,
      iconColor: 'text-orange-500',
      children: [
        { path: '/app/leaderboard', name: 'Topplista', icon: Trophy },
        { path: '/app/events', name: 'Event', icon: Calendar }
      ]
    },
    { 
      path: '/app/profile', 
      name: 'Min profil', 
      icon: User,
      single: true 
    },
    { 
      path: '/app/settings', 
      name: 'Inställningar', 
      icon: Settings,
      single: true 
    }
  ];

  const MenuItem = ({ item, isChild = false }) => {
    const isActive = item.path && location.pathname === item.path;
    
    if (item.single) {
      return (
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-sport-yellow-500 text-white shadow-sm'
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
      );
    }

    const isExpanded = expandedMenus.includes(item.id);
    const hasActiveChild = item.children?.some(child => location.pathname === child.path);

    return (
      <div>
        <button
          onClick={() => toggleMenu(item.id)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
            hasActiveChild || isExpanded
              ? 'bg-gray-50 text-gray-900'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={`w-5 h-5 ${item.iconColor || 'text-gray-400'}`} />
            <span className="text-sm font-medium">{item.name}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-sport-yellow-500 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <child.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-sm">{child.name}</span>
                        {child.badge && (
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-sport-yellow-100 text-sport-yellow-600'
                          }`}>
                            {child.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:flex flex-col h-full bg-white border-r border-gray-200 w-64"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sport-yellow-400 to-sport-lime-400 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-sport-yellow-500 to-sport-lime-500 bg-clip-text text-transparent">
            RunMate
          </span>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=ffee00&color=000`}
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
          {menuStructure.map((item, index) => (
            <MenuItem key={item.path || item.id || index} item={item} />
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