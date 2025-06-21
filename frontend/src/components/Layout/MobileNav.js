import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  Compass,
  List,
  MessageSquare,
  Settings,
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
    },
    {
      name: 'Inställningar',
      href: '/app/settings',
      icon: Settings,
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end // Important for the dashboard link to not stay active
            className={({ isActive }) =>
              `flex flex-col items-center justify-center pt-2 pb-1 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="mt-1">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNav; 