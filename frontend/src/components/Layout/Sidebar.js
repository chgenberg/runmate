import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  Trophy,
  User,
  Settings,
  LogOut,
  Heart,
  Compass,
  List,
  Home,
  PlusSquare,
  Award,
  Bell,
  Menu,
  X,
  Star
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    {
      name: 'Översikt',
      href: '/app/dashboard',
      icon: Home,
      description: 'Din personliga hubb'
    },
    {
      name: 'Hitta vänner',
      href: '/app/discover',
      icon: Compass,
      description: 'Upptäck nya löpare'
    },
    {
      name: 'Matcher',
      href: '/app/matches',
      icon: Users,
      description: 'Dina anslutningar'
    },
    {
      name: 'Aktiviteter',
      href: '/app/activities',
      icon: PlusSquare,
      description: 'Dina träningspass'
    },
    {
      name: 'Utmaningar',
      href: '/app/challenges',
      icon: Award,
      description: 'Tävla och ha kul'
    },
    {
      name: 'Topplistan',
      href: '/app/leaderboard',
      icon: Trophy,
      description: 'Rankning och prestationer'
    },
    {
      name: 'Betyg',
      href: '/app/ratings',
      icon: Star,
      description: 'Recensioner och feedback'
    },
    {
      name: 'Community',
      href: '/app/community',
      icon: List,
      description: 'Grupper och forum'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">RunMate</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/app/profile"
          className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors mb-3"
        >
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profil" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </NavLink>

        <div className="space-y-1">
          <NavLink
            to="/app/settings"
            className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Settings className="mr-3 h-4 w-4" />
            Inställningar
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logga ut
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 