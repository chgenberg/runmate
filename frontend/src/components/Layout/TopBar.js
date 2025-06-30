import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { Heart, Search, X, Menu } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import AppleHealthSyncModal from './AppleHealthSyncModal';
import ProfileAvatar from '../common/ProfileAvatar';
import { getProfilePictureUrl } from '../../services/api';

const TopBar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppleHealthSync, setShowAppleHealthSync] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
    <>
      <motion.div 
        className="bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-6 lg:px-8 shadow-sm sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button and Logo */}
          <div className="lg:hidden flex items-center">
            <motion.button
              onClick={onMenuClick}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all mr-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="h-6 w-6" />
            </motion.button>
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-2">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                RunMate
              </h1>
            </motion.div>
          </div>

          {/* Search Bar - Hidden on mobile, shown on larger screens */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-4">
            <GlobalSearch />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Mobile Search Button */}
            <motion.button
              onClick={() => setShowMobileSearch(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="h-5 w-5" />
            </motion.button>

            {/* Apple Health Sync Button */}
            <motion.button
              onClick={() => setShowAppleHealthSync(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:shadow-lg transition-all text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Synka Apple Health</span>
              <motion.span 
                className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.button>

            {/* Connection Status - Only show on desktop */}
            <div className="hidden lg:flex items-center">
              <motion.div 
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: isConnected ? Infinity : 0, duration: 2 }}
              />
              <span className="ml-2 text-xs text-gray-500">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {unreadCount > 0 ? (
                  <BellSolidIcon className="h-6 w-6 text-orange-500" />
                ) : (
                  <BellIcon className="h-6 w-6" />
                )}
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">Notifikationer</h3>
                      {unreadCount > 0 && (
                        <p className="text-sm text-gray-600">{unreadCount} nya meddelanden</p>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 last:border-b-0 ${
                            notification.read ? 'bg-white' : 'bg-orange-50/50'
                          } hover:bg-gray-50 transition-colors cursor-pointer`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <p className="text-sm text-gray-900 font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          {!notification.read && (
                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                      <button className="w-full text-sm text-orange-600 hover:text-orange-500 font-medium">
                        Visa alla notifikationer
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Picture */}
            <motion.button
              onClick={() => navigate('/app/profile')}
              className="relative flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ProfileAvatar
                user={user}
                src={getProfilePictureUrl(user)}
                size="sm"
                className="border-2 border-white shadow-md"
              />
              <motion.div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              className="lg:hidden absolute inset-x-0 top-16 bg-white border-b border-gray-200 p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <GlobalSearch onClose={() => setShowMobileSearch(false)} />
                </div>
                <motion.button
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Apple Health Sync Modal */}
      <AppleHealthSyncModal 
        isOpen={showAppleHealthSync} 
        onClose={() => setShowAppleHealthSync(false)} 
      />
    </>
  );
};

export default TopBar; 