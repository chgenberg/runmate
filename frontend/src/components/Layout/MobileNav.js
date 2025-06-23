import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  Compass,
  List,
  MessageSquare,
  Award,
  Trophy,
  User,
  Settings,
  Calendar
} from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    {
      name: 'Hem',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Upptäck',
      href: '/app/discover',
      icon: Compass,
    },
    {
      name: 'Aktiviteter',
      href: '/app/activities',
      icon: List,
    },
    {
      name: 'Utmaningar',
      href: '/app/challenges',
      icon: Award,
    },
    {
      name: 'Matches',
      href: '/app/matches',
      icon: MessageSquare,
    },
    {
      name: 'Topplista',
      href: '/app/leaderboard',
      icon: Trophy,
    },
    {
      name: 'Profil',
      href: '/app/profile',
      icon: User,
    },
    {
      name: 'Event',
      href: '/app/events',
      icon: Calendar,
    },
    {
      name: 'Inställningar',
      href: '/app/settings',
      icon: Settings,
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom shadow-lg">
      <div className="relative">
        {/* Gradient indicator for scrolling */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
        
        <div className="flex overflow-x-auto scrollbar-hide scroll-smooth">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center pt-3 pb-2 px-4 text-xs font-medium transition-all min-w-[80px] ${
                  isActive 
                    ? 'text-red-600 bg-red-50/50' 
                    : 'text-gray-500 hover:text-red-600 active:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`${isActive ? 'scale-110 transform transition-transform' : ''}`}>
                    <item.icon 
                      className="h-6 w-6 mb-1" 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  </div>
                  <span className={`text-[11px] ${isActive ? 'font-semibold' : ''}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNav; 