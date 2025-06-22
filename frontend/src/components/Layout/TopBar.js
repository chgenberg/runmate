import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  BellIcon, 
  UserIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import GlobalSearch from './GlobalSearch';

const TopBar = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);

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
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4">
          <GlobalSearch />
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="hidden sm:flex items-center">
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
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profil" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-gray-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 