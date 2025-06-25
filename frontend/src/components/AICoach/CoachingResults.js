import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft,
  Calendar,
  Apple,
  Moon,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  Star,
  Download,
  Share,

  Brain,
  Sparkles
} from 'lucide-react';

const CoachingResults = ({ plan, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Översikt', icon: Target },
    { id: 'training', label: 'Träning', icon: Calendar },
    { id: 'nutrition', label: 'Kost', icon: Apple },
    { id: 'lifestyle', label: 'Livsstil', icon: Moon },
    { id: 'tracking', label: 'Uppföljning', icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sport-lime-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Tillbaka</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <Share className="w-4 h-4" />
                <span>Dela</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">
                <Download className="w-4 h-4" />
                <span>Ladda ner</span>
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-sport-lime-400 rounded-2xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Din Personliga Plan</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">
                    {plan.aiGenerated ? 'Genererad av AI' : 'Strukturerad plan'}
                  </span>
                </div>
              </div>
            </div>
            
            {plan.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                  <Target className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Huvudfokus</p>
                  <p className="font-semibold text-gray-900">{plan.summary.primaryFocus}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                  <Clock className="w-6 h-6 text-sport-lime-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Tidsåtgång</p>
                  <p className="font-semibold text-gray-900">{plan.summary.weeklyCommitment}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                  <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Första resultat</p>
                  <p className="font-semibold text-gray-900">2-4 veckor</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && <OverviewTab plan={plan} />}
            {activeTab === 'training' && <TrainingTab plan={plan} />}
            {activeTab === 'nutrition' && <NutritionTab plan={plan} />}
            {activeTab === 'lifestyle' && <LifestyleTab plan={plan} />}
            {activeTab === 'tracking' && <TrackingTab plan={plan} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const OverviewTab = ({ plan }) => (
  <div className="space-y-8">
    {/* Key Strategies */}
    {plan.summary?.keyStrategies && (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Target className="w-6 h-6 text-orange-500 mr-3" />
          Nyckelstrategier
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plan.summary.keyStrategies.map((strategy, index) => (
            <div key={index} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center mb-4 text-lg font-bold">
                {index + 1}
              </div>
              <p className="text-gray-800">{strategy}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Expected Results */}
    {plan.summary?.expectedResults && (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Star className="w-6 h-6 text-sport-lime-500 mr-3" />
          Förväntade resultat
        </h3>
        <div className="space-y-4">
          {plan.summary.expectedResults.map((result, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-sport-lime-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">{result}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        icon={Calendar}
        title="Träningspass"
        value="4-6 per vecka"
        color="from-orange-400 to-orange-500"
      />
      <StatCard 
        icon={Apple}
        title="Måltider"
        value="5-6 per dag"
        color="from-green-400 to-green-500"
      />
      <StatCard 
        icon={Moon}
        title="Sömn"
        value="7-9 timmar"
        color="from-blue-400 to-blue-500"
      />
      <StatCard 
        icon={Trophy}
        title="Mål"
        value="12 veckor"
        color="from-purple-400 to-purple-500"
      />
    </div>
  </div>
);

const TrainingTab = ({ plan }) => (
  <div className="bg-white rounded-3xl shadow-lg p-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <Calendar className="w-6 h-6 text-orange-500 mr-3" />
      Träningsschema
    </h3>
    
    {plan.trainingPlan ? (
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-6">
          {plan.trainingPlan}
        </pre>
      </div>
    ) : (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Träningsschema laddas...</p>
      </div>
    )}
  </div>
);

const NutritionTab = ({ plan }) => (
  <div className="bg-white rounded-3xl shadow-lg p-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <Apple className="w-6 h-6 text-green-500 mr-3" />
      Kostplan
    </h3>
    
    {plan.nutritionPlan ? (
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-6">
          {plan.nutritionPlan}
        </pre>
      </div>
    ) : (
      <div className="text-center py-12">
        <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Kostplan laddas...</p>
      </div>
    )}
  </div>
);

const LifestyleTab = ({ plan }) => (
  <div className="bg-white rounded-3xl shadow-lg p-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <Moon className="w-6 h-6 text-blue-500 mr-3" />
      Livsstilsråd
    </h3>
    
    {plan.lifestylePlan ? (
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-6">
          {plan.lifestylePlan}
        </pre>
      </div>
    ) : (
      <div className="text-center py-12">
        <Moon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Livsstilsråd laddas...</p>
      </div>
    )}
  </div>
);

const TrackingTab = ({ plan }) => (
  <div className="bg-white rounded-3xl shadow-lg p-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <Trophy className="w-6 h-6 text-purple-500 mr-3" />
      Uppföljning
    </h3>
    
    {plan.progressTracking ? (
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-6">
          {plan.progressTracking}
        </pre>
      </div>
    ) : (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Uppföljningsplan laddas...</p>
      </div>
    )}
  </div>
);

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white`}>
    <Icon className="w-8 h-8 mb-4" />
    <h4 className="font-semibold text-lg mb-1">{title}</h4>
    <p className="text-white/90">{value}</p>
  </div>
);

export default CoachingResults; 