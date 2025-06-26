import React, { useRef, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Trophy,
  BarChart3,
  MapPin,
  MessageCircle,
  ChevronRight
} from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();
  const scrollRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const navItems = [
    { path: '/app/dashboard', label: 'Översikt', icon: Home },
    { path: '/app/discover', label: 'Hitta löparvänner', icon: Users },
    { path: '/app/challenges', label: 'Utmaningar', icon: Trophy },
    { path: '/app/chat', label: 'Chatt', icon: MessageCircle },
    { path: '/app/statistics', label: 'Statistik', icon: BarChart3 },
    { path: '/app/routes', label: 'Hitta rutter', icon: MapPin },
  ];

  // Check scroll position to show/hide indicator
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setScrollPosition(scrollLeft);
        
        // Hide indicator if scrolled to the end
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          setShowScrollIndicator(false);
        } else {
          setShowScrollIndicator(true);
        }
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Auto-hide scroll indicator after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollPosition === 0) {
        setShowScrollIndicator(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [scrollPosition]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:hidden">
      <div className="relative">
        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide px-2 py-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex-shrink-0"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-white' : ''}`} />
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    isActive ? 'text-white' : ''
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}

          {/* Spacer at the end for better scrolling */}
          <div className="w-4 flex-shrink-0" />
        </div>

        {/* Scroll indicator */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="bg-gradient-to-l from-white via-white to-transparent pl-8 pr-2">
                <motion.div
                  animate={{
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <ChevronRight className="w-4 h-4 text-gray-300 -ml-2" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileNav; 