import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Calendar,
  Target,
  Activity,
  Heart,
  Utensils,
  Moon,
  Users,
  Download,
  Share,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Trophy,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';
import { toast } from 'react-hot-toast';

const AICoachResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    training: true,
    nutrition: false,
    lifestyle: false,
    matches: false
  });

  useEffect(() => {
    // Get plan from navigation state or localStorage
    const navigationPlan = location.state?.plan;
    const storedPlan = localStorage.getItem('aiCoachPlan');
    
    if (navigationPlan) {
      setPlan(navigationPlan);
      // Store in localStorage for persistence
      localStorage.setItem('aiCoachPlan', JSON.stringify(navigationPlan));
      setLoading(false);
    } else if (storedPlan) {
      setPlan(JSON.parse(storedPlan));
      setLoading(false);
    } else {
      // No plan found, redirect to dashboard
      toast.error('Ingen träningsplan hittades');
      navigate('/app/dashboard');
    }
  }, [location.state, navigate]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownloadPlan = () => {
    // TODO: Implement PDF download
    toast.success('Nedladdning kommer snart!');
  };

  const handleSharePlan = () => {
    // TODO: Implement sharing
    toast.success('Delningsfunktion kommer snart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Laddar din träningsplan..." />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const SectionCard = ({ title, icon: Icon, gradient, expanded, children, section }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4"
    >
      <button
        onClick={() => toggleSection(section)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                  <Brain className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Din AI-Träningsplan</h1>
              </div>
              <p className="text-gray-600">Personligt anpassad efter dina mål och förutsättningar</p>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSharePlan}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPlan}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Sammanfattning</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-white/80 text-sm mb-1">Nivå</p>
              <p className="text-xl font-semibold capitalize">{plan.summary?.level || 'Medel'}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Huvudmål</p>
              <p className="text-xl font-semibold">{plan.summary?.goal === 'fitness' ? 'Kondition' : 'Prestation'}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Programlängd</p>
              <p className="text-xl font-semibold">{plan.summary?.duration || '12 veckor'}</p>
            </div>
          </div>
        </motion.div>

        {/* Training Section */}
        <SectionCard
          title="Träningsplan"
          icon={Activity}
          gradient="from-orange-500 to-red-500"
          expanded={expandedSections.training}
          section="training"
        >
          {/* Weekly Schedule */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Veckoschema
            </h3>
            <div className="space-y-3">
              {Object.entries(plan.training?.weeklySchedule || {}).map(([day, workout]) => (
                <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-24 font-medium text-gray-700">{day}</div>
                  <div className="flex-1 text-gray-600">{workout}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Phases */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Träningsfaser
            </h3>
            <div className="space-y-4">
              {plan.training?.phases?.map((phase, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{phase.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{phase.focus}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Veckodistans:</span>
                    <span className="font-medium text-gray-900">{phase.weeklyDistance}</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Nyckelpass:</p>
                    <ul className="space-y-1">
                      {phase.keyWorkouts?.map((workout, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {workout}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recovery Protocol */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-orange-500" />
              Återhämtning
            </h3>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Mellan pass:</strong> {plan.training?.recoveryProtocol?.betweenRuns}
              </p>
              <p className="text-sm text-gray-700 mb-3">
                <strong>Veckovis:</strong> {plan.training?.recoveryProtocol?.weekly}
              </p>
              <div className="space-y-2">
                {plan.training?.recoveryProtocol?.methods?.map((method, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Nutrition Section */}
        <SectionCard
          title="Kostplan"
          icon={Utensils}
          gradient="from-green-500 to-emerald-500"
          expanded={expandedSections.nutrition}
          section="nutrition"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Dagligt kaloriintag</h4>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {plan.nutrition?.dailyCalories || '2400-2600 kcal'}
              </p>
              <p className="text-sm text-gray-600">Anpassat efter din träningsnivå</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Vätska</h4>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {plan.nutrition?.hydration || '3.0-3.5 liter'}
              </p>
              <p className="text-sm text-gray-600">Per dag inklusive träning</p>
            </div>
          </div>

          {/* Macros */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Makrofördelning</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{plan.nutrition?.macros?.carbs || '50-60%'}</p>
                <p className="text-sm text-gray-600">Kolhydrater</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{plan.nutrition?.macros?.protein || '20-25%'}</p>
                <p className="text-sm text-gray-600">Protein</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-lg font-bold text-yellow-600">{plan.nutrition?.macros?.fat || '20-25%'}</p>
                <p className="text-sm text-gray-600">Fett</p>
              </div>
            </div>
          </div>

          {/* Pre/Post Workout Meals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Före träning</h4>
              <p className="text-sm text-gray-600 mb-2">{plan.nutrition?.preworkout?.timing}</p>
              <ul className="space-y-2">
                {plan.nutrition?.preworkout?.options?.map((option, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {option}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Efter träning</h4>
              <p className="text-sm text-gray-600 mb-2">{plan.nutrition?.postworkout?.timing}</p>
              <ul className="space-y-2">
                {plan.nutrition?.postworkout?.options?.map((option, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        {/* Lifestyle Section */}
        <SectionCard
          title="Livsstil & Återhämtning"
          icon={Moon}
          gradient="from-purple-500 to-indigo-500"
          expanded={expandedSections.lifestyle}
          section="lifestyle"
        >
          <div className="space-y-6">
            {/* Sleep */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-500" />
                Sömn
              </h4>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {plan.lifestyle?.sleep?.hours || '7-9 timmar per natt'}
              </p>
              <ul className="space-y-2">
                {plan.lifestyle?.sleep?.tips?.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cross Training */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Kompletterande träning
              </h4>
              <ul className="space-y-2">
                {plan.lifestyle?.crossTraining?.map((activity, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>

            {/* Injury Prevention */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-500" />
                Skadeförebyggande
              </h4>
              <ul className="space-y-2">
                {plan.lifestyle?.injuryPrevention?.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        {/* Matches Section */}
        <SectionCard
          title="Rekommenderade löparvänner"
          icon={Users}
          gradient="from-blue-500 to-cyan-500"
          expanded={expandedSections.matches}
          section="matches"
        >
          <div className="space-y-4">
            {plan.matches?.topMatches?.map((match, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {match.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{match.name}</h4>
                    <p className="text-sm text-gray-600">{match.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{match.matchScore}%</p>
                  <p className="text-xs text-gray-500">{match.distance}</p>
                </div>
              </motion.div>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/app/discover')}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              Se alla matchningar
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </SectionCard>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/app/dashboard')}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Trophy className="w-5 h-5" />
            Börja träna
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/app/challenges')}
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <Target className="w-5 h-5" />
            Hitta utmaningar
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default AICoachResultsPage; 