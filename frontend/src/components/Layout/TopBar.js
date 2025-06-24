import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { Heart } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import AppleHealthSyncModal from './AppleHealthSyncModal';
import ProfileAvatar from '../common/ProfileAvatar';
import { getProfilePictureUrl } from '../../services/api';

const TopBar = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppleHealthSync, setShowAppleHealthSync] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'match',
      message: 'Du har en ny match med Anna!',
      time: '2 min sedan',
      read: false
    },
    {
      id: 2,
      type: 'kudos',
      message: 'Erik gav dig kudos för ditt löppass!',
      time: '15 min sedan',
      read: false
    },
    {
      id: 3,
      type: 'challenge',
      message: 'Veckoutmaningen slutar imorgon!',
      time: '1 timme sedan',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center justify-between h-16">
        {/* Logo/Brand for mobile */}
        <div className="lg:hidden flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            RunMate
          </h1>
        </div>

        {/* Search Bar - Hidden on mobile, shown on larger screens */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-4">
          <GlobalSearch />
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Apple Health Sync Button */}
          <button
            onClick={() => setShowAppleHealthSync(true)}
            className="group relative p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 animate-pulse-subtle"
          >
            <Heart className="h-5 w-5 text-white" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Synka Apple Health
            </span>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></span>
          </button>

          {/* Connection Status - Only show on desktop */}
          <div className="hidden lg:flex items-center">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="ml-2 text-xs text-gray-500">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-500 relative"
            >
              {unreadCount > 0 ? (
                <BellSolidIcon className="h-6 w-6 text-primary-500" />
              ) : (
                <BellIcon className="h-6 w-6" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Notifikationer</h3>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-primary-50'}`}
                      >
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 text-sm text-primary-600 hover:text-primary-500">
                    Visa alla notifikationer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Picture */}
          <button
            onClick={() => navigate('/app/profile')}
            className="shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            <ProfileAvatar
              user={user}
              src={getProfilePictureUrl(user)}
              size="sm"
              className="border-2 border-white"
            />
          </button>
        </div>
      </div>

      {/* Apple Health Sync Modal */}
      <AppleHealthSyncModal 
        isOpen={showAppleHealthSync} 
        onClose={() => setShowAppleHealthSync(false)} 
      />
    </div>
  );
};

export default TopBar; 