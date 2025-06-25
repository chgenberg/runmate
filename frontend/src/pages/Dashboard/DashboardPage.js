import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Play,
  CheckCircle,
  ArrowRight,
  Zap,
  Users,
  Trophy,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [showAIOnboarding, setShowAIOnboarding] = useState(false);
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
      setHasCompletedAnalysis(response.data?.hasCompletedAIAnalysis || false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Demo data fallback
      setDashboardData({
        hasCompletedAIAnalysis: false,
        stats: {
          totalDistance: 0,
          totalRuns: 0,
          totalTime: 0,
          avgPace: 0
        }
      });
      setHasCompletedAnalysis(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStartAIAnalysis = () => {
    setShowAIOnboarding(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Laddar din dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Välkommen till RunMate! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user?.name ? `Hej ${user.name}! ` : 'Hej! '}
            Låt oss hjälpa dig nå dina löpmål med personlig AI-träningsanalys.
          </p>
        </motion.div>

        {!hasCompletedAnalysis ? (
          /* AI Analysis CTA - Main Focus */
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mb-16"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl blur-3xl" />
            
            <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Content */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      GRATIS AI-ANALYS
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Få din kompletta träningsanalys
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Vår AI-coach analyserar dina mål, nuvarande kondition och skapar en personlig 
                    träningsplan med kostschema och livsstilsråd - helt gratis!
                  </p>

                  {/* Benefits */}
                  <div className="space-y-4 mb-8">
                    {[
                      'Personlig träningsplan baserad på dina mål',
                      'Kostschema anpassat efter din träning',
                      'Livsstilsråd för optimal återhämtning',
                      'Kontinuerlig uppföljning och justeringar'
                    ].map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    onClick={handleStartAIAnalysis}
                    className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-6 h-6" />
                    Starta min AI-analys
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>

                {/* Visual */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-8 text-center">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700">Målanalys</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700">Progressplan</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700">Träningsschema</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700">AI-coaching</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      15 frågor • 5 minuter • Livslång plan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Post-Analysis Dashboard */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-900">AI-analys genomförd</h2>
              </div>
              <p className="text-gray-600">
                Din personliga träningsplan är redo! Kolla din AI Coach för detaljerade rekommendationer.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total distans</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats?.totalDistance || 0} km
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Play className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Aktiviteter</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats?.totalRuns || 0}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Genomsnittsfart</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats?.avgPace ? `${Math.floor(dashboardData.stats.avgPace / 60)}:${(dashboardData.stats.avgPace % 60).toString().padStart(2, '0')}` : '0:00'} /km
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Hitta löparvänner</h3>
            <p className="text-gray-600 text-sm">Upptäck och träna med andra löpare i ditt område.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Utmaningar</h3>
            <p className="text-gray-600 text-sm">Delta i spännande löputmaningar och tävla med andra.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Statistik</h3>
            <p className="text-gray-600 text-sm">Följ din utveckling och se detaljerad träningsstatistik.</p>
          </div>
        </motion.div>
      </div>

      {/* AI Onboarding Modal */}
      <AnimatePresence>
        {showAIOnboarding && (
          <AIOnboardingModal 
            onClose={() => setShowAIOnboarding(false)}
            onComplete={() => {
              setShowAIOnboarding(false);
              setHasCompletedAnalysis(true);
              toast.success('AI-analys genomförd! Din personliga plan är redo.');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Placeholder for AI Onboarding Modal - will be implemented next
const AIOnboardingModal = ({ onClose, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-träningsanalys</h3>
          <p className="text-gray-600 mb-8">
            Denna funktion kommer snart! Vi förbereder 15 smarta frågor som kommer att skapa din perfekta träningsplan.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Stäng
            </button>
            <button
              onClick={onComplete}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Demo: Markera som klar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage; 