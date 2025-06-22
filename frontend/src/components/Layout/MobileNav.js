import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  Compass,
  List,
  MessageSquare,
  Award
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
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end // Important for the dashboard link to not stay active
            className={({ isActive }) =>
              `flex flex-col items-center justify-center pt-2 pb-2 text-xs font-medium transition-colors min-h-[60px] ${
                isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-primary-600 active:bg-gray-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-6 w-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px]">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNav; 