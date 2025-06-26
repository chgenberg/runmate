import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Target, 
  Activity, 
  Apple, 
  Heart, 
  TrendingUp, 
  Moon, 
  Calendar,
  Download,
  Share2,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const AICoachResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [coachingPlan] = useState(location.state?.plan);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!coachingPlan) {
      // Redirect back to dashboard if no plan
      navigate('/dashboard');
    }
  }, [coachingPlan, navigate]);

  if (!coachingPlan) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Översikt', icon: Target },
    { id: 'training', label: 'Träningsplan', icon: Activity },
    { id: 'nutrition', label: 'Kost', icon: Apple },
    { id: 'lifestyle', label: 'Livsstil', icon: Heart },
    { id: 'progress', label: 'Framsteg', icon: TrendingUp }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Din Personliga Plan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mål</p>
                  <p className="font-semibold text-gray-900">{coachingPlan.summary?.goal || 'Förbättra löpning'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nivå</p>
                  <p className="font-semibold text-gray-900">{coachingPlan.summary?.level || 'Motionär'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Längd</p>
                  <p className="font-semibold text-gray-900">{coachingPlan.summary?.duration || '12 veckor'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start</p>
                  <p className="font-semibold text-gray-900">{coachingPlan.summary?.startDate || 'Idag'}</p>
                </div>
              </div>
            </div>

            {/* Key Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Träningsfrekvens</h4>
                <p className="text-sm text-gray-600">
                  {coachingPlan.training?.weeklyRuns || '3'} pass per vecka med gradvis ökning
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Apple className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Näringsintag</h4>
                <p className="text-sm text-gray-600">
                  {coachingPlan.nutrition?.dailyCalories || '2400-2600'} kalorier per dag
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <Moon className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Återhämtning</h4>
                <p className="text-sm text-gray-600">
                  {coachingPlan.lifestyle?.sleep?.hours || '7-9'} timmars sömn per natt
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Starta första veckan
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Ladda ner plan
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Dela
              </button>
            </div>
          </div>
        );

      case 'training':
        return (
          <div className="space-y-6">
            {/* Weekly Schedule */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Veckans Schema</h3>
              <div className="space-y-3">
                {Object.entries(coachingPlan.training?.weeklySchedule || {}).map(([day, workout]) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{day}</p>
                      <p className="text-sm text-gray-600">{workout}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Training Phases */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Träningsfaser</h3>
              <div className="space-y-4">
                {coachingPlan.training?.phases?.map((phase, index) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{phase.focus}</p>
                    <p className="text-sm text-gray-500">Veckovolym: {phase.weeklyDistance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'nutrition':
        return (
          <div className="space-y-6">
            {/* Daily Nutrition */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dagligt Näringsintag</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{coachingPlan.nutrition?.dailyCalories || '2500'}</p>
                  <p className="text-sm text-gray-600">Kalorier</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{coachingPlan.nutrition?.macros?.carbs || '55%'}</p>
                  <p className="text-sm text-gray-600">Kolhydrater</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{coachingPlan.nutrition?.macros?.protein || '25%'}</p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{coachingPlan.nutrition?.macros?.fat || '20%'}</p>
                  <p className="text-sm text-gray-600">Fett</p>
                </div>
              </div>

              {/* Meal Timing */}
              <div className="space-y-3">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Före träning</h4>
                  <p className="text-sm text-gray-600">{coachingPlan.nutrition?.preworkout?.timing || '1-2 timmar före'}</p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    {coachingPlan.nutrition?.preworkout?.options?.map((option, i) => (
                      <li key={i}>• {option}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Efter träning</h4>
                  <p className="text-sm text-gray-600">{coachingPlan.nutrition?.postworkout?.timing || 'Inom 30-60 minuter'}</p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    {coachingPlan.nutrition?.postworkout?.options?.map((option, i) => (
                      <li key={i}>• {option}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'lifestyle':
        return (
          <div className="space-y-6">
            {/* Sleep */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sömn & Återhämtning</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Rekommenderad sömn</p>
                    <p className="text-sm text-gray-600">{coachingPlan.lifestyle?.sleep?.recommendation || '7-9 timmar per natt'}</p>
                  </div>
                </div>
                {coachingPlan.lifestyle?.sleep?.tips?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 ml-8">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <p className="text-sm text-gray-600">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stress Management */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Stresshantering</h3>
              <div className="space-y-3">
                {coachingPlan.lifestyle?.stressManagement?.techniques?.map((technique, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{technique}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            {/* Progress Milestones */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Delmål</h3>
              <div className="space-y-4">
                {[
                  { week: 4, goal: 'Etablerad löprutin', status: 'upcoming' },
                  { week: 8, goal: 'Ökad uthållighet', status: 'upcoming' },
                  { week: 12, goal: 'Måluppfyllelse', status: 'upcoming' }
                ].map((milestone, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      milestone.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <span className="font-semibold text-sm">V{milestone.week}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{milestone.goal}</p>
                      <p className="text-sm text-gray-600">Vecka {milestone.week}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Nästa Steg</h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <p className="text-sm text-gray-700">Läs igenom hela din plan och bekanta dig med upplägget</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <p className="text-sm text-gray-700">Planera in dina första träningspass i kalendern</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <p className="text-sm text-gray-700">Förbered dig mentalt och fysiskt för din resa</p>
                </li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Din AI-träningsplan</h1>
                <p className="text-sm text-gray-600">Personligt anpassad efter dina mål</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default AICoachResultsPage; 