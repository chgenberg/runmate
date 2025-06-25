import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 shadow-sm relative z-30">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RunMate</span>
          </Link>

          {/* Profile Icon */}
          <Link to="/app/settings">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-300"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
            </motion.div>
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-end px-6 py-4">
              {/* Profile Icon */}
              <Link to="/app/settings">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-300"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Page Content */}
          <div className="min-h-screen">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
};

export default Layout; 