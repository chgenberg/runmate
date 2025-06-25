import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  PlayIcon,
  MapPinIcon,
  TrophyIcon,
  SparklesIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  PlayIcon as PlayIconSolid,
  MapPinIcon as MapPinIconSolid,
  TrophyIcon as TrophyIconSolid,
  SparklesIcon as SparklesIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserIcon as UserIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CalendarIcon as CalendarIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const menuItems = [
    { 
      path: '/app/dashboard', 
      label: 'Översikt', 
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      color: 'orange'
    },
    { 
      path: '/app/activities', 
      label: 'Aktiviteter', 
      icon: PlayIcon,
      iconSolid: PlayIconSolid,
      color: 'blue'
    },
    { 
      path: '/app/suggested-routes', 
      label: 'Rutter', 
      icon: MapPinIcon,
      iconSolid: MapPinIconSolid,
      color: 'green'
    },
    { 
      path: '/app/challenges', 
      label: 'Utmaningar', 
      icon: TrophyIcon,
      iconSolid: TrophyIconSolid,
      color: 'yellow'
    },
    { 
      path: '/app/ai-coach', 
      label: 'AI Coach', 
      icon: SparklesIcon,
      iconSolid: SparklesIconSolid,
      color: 'purple'
    },
    { 
      path: '/app/discover', 
      label: 'Upptäck', 
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
      color: 'pink'
    },
    { 
      path: '/app/community', 
      label: 'Community', 
      icon: ChatBubbleLeftRightIcon,
      iconSolid: ChatBubbleLeftRightIconSolid,
      color: 'indigo'
    },
    { 
      path: '/app/statistics', 
      label: 'Statistik', 
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      color: 'teal'
    },
    { 
      path: '/app/events', 
      label: 'Event', 
      icon: CalendarIcon,
      iconSolid: CalendarIconSolid,
      color: 'red'
    }
  ];

  const bottomMenuItems = [
    { 
      path: '/app/profile', 
      label: 'Profil', 
      icon: UserIcon,
      iconSolid: UserIconSolid,
      color: 'gray'
    },
    { 
      path: '/app/settings', 
      label: 'Inställningar', 
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIcon,
      color: 'gray'
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' }
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-6' : 'p-4'}`}>
      {/* Logo */}
      <Link to="/app/dashboard" className="mb-8">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <FireIcon className="w-7 h-7 text-white" />
          </div>
          <AnimatePresence>
            {(!isCollapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-2xl font-bold gradient-text"
              >
                RunMate
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>

      {/* User Info */}
      <div className={`mb-6 p-4 bg-gray-50 rounded-xl ${isCollapsed && !mobile ? 'px-2' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <AnimatePresence>
            {(!isCollapsed || mobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1"
              >
                <p className="font-semibold text-sm">{user?.name || 'Användare'}</p>
                <p className="text-xs text-gray-500">Nivå 12 • 1,234 XP</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = isActive(item.path) ? item.iconSolid : item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${active 
                    ? `bg-${item.color}-100 text-${item.color}-700` 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${isCollapsed && !mobile ? 'justify-center' : ''}
                `}
                whileHover={{ x: active ? 0 : 4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={`w-5 h-5 ${active ? `text-${item.color}-600` : ''}`} />
                <AnimatePresence>
                  {(!isCollapsed || mobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (!isCollapsed || mobile) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`ml-auto w-1 h-5 bg-${item.color}-600 rounded-full`}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Stats Widget */}
      <AnimatePresence>
        {(!isCollapsed || mobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="my-6 p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Veckans mål</span>
              <TrophyIcon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold mb-2">32.5 / 50 km</div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Menu */}
      <div className="space-y-1 pt-4 border-t border-gray-200">
        {bottomMenuItems.map((item) => {
          const Icon = isActive(item.path) ? item.iconSolid : item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${active 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${isCollapsed && !mobile ? 'justify-center' : ''}
                `}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                <AnimatePresence>
                  {(!isCollapsed || mobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
        
        <motion.button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
            text-red-600 hover:bg-red-50
            ${isCollapsed && !mobile ? 'justify-center' : ''}
          `}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <AnimatePresence>
            {(!isCollapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-medium"
              >
                Logga ut
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse Button - Desktop Only */}
      {!mobile && (
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors self-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bars3Icon className="w-5 h-5 text-gray-600" />
        </motion.button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        className="hidden lg:block fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-40"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {showMobileMenu ? (
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar; 