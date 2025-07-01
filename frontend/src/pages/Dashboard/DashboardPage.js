import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Play,
  CheckCircle,
  Zap,
  Trophy,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import RaceCoachOnboarding from '../../components/AICoach/RaceCoachOnboarding';

const DashboardPage = () => {
  const { user } = useAuth();
  const [showRaceCoachOnboarding, setShowRaceCoachOnboarding] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Demo data fallback
      setDashboardData({
        stats: {
          totalDistance: 0,
          totalRuns: 0,
          totalTime: 0,
          avgPace: 0
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);



  const handleStartRaceCoach = () => {
    setShowRaceCoachOnboarding(true);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pb-20 lg:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 lg:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-xl"
          >
            <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </motion.div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900 mb-3 lg:mb-4 uppercase">
            VÄLKOMMEN TILL RUNMATE! 👋
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-6 lg:mb-8 uppercase">
            {user?.name ? `HEJ ${user.name.toUpperCase()}! ` : 'HEJ! '}
            FÖRBERED DIG FÖR DITT NÄSTA LOPP MED VÅR AI-COACH.
          </p>

          {/* Race Preparation Button - Main CTA */}
          <div className="flex justify-center">
            <motion.button
              onClick={handleStartRaceCoach}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 lg:px-12 py-4 lg:py-5 rounded-3xl font-bold text-lg lg:text-xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-4 mx-auto uppercase transform hover:scale-105"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="w-6 h-6 lg:w-8 lg:h-8" />
              FÖRBERED FÖR LOPP
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        {/* Race Preparation Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative mb-12 lg:mb-16"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
          
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-100">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Content */}
              <div>
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <span className="text-xs lg:text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full uppercase">
                    AI RACE COACH
                  </span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 uppercase">
                  FÖRBERED DIG FÖR DITT NÄSTA LOPP
                </h2>
                <p className="text-base lg:text-lg text-gray-600 mb-6 lg:mb-8">
                  Välj från de 50 största loppen i världen och få en personlig träningsplan 
                  som tar dig från där du är idag till mållinjen!
                </p>

                {/* Benefits */}
                <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                  {[
                    'Välj bland 50 världskända lopp',
                    'Personlig träningsplan baserad på din nivå',
                    'Veckoschema med intervaller, tempo och långpass',
                    'Kostråd och återhämtningsprotokoll'
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm lg:text-base text-gray-700">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Race Categories */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4 mt-4 lg:mt-6">
                  <div className="flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3 bg-purple-50 rounded-xl">
                    <Trophy className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-xs lg:text-sm font-medium text-gray-800 break-words">World Majors</span>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3 bg-pink-50 rounded-xl">
                    <Target className="w-4 h-4 lg:w-5 lg:h-5 text-pink-600 flex-shrink-0" />
                    <span className="text-xs lg:text-sm font-medium text-gray-800 break-words">Ultramaraton</span>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3 bg-indigo-50 rounded-xl">
                    <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-xs lg:text-sm font-medium text-gray-800 break-words">Nordiska lopp</span>
                  </div>
                </div>
              </div>

              {/* Visual */}
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 sm:p-6 lg:p-8 text-center">
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div className="bg-white rounded-xl p-3 lg:p-4 shadow-sm">
                      <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-purple-500 mx-auto mb-1 lg:mb-2" />
                      <p className="text-xs lg:text-sm font-semibold text-gray-700 break-words">Träningskalender</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 lg:p-4 shadow-sm">
                      <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-green-500 mx-auto mb-1 lg:mb-2" />
                      <p className="text-xs lg:text-sm font-semibold text-gray-700 break-words">Progressplan</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 lg:p-4 shadow-sm">
                      <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500 mx-auto mb-1 lg:mb-2" />
                      <p className="text-xs lg:text-sm font-semibold text-gray-700 break-words">Intervallpass</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 lg:p-4 shadow-sm">
                      <Brain className="w-6 h-6 lg:w-8 lg:h-8 text-pink-500 mx-auto mb-1 lg:mb-2" />
                      <p className="text-xs lg:text-sm font-semibold text-gray-700 break-words">AI-coaching</p>
                    </div>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-600">
                    16 frågor • 5 minuter • Komplett träningsplan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 lg:space-y-8"
          >


            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 lg:gap-3 mb-2">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-gray-600 uppercase">TOTAL DISTANS</span>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {dashboardData?.stats?.totalDistance || 0} km
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 lg:gap-3 mb-2">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Play className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-gray-600 uppercase">AKTIVITETER</span>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {dashboardData?.stats?.totalRuns || 0}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 lg:gap-3 mb-2">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-gray-600 uppercase">GENOMSNITTSFART</span>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {dashboardData?.stats?.avgPace ? `${Math.floor(dashboardData.stats.avgPace / 60)}:${(dashboardData.stats.avgPace % 60).toString().padStart(2, '0')}` : '0:00'} /km
                </p>
              </div>
            </div>
          </motion.div>
      </div>

      {/* Race Coach Onboarding Modal */}
      <RaceCoachOnboarding 
        isOpen={showRaceCoachOnboarding}
        onClose={() => setShowRaceCoachOnboarding(false)}
      />

    </div>
  );
};

export default DashboardPage; 