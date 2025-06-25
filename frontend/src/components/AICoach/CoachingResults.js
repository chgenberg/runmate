import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Target,
  Calendar,
  Utensils,
  Brain,
  TrendingUp,
  CheckCircle,
  Clock,
  Heart,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  Share
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
    { id: 'progress', label: 'Uppföljning', icon: TrendingUp }
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
                  <Share className="w-5 h-5" />
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
                <CheckCircle className="w-5 h-5 text-green-300" />
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
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Kostplan</h3>
                      <button
                        onClick={() => toggleSection('nutrition')}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        {expandedSections.nutrition ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-xl p-4">
                          <Utensils className="w-6 h-6 text-green-600 mb-2" />
                          <h4 className="font-medium text-green-900">Måltider</h4>
                          <p className="text-green-700 text-sm">5-6 måltider/dag</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4">
                          <Zap className="w-6 h-6 text-yellow-600 mb-2" />
                          <h4 className="font-medium text-yellow-900">Energi</h4>
                          <p className="text-yellow-700 text-sm">Anpassat för dina mål</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <Heart className="w-6 h-6 text-purple-600 mb-2" />
                          <h4 className="font-medium text-purple-900">Näring</h4>
                          <p className="text-purple-700 text-sm">Balanserade makron</p>
                        </div>
                      </div>

                      {expandedSections.nutrition && plan.rawPlan && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Detaljerad kostplan</h4>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {plan.rawPlan.split('LIVSSTILSRÅD:')[0].split('KOSTPLAN:')[1] || 'Detaljerad kostplan genereras...'}
                          </div>
                        </div>
                      )}
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
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Livsstilsråd</h3>
                      <button
                        onClick={() => toggleSection('lifestyle')}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        {expandedSections.lifestyle ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                            <span className="text-white text-sm">😴</span>
                          </div>
                          <h4 className="font-medium text-blue-900">Sömn</h4>
                          <p className="text-blue-700 text-sm">7-9 timmar per natt för optimal återhämtning</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4">
                          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mb-3">
                            <span className="text-white text-sm">🧘</span>
                          </div>
                          <h4 className="font-medium text-indigo-900">Stress</h4>
                          <p className="text-indigo-700 text-sm">Mindfulness och avslappningstekniker</p>
                        </div>
                      </div>

                      {expandedSections.lifestyle && plan.rawPlan && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Detaljerade livsstilsråd</h4>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {plan.rawPlan.split('UPPFÖLJNING:')[0].split('LIVSSTILSRÅD:')[1] || 'Detaljerade livsstilsråd genereras...'}
                          </div>
                        </div>
                      )}
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
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Uppföljning & Mål</h3>
                      <button
                        onClick={() => toggleSection('progress')}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        {expandedSections.progress ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-xl p-4">
                          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                          <h4 className="font-medium text-green-900">Vecka 1-2</h4>
                          <p className="text-green-700 text-sm">Etablera rutiner</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4">
                          <Award className="w-6 h-6 text-orange-600 mb-2" />
                          <h4 className="font-medium text-orange-900">Vecka 3-4</h4>
                          <p className="text-orange-700 text-sm">Första förbättringar</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <Sparkles className="w-6 h-6 text-purple-600 mb-2" />
                          <h4 className="font-medium text-purple-900">Månad 2+</h4>
                          <p className="text-purple-700 text-sm">Märkbara resultat</p>
                        </div>
                      </div>

                      {expandedSections.progress && plan.rawPlan && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Detaljerad uppföljningsplan</h4>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {plan.rawPlan.split('UPPFÖLJNING:')[1] || 'Detaljerad uppföljningsplan genereras...'}
                          </div>
                        </div>
                      )}
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