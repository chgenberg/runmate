import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Trophy,
  Settings,
  LogOut,
  Compass,
  Home,
  PlusSquare,
  Award,
  Star,
  Calendar,
  MessageCircle,
  BarChart3,
  ChevronRight,
  Sparkles,
  Activity,
  Bell,
  ChevronLeft
} from 'lucide-react';
import ProfileAvatar from '../common/ProfileAvatar';
import { getProfilePictureUrl } from '../../services/api';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeNotifications] = useState(3);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    {
      name: 'Hem',
      href: '/app/dashboard',
      icon: Home,
      description: 'Din personliga hubb',
      badge: null,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Statistik',
      href: '/app/statistics',
      icon: BarChart3,
      description: 'Avancerad analys',
      badge: 'NY',
      badgeColor: 'bg-green-500',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Träningspass',
      href: '/app/activities',
      icon: PlusSquare,
      description: 'Dina löprundor',
      badge: null,
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Löpvänner',
      href: '/app/matches',
      icon: Users,
      description: 'Hitta löpare',
      badge: activeNotifications > 0 ? activeNotifications : null,
      badgeColor: 'bg-red-500',
      color: 'from-pink-500 to-pink-600'
    },
    {
      name: 'Meddelanden',
      href: '/app/messages',
      icon: MessageCircle,
      description: 'Chatta med löpare',
      badge: null,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      name: 'Upptäck',
      href: '/app/discover',
      icon: Compass,
      description: 'Gå med i löprundor',
      badge: null,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      name: 'Utmaningar',
      href: '/app/challenges',
      icon: Award,
      description: 'Tävlingar',
      badge: null,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      name: 'Event',
      href: '/app/events',
      icon: Calendar,
      description: 'Maraton & race',
      badge: null,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      name: 'Topplista',
      href: '/app/leaderboard',
      icon: Trophy,
      description: 'Rankning',
      badge: null,
      color: 'from-amber-500 to-amber-600'
    }
  ];

  const bottomItems = [
    {
      name: 'Betyg',
      href: '/app/ratings',
      icon: Star,
      description: 'Recensioner'
    },
    {
      name: 'Community',
      href: '/app/community',
      icon: Users,
      description: 'Forum'
    }
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <motion.div 
      className={`h-full flex flex-col bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
      initial={false}
      animate={{ width: isCollapsed ? 80 : 288 }}
    >
      {/* Logo & Collapse Button */}
      <div className="p-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-3"
          animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <motion.div 
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  RunMate
                </h1>
                <p className="text-xs text-gray-500">Löpning tillsammans</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5 text-gray-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600" />}
        </motion.button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.href}
              className={`relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive(item.href)
                  ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg shadow-' + item.color.split('-')[1] + '-500/25'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {/* Active Indicator */}
              {isActive(item.href) && (
                <motion.div
                  className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                className={`flex items-center justify-center ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-white' : ''}`} />
              </motion.div>

              {/* Text & Badge */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    className="flex-1 flex items-center justify-between"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                  >
                    <div>
                      <div className={`font-medium ${isActive(item.href) ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </div>
                      <div className={`text-xs ${isActive(item.href) ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                    
                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-2 py-1 text-xs font-bold text-white rounded-full ${
                          item.badgeColor || 'bg-orange-500'
                        }`}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hover Effect */}
              {!isActive(item.href) && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-100/0 to-gray-100/0 rounded-xl -z-10"
                  whileHover={{ 
                    background: 'linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(249, 250, 251, 0.8))'
                  }}
                />
              )}
            </NavLink>
          </motion.div>
        ))}

        {/* Separator */}
        <div className="my-3 px-3">
          <div className="h-px bg-gray-200" />
        </div>

        {/* Bottom Navigation Items */}
        {bottomItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (navigationItems.length + index) * 0.05 }}
          >
            <NavLink
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Pro Upgrade Banner */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3"
          >
            <motion.div 
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="w-8 h-8 mb-2" />
              <h3 className="font-bold mb-1">Uppgradera till Pro</h3>
              <p className="text-xs text-white/80 mb-3">Få tillgång till avancerad statistik och coaching</p>
              <button className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors">
                Läs mer
              </button>
              
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <NavLink
            to="/app/profile"
            className={`flex items-center ${isCollapsed ? 'justify-center' : ''} p-3 rounded-xl hover:bg-gray-100 transition-all mb-2`}
          >
            <ProfileAvatar
              user={user}
              src={getProfilePictureUrl(user)}
              size="sm"
            />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="ml-3 flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Nivå {user?.level || 1}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </NavLink>
        </motion.div>

        {/* Bottom Actions */}
        <div className={`grid ${isCollapsed ? 'grid-cols-1' : 'grid-cols-3'} gap-1`}>
          <motion.button
            onClick={() => navigate('/app/notifications')}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 mx-auto" />
            {activeNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </motion.button>
          
          <motion.button
            onClick={() => navigate('/app/settings')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 mx-auto" />
          </motion.button>
          
          <motion.button
            onClick={handleLogout}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-5 h-5 mx-auto" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar; 