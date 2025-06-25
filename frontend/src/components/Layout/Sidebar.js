import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Users,
  Trophy,
  BarChart3,
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
    }
  ];

  const isActive = (path) => location.pathname === path;

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' }
  };

  const SidebarContent = () => (
    <motion.div 
      className="h-full bg-white border-r border-gray-200 flex flex-col shadow-lg"
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-xl font-bold text-gray-900">RunMate</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={`
                  relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group
                  ${active 
                    ? `bg-gradient-to-r ${item.bgColor} border border-gray-200 shadow-sm` 
                    : 'hover:bg-gray-50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute left-0 w-1 h-8 bg-gradient-to-b ${item.color} rounded-r-full`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${active 
                    ? `bg-gradient-to-br ${item.color} shadow-lg` 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                  }
                `}>
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-600'}`} />
                </div>

                {/* Label */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`font-medium ${active ? 'text-gray-900' : 'text-gray-700'}`}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <AnimatePresence>
          {!isCollapsed && (
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
                <Link to="/privacy" className="text-gray-400 hover:text-gray-600">
                  Integritet
                </Link>
                <Link to="/faq" className="text-gray-400 hover:text-gray-600">
                  FAQ
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 z-50"
            >
              <div className="h-full bg-white border-r border-gray-200 flex flex-col shadow-xl">
                {/* Mobile Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">R</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">RunMate</span>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link 
                        key={item.path} 
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <div
                          className={`
                            relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200
                            ${active 
                              ? `bg-gradient-to-r ${item.bgColor} border border-gray-200 shadow-sm` 
                              : 'hover:bg-gray-50'
                            }
                          `}
                        >
                          {/* Active indicator */}
                          {active && (
                            <div className={`absolute left-0 w-1 h-8 bg-gradient-to-b ${item.color} rounded-r-full`} />
                          )}

                          {/* Icon */}
                          <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center transition-all
                            ${active 
                              ? `bg-gradient-to-br ${item.color} shadow-lg` 
                              : 'bg-gray-100'
                            }
                          `}>
                            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-600'}`} />
                          </div>

                          {/* Label */}
                          <span className={`font-medium ${active ? 'text-gray-900' : 'text-gray-700'}`}>
                            {item.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    © 2024 RunMate
                  </p>
                  <div className="flex justify-center gap-4 text-xs">
                    <Link to="/privacy" className="text-gray-400 hover:text-gray-600">
                      Integritet
                    </Link>
                    <Link to="/faq" className="text-gray-400 hover:text-gray-600">
                      FAQ
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar; 