import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Compass,
  PlusSquare,
  Award,
  Trophy,
  Calendar,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Star,
  X,
  Menu,
  Activity,
  Sparkles,
  ArrowRight,
  Brain
} from 'lucide-react';
import ProfileAvatar from '../common/ProfileAvatar';
import { getProfilePictureUrl } from '../../services/api';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeNotifications] = useState(3);
  const [showProModal, setShowProModal] = useState(false);

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
      name: 'AI-Coach',
      href: '/app/ai-coach',
      icon: Brain,
      description: 'Personlig träningsplan',
      badge: 'AI',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
      color: 'from-blue-500 to-purple-600'
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
          {isCollapsed ? <ArrowRight className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
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

      {/* Pro Upgrade Banner - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${isCollapsed ? 'px-2' : 'px-4'} mb-4`}
      >
        <motion.button
          onClick={() => setShowProModal(true)}
          className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-3 text-left transition-all hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-lg`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-sm">Uppgradera till Pro</span>
              </div>
              <p className="text-xs text-purple-100">Läs mer</p>
            </div>
            <div className={`${isCollapsed ? 'block' : 'hidden'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && <ArrowRight className="w-4 h-4 text-purple-200" />}
          </div>
        </motion.button>
      </motion.div>

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

      {/* Pro Upgrade Modal */}
      <AnimatePresence>
        {showProModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowProModal(false)}
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 relative z-[10000]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowProModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">RunMate Pro</h2>
                <p className="text-gray-600">AI-baserad träningsagent</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Personlig AI-coach</h3>
                    <p className="text-sm text-gray-600">Få skräddarsydda träningsplaner baserade på dina mål och livsstil</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Avancerad analys</h3>
                    <p className="text-sm text-gray-600">Djupgående insights och realtidscoaching för att nå dina mål</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart planering</h3>
                    <p className="text-sm text-gray-600">Automatisk anpassning av träning baserat på din återhämtning</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-3xl font-bold text-gray-900">99 kr</span>
                    <span className="text-gray-600 ml-1">/månad</span>
                  </div>
                  <p className="text-sm text-gray-600">Avsluta när som helst</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Starta 7 dagars gratis provperiod
                </motion.button>
                
                <button
                  onClick={() => setShowProModal(false)}
                  className="w-full text-gray-600 font-medium py-2 hover:text-gray-800 transition-colors"
                >
                  Kanske senare
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sidebar; 