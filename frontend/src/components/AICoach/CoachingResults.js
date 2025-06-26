import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Share2,
  Target,
  Activity,
  Heart,
  Utensils,
  Moon,
  Brain,
  Smartphone,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  Apple,
  Droplets,
  Flame,
  Shield,
  TrendingUp,
  Award,
  Timer,
  Lightbulb,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Sun,
  Snowflake,
  Wind
} from 'lucide-react';

const CoachingResults = ({ plan, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    training: false,
    nutrition: false,
    lifestyle: false,
    progress: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isVisible || !plan) return null;

  const tabs = [
    { id: 'overview', label: 'Översikt', icon: Target },
    { id: 'training', label: 'Träning', icon: Calendar },
    { id: 'nutrition', label: 'Kost', icon: Utensils },
    { id: 'lifestyle', label: 'Livsstil', icon: Heart },
    { id: 'technology', label: 'Teknologi', icon: Smartphone },
    { id: 'progress', label: 'Uppföljning', icon: TrendingUp },
    { id: 'calendar', label: 'Kalender', icon: Clock }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-500 to-sport-lime-400 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Din personliga tränings- och kostplan</h2>
                  <p className="text-white/80">Skapad av AI Coach med GPT-4o</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                                  <button
                    onClick={onClose}
                    className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                  >
                    ×
                  </button>
              </div>
            </div>

            {/* Success indicators */}
            <div className="flex items-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span className="text-sm">15 frågor analyserade</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm">AI-optimerad plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-300" />
                <span className="text-sm">Personligt anpassad</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-orange-500 text-orange-600 bg-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Summary Cards */}
                  {plan.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Target className="w-6 h-6 text-orange-600" />
                          <h3 className="text-lg font-semibold text-orange-900">Huvudfokus</h3>
                        </div>
                        <p className="text-orange-800 text-lg font-medium">{plan.summary.primaryFocus}</p>
                        <p className="text-orange-600 text-sm mt-2">{plan.summary.weeklyCommitment}</p>
                      </div>

                      <div className="bg-gradient-to-br from-sport-lime-50 to-sport-lime-100 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Zap className="w-6 h-6 text-sport-lime-600" />
                          <h3 className="text-lg font-semibold text-sport-lime-900">Förväntade resultat</h3>
                        </div>
                        <div className="space-y-2">
                          {plan.summary.expectedResults?.map((result, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-sport-lime-500 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-sport-lime-800 text-sm">{result}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Strategies */}
                  {plan.summary?.keyStrategies && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Nyckelstrategier för din framgång</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plan.summary.keyStrategies.map((strategy, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-sport-lime-400 rounded-lg flex items-center justify-center mb-3">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{strategy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Generated Plan Preview */}
                  {plan.rawPlan && (
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Brain className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-900">AI-genererad planöversikt</h3>
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">GPT-4o</span>
                      </div>
                      <div className="bg-white rounded-xl p-4 max-h-64 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {plan.rawPlan.substring(0, 800)}...
                        </pre>
                      </div>
                      <button
                        onClick={() => setActiveTab('training')}
                        className="mt-4 text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Se detaljerad plan →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'training' && (
                <motion.div
                  key="training"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Träningsschema</h3>
                      <button
                        onClick={() => toggleSection('training')}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        {expandedSections.training ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {plan.trainingPlan && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-orange-50 rounded-xl p-4">
                            <Calendar className="w-6 h-6 text-orange-600 mb-2" />
                            <h4 className="font-medium text-orange-900">Frekvens</h4>
                            <p className="text-orange-700 text-sm">3-4 pass per vecka</p>
                          </div>
                          <div className="bg-sport-lime-50 rounded-xl p-4">
                            <Clock className="w-6 h-6 text-sport-lime-600 mb-2" />
                            <h4 className="font-medium text-sport-lime-900">Duration</h4>
                            <p className="text-sport-lime-700 text-sm">30-60 minuter</p>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-4">
                            <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
                            <h4 className="font-medium text-blue-900">Progression</h4>
                            <p className="text-blue-700 text-sm">Gradvis ökning</p>
                          </div>
                        </div>

                        {expandedSections.training && plan.rawPlan && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Detaljerat träningsschema</h4>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {plan.rawPlan.split('KOSTPLAN:')[0].split('TRÄNINGSSCHEMA:')[1] || 'Detaljerat schema genereras...'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'nutrition' && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Komplett kostplan & näringsstrategi</h3>
                    
                    {/* Macro Targets */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Makronutrient-mål</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-bold">C</span>
                            </div>
                            <h5 className="font-semibold text-green-900">Kolhydrater</h5>
                          </div>
                          <p className="text-green-700 text-lg font-medium">
                            {plan.nutritionPlan?.macroTargets?.carbs || '45-65% av totala kalorier'}
                          </p>
                          <p className="text-green-600 text-sm mt-1">Energi för träning</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-bold">P</span>
                            </div>
                            <h5 className="font-semibold text-orange-900">Protein</h5>
                          </div>
                          <p className="text-orange-700 text-lg font-medium">
                            {plan.nutritionPlan?.macroTargets?.protein || '15-25% av totala kalorier'}
                          </p>
                          <p className="text-orange-600 text-sm mt-1">Muskelbyggnad & återhämtning</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-bold">F</span>
                            </div>
                            <h5 className="font-semibold text-purple-900">Fett</h5>
                          </div>
                          <p className="text-purple-700 text-lg font-medium">
                            {plan.nutritionPlan?.macroTargets?.fat || '20-35% av totala kalorier'}
                          </p>
                          <p className="text-purple-600 text-sm mt-1">Hormonproduktion & mättnad</p>
                        </div>
                      </div>
                    </div>

                    {/* Daily Meal Plan */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Daglig måltidsplan</h4>
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sun className="w-5 h-5 text-yellow-600" />
                            <h5 className="font-medium text-yellow-900">Frukost</h5>
                            <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">07:00</span>
                          </div>
                          <p className="text-yellow-800 text-sm">
                            {plan.nutritionPlan?.dailyMealPlans?.breakfast || 'Havregrynsgröt med bär och nötter, kaffe'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Utensils className="w-5 h-5 text-green-600" />
                            <h5 className="font-medium text-green-900">Lunch</h5>
                            <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">12:00</span>
                          </div>
                          <p className="text-green-800 text-sm">
                            {plan.nutritionPlan?.dailyMealPlans?.lunch || 'Quinoasallad med kyckling och grönsaker'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Moon className="w-5 h-5 text-blue-600" />
                            <h5 className="font-medium text-blue-900">Middag</h5>
                            <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full">18:00</span>
                          </div>
                          <p className="text-blue-800 text-sm">
                            {plan.nutritionPlan?.dailyMealPlans?.dinner || 'Lax med sötpotatis och broccoli'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Apple className="w-5 h-5 text-purple-600" />
                            <h5 className="font-medium text-purple-900">Mellanmål</h5>
                            <span className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded-full">2-3 st/dag</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {plan.nutritionPlan?.dailyMealPlans?.snacks?.map((snack, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {snack}
                              </span>
                            )) || [
                              'Frukt och nötter',
                              'Yoghurt med granola',
                              'Proteinshake'
                            ].map((snack, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {snack}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hydration Strategy */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">💧 Hydratiseringsstrategi</h4>
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-cyan-900 mb-3">Dagligt intag</h5>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Droplets className="w-4 h-4 text-cyan-500" />
                                <span className="text-sm text-cyan-800">
                                  {plan.nutritionPlan?.hydrationStrategy?.daily || '35ml per kg kroppsvikt'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-cyan-900 mb-3">Träningsdagar</h5>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-cyan-500" />
                                <span className="text-sm text-cyan-800">
                                  {plan.nutritionPlan?.hydrationStrategy?.duringWorkout || '150-250ml var 15-20 min'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Supplementation */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">🧪 Supplementering</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4">
                          <h5 className="font-medium text-emerald-900 mb-3">Grundläggande</h5>
                          <ul className="space-y-2">
                            {plan.nutritionPlan?.supplementation?.essential?.map((supplement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Shield className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-emerald-700">{supplement}</span>
                              </li>
                            )) || [
                              'Vitamin D3',
                              'Omega-3',
                              'Magnesium'
                            ].map((supplement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Shield className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-emerald-700">{supplement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                          <h5 className="font-medium text-orange-900 mb-3">Prestanda</h5>
                          <ul className="space-y-2">
                            {plan.nutritionPlan?.supplementation?.performance?.map((supplement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Zap className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-orange-700">{supplement}</span>
                              </li>
                            )) || [
                              'Kreatin',
                              'Beta-alanin',
                              'Koffein'
                            ].map((supplement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Zap className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-orange-700">{supplement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                          <h5 className="font-medium text-blue-900 mb-3">Återhämtning</h5>
                          <ul className="space-y-2">
                            {plan.nutritionPlan?.supplementation?.recovery?.map((supplement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Heart className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-blue-700">{supplement}</span>
                              </li>
                            )) || [
                              'Protein pulver',
                              'BCAA',
                              'Tart cherry juice'
                            ].map((supplement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Heart className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-blue-700">{supplement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Sample Recipes */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">👨‍🍳 Exempelrecept</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.nutritionPlan?.recipes?.map((recipe, index) => (
                          <div key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4">
                            <h5 className="font-medium text-amber-900 mb-2">{recipe.name}</h5>
                            <div className="mb-3">
                              <h6 className="text-sm font-medium text-amber-800 mb-1">Ingredienser:</h6>
                              <div className="flex flex-wrap gap-1">
                                {recipe.ingredients.map((ingredient, i) => (
                                  <span key={i} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-amber-700">{recipe.instructions}</p>
                          </div>
                        )) || [
                          {
                            name: 'Energirik frukost',
                            ingredients: ['Havregryn', 'Banan', 'Blåbär', 'Mandelmjöl', 'Honung'],
                            instructions: 'Blanda allt och låt stå 10 minuter'
                          },
                          {
                            name: 'Post-workout smoothie',
                            ingredients: ['Proteinpulver', 'Banan', 'Spenat', 'Mandelmjöl', 'Is'],
                            instructions: 'Mixa alla ingredienser tills slätt'
                          }
                        ].map((recipe, index) => (
                          <div key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4">
                            <h5 className="font-medium text-amber-900 mb-2">{recipe.name}</h5>
                            <div className="mb-3">
                              <h6 className="text-sm font-medium text-amber-800 mb-1">Ingredienser:</h6>
                              <div className="flex flex-wrap gap-1">
                                {recipe.ingredients.map((ingredient, i) => (
                                  <span key={i} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-amber-700">{recipe.instructions}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'lifestyle' && (
                <motion.div
                  key="lifestyle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Sleep Optimization */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Sömnoptimering & återhämtning</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Moon className="w-8 h-8 text-blue-600" />
                          <h4 className="text-lg font-semibold text-blue-900">Sömnrutiner</h4>
                        </div>
                        <div className="space-y-3">
                          {plan.lifestylePlan?.sleepOptimization?.bedtimeRoutine?.map((routine, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-blue-800">{routine}</span>
                            </div>
                          )) || [
                            'Stäng av skärmar 1 timme innan',
                            'Läs bok eller meditation',
                            'Mörkt och svalt rum'
                          ].map((routine, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-blue-800">{routine}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Brain className="w-8 h-8 text-purple-600" />
                          <h4 className="text-lg font-semibold text-purple-900">Mental träning</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-purple-800">
                              {plan.lifestylePlan?.mentalTraining?.visualization || '5-10 min daglig målvisualisering'}
                            </span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-purple-800">
                              {plan.lifestylePlan?.mentalTraining?.mindfulness || 'Närvarande under träning, fokus på andning'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Biohacking Section */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">🔬 Biohacking & optimering</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Snowflake className="w-6 h-6 text-cyan-600" />
                          <h5 className="font-medium text-cyan-900">Kyllexponering</h5>
                        </div>
                        <p className="text-sm text-cyan-700">
                          {plan.lifestylePlan?.biohacking?.coldExposure || 'Kall dusch 2-3 min dagligen'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Flame className="w-6 h-6 text-red-600" />
                          <h5 className="font-medium text-red-900">Värmeterapi</h5>
                        </div>
                        <p className="text-sm text-red-700">
                          {plan.lifestylePlan?.biohacking?.heatTherapy || 'Sauna 15-20 min 2-3x/vecka'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Wind className="w-6 h-6 text-green-600" />
                          <h5 className="font-medium text-green-900">Andningsteknik</h5>
                        </div>
                        <p className="text-sm text-green-700">
                          {plan.lifestylePlan?.biohacking?.breathwork || 'Wim Hof metod eller Box breathing'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Sun className="w-6 h-6 text-yellow-600" />
                          <h5 className="font-medium text-yellow-900">Ljusterapi</h5>
                        </div>
                        <p className="text-sm text-yellow-700">
                          {plan.lifestylePlan?.biohacking?.lightTherapy || 'Morgonljus 10-15 min, blåljusfilter kvällar'}
                        </p>
                      </div>
                    </div>

                    {/* Circadian Optimization */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">🌅 Circadian rytm-optimering</h4>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-amber-900 mb-3">Morgonrutiner</h5>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <Sun className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-amber-800">
                                {plan.lifestylePlan?.circadianOptimization?.morningLight || 'Naturligt ljus inom 30 min efter uppvaknande'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-amber-900 mb-3">Kvällsrutiner</h5>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <Moon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-amber-800">
                                {plan.lifestylePlan?.circadianOptimization?.eveningDimming || 'Dimma ljus 2 timmar innan sänggåendet'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stress Management */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 mt-8">🧘‍♂️ Avancerad stresshantering</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4">
                        <h5 className="font-medium text-emerald-900 mb-3">Dagliga praktiker</h5>
                        <ul className="space-y-2">
                          {plan.lifestylePlan?.stressManagement?.dailyPractices?.map((practice, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-emerald-700">{practice}</span>
                            </li>
                          )) || [
                            '10 min meditation',
                            'Djupandning',
                            'Gratitudjournal'
                          ].map((practice, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-emerald-700">{practice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4">
                        <h5 className="font-medium text-teal-900 mb-3">Veckoaktiviteter</h5>
                        <ul className="space-y-2">
                          {plan.lifestylePlan?.stressManagement?.weeklyActivities?.map((activity, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-teal-700">{activity}</span>
                            </li>
                          )) || [
                            'Yoga',
                            'Naturpromenader',
                            'Social tid'
                          ].map((activity, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-teal-700">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4">
                        <h5 className="font-medium text-rose-900 mb-3">Varningssignaler</h5>
                        <ul className="space-y-2">
                          {plan.lifestylePlan?.stressManagement?.stressSignals?.map((signal, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-rose-700">{signal}</span>
                            </li>
                          )) || [
                            'Förhöjd vilopuls',
                            'Sömnproblem',
                            'Irritation'
                          ].map((signal, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-rose-700">{signal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'technology' && (
                <motion.div
                  key="technology"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Recommended Apps */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Rekommenderade appar & verktyg</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {plan.technologyPlan?.recommendedApps?.map((app, index) => (
                        <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{app.name}</h4>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{app.category}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{app.purpose}</p>
                        </div>
                      )) || [
                        { name: 'Strava', purpose: 'Träningsspårning och community', category: 'Träning' },
                        { name: 'MyFitnessPal', purpose: 'Kaloriräkning och näring', category: 'Näring' },
                        { name: 'Headspace', purpose: 'Meditation och mindfulness', category: 'Mental hälsa' },
                        { name: 'Sleep Cycle', purpose: 'Sömnanalys och väckning', category: 'Sömn' }
                      ].map((app, index) => (
                        <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{app.name}</h4>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{app.category}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{app.purpose}</p>
                        </div>
                      ))}
                    </div>

                    {/* Wearables */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Rekommenderade wearables</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {plan.technologyPlan?.wearables?.map((device, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <Activity className="w-6 h-6 text-green-600" />
                            <h5 className="font-medium text-gray-900">{device.device}</h5>
                          </div>
                          <p className="text-sm text-gray-600">{device.features}</p>
                        </div>
                      )) || [
                        { device: 'Garmin Forerunner', features: 'GPS, pulsmätning, träningsanalys' },
                        { device: 'Oura Ring', features: 'Sömn, HRV, återhämtning' },
                        { device: 'Apple Watch', features: 'Allround spårning, appar' },
                        { device: 'Polar H10', features: 'Exakt pulsmätning' }
                      ].map((device, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <Activity className="w-6 h-6 text-green-600" />
                            <h5 className="font-medium text-gray-900">{device.device}</h5>
                          </div>
                          <p className="text-sm text-gray-600">{device.features}</p>
                        </div>
                      ))}
                    </div>

                    {/* Automation Tips */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Automationsförslag</h4>
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4">
                      <ul className="space-y-2">
                        {plan.technologyPlan?.automationTips?.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{tip}</span>
                          </li>
                        )) || [
                          'Synka träningsdata automatiskt mellan appar',
                          'Ställ in påminnelser för måltider och hydratisering',
                          'Automatisk sömnspårning med smart klocka',
                          'Veckovis analys av träningsdata',
                          'Push-notiser för återhämtningsmätningar'
                        ].map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'progress' && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Enhanced Progress Tracking */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Avancerad uppföljning & analys</h3>
                    
                    {/* Weekly Metrics */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Veckovisa mätningar</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plan.progressTracking?.weeklyMetrics?.map((metric, index) => (
                          <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <BarChart3 className="w-5 h-5 text-blue-600" />
                              <h5 className="font-medium text-gray-900">{metric.metric}</h5>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{metric.target}</p>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{metric.unit}</span>
                          </div>
                        )) || [
                          { metric: 'Total löpdistans', target: 'Progressiv ökning', unit: 'km' },
                          { metric: 'Genomsnittspuls', target: 'Stabil eller sjunkande', unit: 'slag/min' },
                          { metric: 'Sömnkvalitet', target: '7-9 timmar', unit: 'timmar' },
                          { metric: 'Energinivå', target: '7-8/10', unit: 'skala' },
                          { metric: 'Återhämtning', target: 'God HRV', unit: 'ms' }
                        ].map((metric, index) => (
                          <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <BarChart3 className="w-5 h-5 text-blue-600" />
                              <h5 className="font-medium text-gray-900">{metric.metric}</h5>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{metric.target}</p>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{metric.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Biomarkers */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Biomarkörer att följa</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.progressTracking?.biomarkers?.map((marker, index) => (
                          <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Heart className="w-5 h-5 text-green-600" />
                              <h5 className="font-medium text-gray-900">{marker.marker}</h5>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Optimal: {marker.optimal}</p>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{marker.frequency}</span>
                          </div>
                        )) || [
                          { marker: 'Vilopuls', optimal: '40-60 slag/min', frequency: 'Dagligen' },
                          { marker: 'HRV', optimal: 'Individuell baseline', frequency: 'Dagligen' },
                          { marker: 'Sömneffektivitet', optimal: '>85%', frequency: 'Dagligen' },
                          { marker: 'Stressnivå', optimal: '<30% av dagen', frequency: 'Dagligen' }
                        ].map((marker, index) => (
                          <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Heart className="w-5 h-5 text-green-600" />
                              <h5 className="font-medium text-gray-900">{marker.marker}</h5>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Optimal: {marker.optimal}</p>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{marker.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 8-Week Milestones */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">8-veckors milstolpar</h4>
                      <div className="space-y-3">
                        {plan.progressTracking?.milestones?.map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {milestone.week}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{milestone.target}</h5>
                              <p className="text-sm text-gray-600">{milestone.celebration}</p>
                            </div>
                            <div className="flex space-x-1">
                              {milestone.metrics.map((metric, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                  {metric}
                                </span>
                              ))}
                            </div>
                          </div>
                        )) || Array.from({length: 8}, (_, i) => ({
                          week: i + 1,
                          target: i < 2 ? 'Etablera rutiner' : i < 4 ? 'Förbättra uthållighet' : i < 6 ? 'Öka intensitet' : 'Maximera prestanda',
                          metrics: ['Distans', 'Tid', 'Återhämtning'],
                          celebration: (i + 1) % 2 === 0 ? 'Belöna dig själv med något kul!' : 'Reflektera över framstegen'
                        })).map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {milestone.week}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{milestone.target}</h5>
                              <p className="text-sm text-gray-600">{milestone.celebration}</p>
                            </div>
                            <div className="flex space-x-1">
                              {milestone.metrics.map((metric, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                  {metric}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'calendar' && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">8-veckors träningskalender</h3>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                        Exportera till kalender
                      </button>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="space-y-6">
                      {Array.from({length: 8}, (_, weekIndex) => (
                        <div key={weekIndex} className="border border-gray-200 rounded-xl p-4">
                          <h4 className="font-semibold text-gray-900 mb-4">Vecka {weekIndex + 1}</h4>
                          <div className="grid grid-cols-7 gap-2">
                            {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((day, dayIndex) => {
                              const daySchedule = {
                                0: { title: 'Lätt löpning + styrka', duration: 75, type: 'training' },
                                1: { title: 'Intervallträning', duration: 45, type: 'training' },
                                2: { title: 'Vila eller yoga', duration: 30, type: 'recovery' },
                                3: { title: 'Medeldistans', duration: 60, type: 'training' },
                                4: { title: 'Vila/lätt aktivitet', duration: 30, type: 'recovery' },
                                5: { title: 'Lång löpning', duration: 90 + (weekIndex * 10), type: 'training' },
                                6: { title: 'Aktiv vila', duration: 45, type: 'recovery' }
                              }[dayIndex];

                              return (
                                <div key={dayIndex} className="min-h-[100px]">
                                  <div className="text-xs font-medium text-gray-500 mb-1">{day}</div>
                                  {daySchedule && (
                                    <div className={`p-2 rounded-lg text-xs ${
                                      daySchedule.type === 'training' 
                                        ? 'bg-gradient-to-br from-orange-100 to-red-100 text-orange-800' 
                                        : 'bg-gradient-to-br from-green-100 to-teal-100 text-green-800'
                                    }`}>
                                      <div className="font-medium mb-1">{daySchedule.title}</div>
                                      <div className="flex items-center space-x-1">
                                        <Timer className="w-3 h-3" />
                                        <span>{daySchedule.duration}min</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Integration Instructions */}
                    <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Kalenderintegration</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                          <div>
                            <h5 className="font-medium text-gray-900">Exportera träningspass</h5>
                            <p className="text-sm text-gray-600">Klicka på "Exportera till kalender" för att få en ICS-fil</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                          <div>
                            <h5 className="font-medium text-gray-900">Importera till din kalender</h5>
                            <p className="text-sm text-gray-600">Öppna filen i Google Calendar, Apple Calendar eller Outlook</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                          <div>
                            <h5 className="font-medium text-gray-900">Få påminnelser</h5>
                            <p className="text-sm text-gray-600">Ställ in notifikationer för att aldrig missa ett träningspass</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Din plan uppdateras automatiskt baserat på dina framsteg</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Spara som PDF
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-sport-lime-400 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Stäng
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CoachingResults; 