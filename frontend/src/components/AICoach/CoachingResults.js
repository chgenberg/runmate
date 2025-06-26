import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  TrendingUp,
  Heart,
  Brain,
  Users,
  Zap,
  ChevronRight,
  CheckCircle,
  Star,
  Sparkles,
  Activity,
  Coffee,
  Moon,
  Dumbbell,
  Apple,
  Droplets,
  AlertCircle,
  BarChart3,
  Trophy
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CoachingResults = ({ plan, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isVisible) return null;

  // Add safety check and default plan structure
  const safePlan = plan || {
    summary: {
      duration: '12 veckor',
      weeklyCommitment: '3-4 timmar',
      primaryFocus: 'Hälsa',
      level: 'Medel'
    },
    training: {
      weeklySchedule: [
        { day: 'Måndag', type: 'Lätt löpning', duration: '30 min', pace: 'Lugnt tempo' },
        { day: 'Onsdag', type: 'Intervaller', duration: '45 min', pace: 'Varierande' },
        { day: 'Fredag', type: 'Distans', duration: '60 min', pace: 'Medeltempo' },
        { day: 'Söndag', type: 'Långpass', duration: '90 min', pace: 'Lugnt tempo' }
      ],
      phases: []
    },
    nutrition: {
      dailyCalories: '2400-2600 kcal',
      macros: {
        carbs: '50-60%',
        protein: '20-25%',
        fat: '20-25%'
      },
      hydration: '3.0-3.5 L'
    },
    lifestyle: {
      sleep: {
        hours: '7-9 timmar',
        tips: ['Gå och lägg dig samma tid varje dag', 'Undvik skärmar 1 timme före sömn']
      },
      stressManagement: ['Meditation 10 min/dag', 'Yoga eller stretching'],
      crossTraining: ['Simning', 'Cykling', 'Styrketräning'],
      injuryPrevention: ['Uppvärmning före varje pass', 'Stretching efter träning']
    },
    matches: {
      topMatches: []
    }
  };

  // Log plan structure for debugging
  console.log('Coaching Results Plan:', safePlan);

  const handleExport = () => {
    toast.success('Din träningsplan exporteras som PDF...');
    // TODO: Implement actual PDF export
  };

  const handleShare = () => {
    toast.success('Delningslänk kopierad!');
    // TODO: Implement actual sharing
  };

  const tabs = [
    { id: 'overview', label: 'Översikt', icon: BarChart3 },
    { id: 'training', label: 'Träning', icon: Activity },
    { id: 'nutrition', label: 'Kost', icon: Apple },
    { id: 'lifestyle', label: 'Livsstil', icon: Heart },
    { id: 'matches', label: 'Matchningar', icon: Users },
    { id: 'progress', label: 'Uppföljning', icon: TrendingUp }
  ];

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold mb-2">Din Personliga Träningsplan</h3>
            <p className="text-white/90 text-lg">Skräddarsydd för dina mål och förutsättningar</p>
          </div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{safePlan.summary?.duration || '12 veckor'}</div>
            <div className="text-white/80 text-sm">Program längd</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{safePlan.summary?.weeklyCommitment || '3-4 timmar'}</div>
            <div className="text-white/80 text-sm">Per vecka</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{safePlan.summary?.primaryFocus || 'Hälsa'}</div>
            <div className="text-white/80 text-sm">Huvudfokus</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{safePlan.summary?.level || 'Medel'}</div>
            <div className="text-white/80 text-sm">Svårighetsgrad</div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-orange-500" />
          Viktiga insikter för dig
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Progressiv ökning</p>
              <p className="text-sm text-gray-600">Din plan ökar gradvis i intensitet för säker utveckling</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Balanserad träning</p>
              <p className="text-sm text-gray-600">Kombination av distans, tempo och återhämtning</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Anpassad kost</p>
              <p className="text-sm text-gray-600">Näringsrekommendationer för optimal prestation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('training')}
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all"
        >
          <Activity className="w-8 h-8 text-blue-600 mb-3" />
          <h5 className="font-semibold text-gray-900 mb-1">Se träningsschema</h5>
          <p className="text-sm text-gray-600">Detaljerad veckoplanering</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('nutrition')}
          className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all"
        >
          <Apple className="w-8 h-8 text-green-600 mb-3" />
          <h5 className="font-semibold text-gray-900 mb-1">Kostplan</h5>
          <p className="text-sm text-gray-600">Mat för prestation</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('matches')}
          className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all"
        >
          <Users className="w-8 h-8 text-purple-600 mb-3" />
          <h5 className="font-semibold text-gray-900 mb-1">Löparvänner</h5>
          <p className="text-sm text-gray-600">Dina bästa matchningar</p>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderTraining = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Weekly Schedule */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Veckoschema</h4>
        <div className="space-y-3">
          {(safePlan.training?.weeklySchedule || []).map((workout, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {workout.day?.slice(0, 3) || 'Dag'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{workout.day || `Dag ${index + 1}`}</p>
                  <p className="text-sm text-gray-600">
                    {workout.type} - {workout.duration} {workout.pace && `@ ${workout.pace}`}
                  </p>
                  {workout.description && (
                    <p className="text-xs text-gray-500 mt-1">{workout.description}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Training Phases */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-gray-900">Träningsfaser</h4>
        {safePlan.training?.phases?.map((phase, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h5 className="text-lg font-semibold text-gray-900">{phase.name}</h5>
                <p className="text-gray-600">{phase.focus}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">{phase.weeklyDistance}</p>
                <p className="text-sm text-gray-500">per vecka</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Nyckelpass:</p>
              {phase.keyWorkouts?.map((workout, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4 text-orange-500" />
                  {workout}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderNutrition = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Daily Nutrition */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Daglig näring</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium text-gray-900">Kalorier</h5>
              <span className="text-2xl font-bold text-orange-600">
                {typeof safePlan.nutrition?.dailyCalories === 'number' 
                  ? `${safePlan.nutrition.dailyCalories} kcal`
                  : safePlan.nutrition?.dailyCalories || '2400-2600 kcal'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Kolhydrater</span>
                  <span className="font-medium">{safePlan.nutrition?.macros?.carbs || '50-60%'}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '55%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Protein</span>
                  <span className="font-medium">{safePlan.nutrition?.macros?.protein || '20-25%'}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '22.5%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fett</span>
                  <span className="font-medium">{safePlan.nutrition?.macros?.fat || '20-25%'}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '22.5%' }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 mb-4">Vätska</h5>
            <div className="flex items-center gap-3 mb-4">
              <Droplets className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{safePlan.nutrition?.hydration || '3.0-3.5 L'}</span>
            </div>
            <p className="text-sm text-gray-600">
              Öka med 500-750ml på träningsdagar
            </p>
          </div>
        </div>
      </div>

      {/* Meal Timing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-orange-600" />
            Före träning
          </h5>
          <p className="text-sm text-gray-700 mb-3">{safePlan.nutrition?.preworkout?.timing || '1-2 timmar före'}</p>
          <ul className="space-y-2">
            {(safePlan.nutrition?.preworkout?.options || []).map((option, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                {option}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-600" />
            Efter träning
          </h5>
          <p className="text-sm text-gray-700 mb-3">{safePlan.nutrition?.postworkout?.timing || 'Inom 30-60 min'}</p>
          <ul className="space-y-2">
            {(safePlan.nutrition?.postworkout?.options || []).map((option, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                {option}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Supplements */}
      {safePlan.nutrition?.supplements && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h5 className="font-semibold text-gray-900 mb-4">Rekommenderade kosttillskott</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {safePlan.nutrition.supplements.map((supplement, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-700">{supplement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderLifestyle = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Sleep */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Moon className="w-6 h-6 text-indigo-600" />
          Sömn & Återhämtning
        </h4>
        <div className="mb-4">
          <p className="text-2xl font-bold text-indigo-600">{safePlan.lifestyle?.sleep?.hours || '7-9 timmar'}</p>
          <p className="text-gray-600">Rekommenderad sömn per natt</p>
        </div>
        <div className="space-y-2">
          {(safePlan.lifestyle?.sleep?.tips || []).map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Stress Management */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          Stresshantering
        </h4>
        <div className="space-y-3">
          {(safePlan.lifestyle?.stressManagement || []).map((method, i) => (
            <div key={i} className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-gray-800">{method}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cross Training */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-gray-700" />
          Kompletterande träning
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(safePlan.lifestyle?.crossTraining || []).map((activity, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Activity className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">{activity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Injury Prevention */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-600" />
          Skadeförebyggande
        </h4>
        <div className="space-y-2">
          {(safePlan.lifestyle?.injuryPrevention || []).map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-red-500 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderMatches = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <h4 className="text-xl font-bold text-gray-900 mb-2">Dina bästa löparmatchningar</h4>
        <p className="text-gray-600 mb-6">Baserat på dina preferenser och träningsstil</p>
        
        <div className="space-y-4">
          {(safePlan.matches?.topMatches || []).map((match, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {match.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{match.name}</h5>
                    <p className="text-sm text-gray-600">{match.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">{match.distance}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{match.matchScore}%</div>
                  <div className="text-xs text-gray-500">matchning</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <Users className="w-5 h-5" />
        Se alla matchningar
      </motion.button>
    </motion.div>
  );

  const renderProgress = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Uppföljning & Progression</h4>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h5 className="font-medium text-gray-900 mb-2">Veckovis utvärdering</h5>
            <p className="text-sm text-gray-600">Logga dina pass och känn efter hur det går</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <h5 className="font-medium text-gray-900 mb-2">Månadsvis justering</h5>
            <p className="text-sm text-gray-600">AI-coachen anpassar planen efter dina framsteg</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h5 className="font-medium text-gray-900 mb-2">Kvartalsvis analys</h5>
            <p className="text-sm text-gray-600">Djupgående genomgång av din utveckling</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <h5 className="font-semibold text-gray-900 mb-3">Nästa steg</h5>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-orange-500" />
            Börja med första veckans träningspass
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-orange-500" />
            Anslut din träningsklocka för automatisk tracking
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-orange-500" />
            Hitta en löparvän från dina matchningar
          </li>
        </ul>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'training':
        return renderTraining();
      case 'nutrition':
        return renderNutrition();
      case 'lifestyle':
        return renderLifestyle();
      case 'matches':
        return renderMatches();
      case 'progress':
        return renderProgress();
      default:
        return renderOverview();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-50 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Din AI-genererade träningsplan</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </motion.button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white border-b border-gray-200 px-6 py-2 flex-shrink-0">
                <div className="flex gap-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-3 border-b-2 transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {renderContent()}
              </div>

              {/* Footer */}
              <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <p className="text-sm text-gray-500">
                  Plan skapad {new Date().toLocaleDateString('sv-SE')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Stäng
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Börja träna
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CoachingResults; 