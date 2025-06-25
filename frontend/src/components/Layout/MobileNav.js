import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  PlayIcon,
  TrophyIcon,
  UserGroupIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  PlayIcon as PlayIconSolid,
  TrophyIcon as TrophyIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  PlusCircleIcon as PlusCircleIconSolid
} from '@heroicons/react/24/solid';

const MobileNav = () => {
  const location = useLocation();

  const navItems = [
    { 
      path: '/app/dashboard', 
      label: 'Hem', 
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
      path: '/app/log-activity', 
      label: '', 
      icon: PlusCircleIcon,
      iconSolid: PlusCircleIconSolid,
      color: 'red',
      isSpecial: true
    },
    { 
      path: '/app/challenges', 
      label: 'Utmaningar', 
      icon: TrophyIcon,
      iconSolid: TrophyIconSolid,
      color: 'yellow'
    },
    { 
      path: '/app/discover', 
      label: 'Upptäck', 
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
      color: 'purple'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = isActive(item.path) ? item.iconSolid : item.icon;
          const active = isActive(item.path);
          
          if (item.isSpecial) {
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  className="relative -mt-8"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-full animate-ping opacity-20"></div>
                </motion.div>
              </Link>
            );
          }
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className="flex flex-col items-center gap-1 px-3 py-2"
                whileTap={{ scale: 0.95 }}
              >
                <Icon 
                  className={`w-6 h-6 transition-colors ${
                    active ? `text-${item.color}-600` : 'text-gray-400'
                  }`}
                />
                <span 
                  className={`text-xs font-medium transition-colors ${
                    active ? `text-${item.color}-600` : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className={`absolute -bottom-0.5 w-1 h-1 bg-${item.color}-600 rounded-full`}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav; 