import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Users,
  Trophy,
  BarChart3,
  Route,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Översikt',
      path: '/app/dashboard',
      icon: Home,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      name: 'Hitta löparvänner',
      path: '/app/discover',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      name: 'Utmaningar',
      path: '/app/challenges',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50'
    },
    {
      name: 'Statistik',
      path: '/app/statistics',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      name: 'Hitta rutter',
      path: '/app/routes',
      icon: Route,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'from-indigo-50 to-blue-50'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '100px' }
  };

  const SidebarContent = () => (
    <motion.div 
      className="h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col shadow-xl relative"
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Collapse/Expand Button - Desktop only */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-4 top-20 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all items-center justify-center z-10 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        )}
      </motion.button>

      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between lg:justify-center">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-white font-bold text-lg">R</span>
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">RunMate</h1>
                  <p className="text-xs text-gray-500">Din löparkompis</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg">R</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
            >
              <motion.div
                className={`
                  relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} p-4 rounded-2xl transition-all duration-200 group overflow-hidden
                  ${active 
                    ? `bg-gradient-to-r ${item.bgColor} border border-gray-200 shadow-md` 
                    : 'hover:bg-gray-100/50'
                  }
                `}
                whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Background animation for active */}
                {active && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10`}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}

                {/* Active indicator */}
                {active && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute left-0 w-1 h-8 bg-gradient-to-b ${item.color} rounded-r-full shadow-lg`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon container */}
                <motion.div 
                  className={`
                    relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all
                    ${active 
                      ? `bg-gradient-to-br ${item.color} shadow-lg` 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                    }
                  `}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Sparkle effect for active */}
                  {active && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-4 h-4 text-white/50" />
                    </motion.div>
                  )}
                  <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-600'} relative z-10`} />
                </motion.div>

                {/* Label */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <span className={`font-medium ${active ? 'text-gray-900' : 'text-gray-700'}`}>
                        {item.name}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                    {item.name}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-xs text-gray-500 mb-2">
                © 2024 RunMate
              </p>
              <div className="flex justify-center gap-4 text-xs">
                <Link to="/privacy" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Integritet
                </Link>
                <Link to="/faq" className="text-gray-400 hover:text-gray-600 transition-colors">
                  FAQ
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs">©</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 h-full w-[280px] z-50"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar; 