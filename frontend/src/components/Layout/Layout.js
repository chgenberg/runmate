import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import RaceCoachOnboarding from '../AICoach/RaceCoachOnboarding';
import api from '../../services/api';

const Layout = () => {
  const { user } = useAuth();
  const [showAIOnboarding, setShowAIOnboarding] = useState(false);
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);

  useEffect(() => {
    // Check if user has completed AI analysis
    const checkAnalysisStatus = async () => {
      try {
        const response = await api.get('/dashboard');
        setHasCompletedAnalysis(response.data?.hasCompletedAIAnalysis || false);
      } catch (error) {
        console.error('Error checking analysis status:', error);
      }
    };
    checkAnalysisStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile only */}
      <header className="lg:hidden bg-white border-b border-gray-200 shadow-sm relative z-30">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-gray-900">RunMate</span>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-3">
            {/* AI Icon - Mobile */}
            {!hasCompletedAnalysis && (
              <motion.button
                onClick={() => setShowAIOnboarding(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </motion.button>
            )}

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
      </header>

      <div className="flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-end px-6 py-4">
              <div className="flex items-center gap-4">
                {/* AI Icon - Desktop */}
                {!hasCompletedAnalysis && (
                  <motion.button
                    onClick={() => setShowAIOnboarding(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  </motion.button>
                )}

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
          </div>

          {/* Page Content */}
          <div className="min-h-screen pb-16 lg:pb-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* AI Onboarding Modal */}
      <RaceCoachOnboarding 
        isOpen={showAIOnboarding}
        onClose={() => {
          setShowAIOnboarding(false);
          // Refresh analysis status after closing
          const checkAnalysisStatus = async () => {
            try {
              const response = await api.get('/dashboard');
              setHasCompletedAnalysis(response.data?.hasCompletedAIAnalysis || false);
            } catch (error) {
              console.error('Error checking analysis status:', error);
            }
          };
          checkAnalysisStatus();
        }}
      />
    </div>
  );
};

export default Layout; 