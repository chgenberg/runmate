import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, ChevronLeft, ChevronRight, Trophy, Activity, 
  Heart, Utensils, Target, MapPin, Clock, CheckCircle,
  Download, Share, Sparkles, Info,
  X, Lightbulb
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RaceCoachCalendarPage = () => {
  const location = useLocation();
  const plan = location.state?.plan || {};
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completedWorkouts, setCompletedWorkouts] = useState({});
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  
  // Parse race date
  const raceDate = plan.raceDate ? new Date(plan.raceDate) : new Date();
  const daysUntilRace = Math.ceil((raceDate - new Date()) / (1000 * 60 * 60 * 24));
  
  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Översikt', icon: Info },
    { id: 'training', label: 'Träning', icon: Activity },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'equipment', label: 'Utrustning', icon: Trophy },
    { id: 'strategy', label: 'Strategi', icon: Target },
    { id: 'recovery', label: 'Återhämtning', icon: Heart }
  ];

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getWorkoutForDate = (date) => {
    if (!plan.training?.weeklySchedule) return null;
    
    const dayOfWeek = date.getDay();
    const weekSchedule = plan.training.weeklySchedule;
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const daySchedule = weekSchedule[dayNames[dayOfWeek]];
    
    if (!daySchedule) return null;
    
    return {
      type: daySchedule.type,
      duration: daySchedule.duration,
      icon: getWorkoutIcon(daySchedule.type)
    };
  };

  const getWorkoutIcon = (type) => {
    const icons = {
      'Distanspass': '🏃',
      'Intervaller': '⚡',
      'Tempopass': '💨',
      'Vila': '😴',
      'Lätt jogg': '🚶',
      'Långpass': '🏔️',
      'Fartlek': '🎯',
      'Återhämtning': '🧘'
    };
    return icons[type] || '🏃';
  };

  const getDailyDetails = (date) => {
    const workout = getWorkoutForDate(date);
    if (!workout) return null;
    
    return {
      workout: {
        ...workout,
        description: generateWorkoutDescription(workout.type),
        time: 'Morgon eller eftermiddag',
        location: workout.type === 'Vila' ? 'Hemma' : 'Löpspår eller gata'
      },
      nutrition: {
        calories: workout.type === 'Vila' ? 2200 : 2800,
        focus: workout.type === 'Vila' 
          ? 'Fokus på återhämtning och protein' 
          : 'Extra kolhydrater för energi',
        meals: {
          frukost: 'Havregrynsgröt med bär och nötter',
          lunch: 'Kycklingsallad med quinoa',
          middag: 'Lax med sötpotatis och grönsaker',
          mellanmål: 'Frukt, nötter och proteinshake'
        }
      },
      tips: generateDailyTips(workout.type, date),
      recovery: generateRecoveryPlan(workout.type)
    };
  };

  const generateWorkoutDescription = (type) => {
    const descriptions = {
      'Distanspass': 'Löp i jämnt tempo, fokus på att bygga uthållighet.',
      'Intervaller': 'Korta intensiva intervaller med vila emellan för att förbättra hastighet.',
      'Tempopass': 'Löp i tävlingstempo för att vänja kroppen vid racefart.',
      'Vila': 'Komplett vila eller lätt stretching. Lyssna på kroppen.',
      'Lätt jogg': 'Avslappnad joggning för aktiv återhämtning.',
      'Långpass': 'Längre distans i lugnt tempo för att bygga uthållighet.',
      'Fartlek': 'Lekfull löpning med varierande tempo.',
      'Återhämtning': 'Lätt aktivitet som promenad eller yoga.'
    };
    return descriptions[type] || 'Följ din träningsplan för dagen.';
  };

  const generateDailyTips = (workoutType, date) => {
    const baseTips = {
      'Vila': [
        'Fokusera på stretching och rörlighet',
        'Drick mycket vatten för återhämtning',
        'Gå en lugn promenad om du känner för det'
      ],
      'Distanspass': [
        'Värm upp ordentligt innan passet',
        'Håll jämnt tempo hela vägen',
        'Fokusera på andningen'
      ],
      'Intervaller': [
        'Extra lång uppvärmning är viktigt',
        'Ge allt under intervallerna',
        'Vila ordentligt mellan intervallerna'
      ]
    };
    
    return baseTips[workoutType] || [
      'Lyssna på kroppen',
      'Håll dig hydrerad',
      'Fokusera på tekniken'
    ];
  };

  const generateRecoveryPlan = (workoutType) => {
    if (workoutType === 'Vila') {
      return ['Lätt stretching', 'Massage eller foam rolling', 'Tidigt till sängs'];
    }
    return ['Stretcha efter passet', 'Proteinrik måltid inom 30 min', 'Minst 8 timmars sömn'];
  };

  const handleDateClick = (date) => {
    if (date) {
      const details = getDailyDetails(date);
      setSelectedDayDetails({ date, ...details });
      setShowDayModal(true);
    }
  };

  const handleWorkoutComplete = (dateKey) => {
    setCompletedWorkouts(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
    toast.success(completedWorkouts[dateKey] ? 'Markering borttagen' : 'Bra jobbat! 💪');
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {plan?.race?.name || 'Träningsplan'}
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {plan?.race?.location} • {plan?.race?.distance} • {daysUntilRace} dagar kvar
              </p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Delning kommer snart!')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Export kommer snart!')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-4 -mb-px">
            <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 md:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 
                    rounded-t-lg font-medium text-sm md:text-base whitespace-nowrap 
                    transition-all
                    ${activeTab === tab.id 
                      ? 'bg-white text-purple-600 border-t-2 border-x-2 border-purple-500' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Race Overview Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    Loppöversikt
                  </h2>
                  <div className="prose prose-lg max-w-none" 
                       dangerouslySetInnerHTML={{ __html: plan?.raceDescription || 'Laddar loppinformation...' }} />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                    <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{daysUntilRace}</p>
                    <p className="text-sm text-gray-600">Dagar kvar</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
                    <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {plan?.training?.weeklySchedule ? Object.keys(plan.training.weeklySchedule).length : 7}
                    </p>
                    <p className="text-sm text-gray-600">Pass/vecka</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                    <Utensils className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{plan?.nutrition?.dailyCalories || 2400}</p>
                    <p className="text-sm text-gray-600">Kalorier/dag</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(completedWorkouts).length}</p>
                    <p className="text-sm text-gray-600">Genomförda</p>
                  </div>
                </div>

                {/* Apple Health Integration Summary */}
                {plan.appleHealthIntegration && plan.appleHealthIntegration.hasData && (
                  <div className="bg-red-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <Heart className="w-6 h-6 text-red-600" />
                      Apple Health Integration
                    </h4>
                    <p className="text-gray-700 mb-4">
                      Din träningsplan har anpassats baserat på din Apple Health-data för mer personliga rekommendationer.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-semibold text-red-900">Aktiviteter</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {plan.appleHealthIntegration.summary?.totalActivities || 0}
                        </p>
                        <p className="text-sm text-gray-600">Totalt importerade</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-semibold text-red-900">Veckodistans</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {plan.appleHealthIntegration.summary?.avgWeeklyDistance || 0}km
                        </p>
                        <p className="text-sm text-gray-600">Genomsnitt per vecka</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-semibold text-red-900">Fitnessnivå</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {plan.appleHealthIntegration.summary?.currentFitnessLevel || 'Okänd'}
                        </p>
                        <p className="text-sm text-gray-600">Baserat på data</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'training' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Träningsplan</h2>
                  
                  {/* Mini Calendar for Training Tab */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        {currentMonth.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigateMonth(-1)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => navigateMonth(1)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Compact Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {['S', 'M', 'T', 'O', 'T', 'F', 'L'].map(day => (
                        <div key={day} className="p-2 text-center font-semibold text-gray-600 text-xs">
                          {day}
                        </div>
                      ))}
                      
                      {days.map((date, index) => {
                        if (!date) {
                          return <div key={index} className="p-2" />;
                        }
                        
                        const dateKey = date.toISOString().split('T')[0];
                        const workout = getWorkoutForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isCompleted = completedWorkouts[dateKey];
                        const isRaceDay = date.toDateString() === raceDate.toDateString();
                        
                        return (
                          <motion.button
                            key={dateKey}
                            onClick={() => handleDateClick(date)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              relative p-2 rounded-lg transition-all text-center
                              ${isRaceDay
                                ? 'bg-yellow-100 border-2 border-yellow-500'
                                : isToday 
                                ? 'bg-blue-100 border-2 border-blue-500' 
                                : 'hover:bg-gray-100 border border-gray-200'
                              }
                              ${isCompleted ? 'bg-green-50' : ''}
                            `}
                          >
                            <span className={`text-xs font-semibold ${
                              isRaceDay ? 'text-yellow-900' : isToday ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {date.getDate()}
                            </span>
                            
                            {workout && (
                              <span className="text-sm block mt-1">
                                {isRaceDay ? '🏆' : workout.icon}
                              </span>
                            )}
                            
                            {isCompleted && !isRaceDay && (
                              <CheckCircle className="w-3 h-3 text-green-500 absolute top-0.5 right-0.5" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  {plan.training?.weeklySchedule && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Veckoschema</h3>
                      <div className="space-y-2">
                        {Object.entries(plan.training.weeklySchedule).map(([day, schedule]) => (
                          <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getWorkoutIcon(schedule.type)}</span>
                              <div>
                                <p className="font-medium capitalize">{day}</p>
                                <p className="text-sm text-gray-600">{schedule.type}</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-700">{schedule.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Nutritionsplan</h2>
                  
                  {plan.nutrition && (
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-green-900 mb-3">Dagligt Intag</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-2xl font-bold text-green-600">
                              {plan.nutrition.dailyCalories || 2400}
                            </p>
                            <p className="text-sm text-gray-600">Kalorier per dag</p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-lg font-semibold text-green-600">
                              {plan.nutrition.hydration?.daily || '3-4L'}
                            </p>
                            <p className="text-sm text-gray-600">Vätskeintag</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-yellow-900 mb-3">Race Week</h4>
                        <p className="text-gray-700 mb-2">
                          {plan.nutrition.raceWeek?.carbLoading || 'Öka kolhydratintaget gradvis'}
                        </p>
                        <p className="text-sm text-gray-600">Fokusera på kolhydrater de sista dagarna</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'equipment' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Utrustningsguide</h2>
                  
                  {plan.equipment && plan.equipment.length > 0 ? (
                    <div className="space-y-4">
                      {plan.equipment.map((item, idx) => (
                        <div key={idx} className="bg-indigo-50 rounded-xl p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-indigo-900">{item.item}</h4>
                              <p className="text-gray-700 mt-1">{item.reason}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              item.priority === 'Kritisk' ? 'bg-red-100 text-red-700' :
                              item.priority === 'Hög' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Checklista</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['GPS-klocka', 'Löparskor (insprungna)', 'Tävlingskläder', 'Energigels', 
                          'Solglasögon', 'Keps/pannband', 'Plåster', 'Vaselin'].map((item, idx) => (
                          <label key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="rounded text-purple-600" />
                            <span className="text-gray-700">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'strategy' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Racedagsstrategi</h2>
                  
                  {plan.raceStrategy && (
                    <div className="space-y-4">
                      <div className="bg-red-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-red-900 mb-3">Pacing</h4>
                        <p className="text-gray-700">{plan.raceStrategy.pacing || 'Starta lugnt och öka gradvis'}</p>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-purple-900 mb-3">Mental Strategi</h4>
                        <ul className="space-y-2">
                          {(plan.raceStrategy.mentalStrategy || []).map((strategy, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              <span className="text-gray-700">{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'recovery' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Återhämtningsplan</h2>
                  
                  {plan.recoveryProtocol && (
                    <div className="space-y-4">
                      <div className="bg-pink-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-pink-900 mb-3">Direkt Efter Loppet</h4>
                        <div className="space-y-3">
                          {Object.entries(plan.recoveryProtocol.immediate || {}).map(([key, value]) => (
                            <div key={key}>
                              <p className="font-medium text-gray-900 capitalize">{key}</p>
                              <p className="text-sm text-gray-600">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-blue-900 mb-3">Sömn</h4>
                        <p className="text-gray-700 mb-3">
                          {plan.recoveryProtocol.sleep?.target || 'Minst 8 timmars sömn per natt'}
                        </p>
                        <ul className="space-y-2">
                          {(plan.recoveryProtocol.sleep?.tips || []).map((tip, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <span className="text-sm text-gray-600">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Day Modal */}
      <AnimatePresence>
        {showDayModal && selectedDayDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDayModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedDayDetails.date.toLocaleDateString('sv-SE', { 
                      weekday: 'long', 
                      day: 'numeric',
                      month: 'long'
                    })}
                  </h3>
                  <button
                    onClick={() => setShowDayModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {selectedDayDetails.workout && (
                  <div className="space-y-6">
                    {/* Workout Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-5xl">{selectedDayDetails.workout.icon}</span>
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900">
                            {selectedDayDetails.workout.type}
                          </h4>
                          {selectedDayDetails.workout.duration && (
                            <p className="text-lg text-gray-600 mt-1">
                              {selectedDayDetails.workout.duration}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedDayDetails.workout.description && (
                        <p className="text-gray-700 text-lg leading-relaxed">
                          {selectedDayDetails.workout.description}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {selectedDayDetails.workout.time && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-purple-600">
                              <Clock className="w-5 h-5" />
                              <span className="font-medium">Rekommenderad tid</span>
                            </div>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {selectedDayDetails.workout.time}
                            </p>
                          </div>
                        )}
                        {selectedDayDetails.workout.location && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-purple-600">
                              <MapPin className="w-5 h-5" />
                              <span className="font-medium">Plats</span>
                            </div>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {selectedDayDetails.workout.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-blue-600" />
                        Dagens tips
                      </h4>
                      <ul className="space-y-3">
                        {selectedDayDetails.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700">
                            <span className="text-blue-500 mt-1 text-xl">•</span>
                            <span className="text-lg">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Nutrition Section */}
                    <div className="bg-green-50 rounded-xl p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-green-600" />
                        Kost & Nutrition
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-white/50 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">Dagligt kaloriintag</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">
                            {selectedDayDetails.nutrition.calories} kcal
                          </p>
                        </div>
                        <p className="text-gray-700 font-medium">
                          {selectedDayDetails.nutrition.focus}
                        </p>
                        <div className="space-y-3 mt-4">
                          {Object.entries(selectedDayDetails.nutrition.meals).map(([meal, food]) => (
                            <div key={meal} className="bg-white/30 rounded-lg p-3">
                              <p className="text-sm text-gray-600 capitalize">{meal}:</p>
                              <p className="text-gray-900 font-medium">{food}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recovery Section */}
                    <div className="bg-red-50 rounded-xl p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-red-600" />
                        Återhämtning
                      </h4>
                      <ul className="space-y-3">
                        {selectedDayDetails.recovery.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700">
                            <span className="text-red-500 mt-1 text-xl">•</span>
                            <span className="text-lg">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Complete Workout Button */}
                    {selectedDayDetails.workout.type !== 'Vila' && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            const dateKey = selectedDayDetails.date.toISOString().split('T')[0];
                            handleWorkoutComplete(dateKey);
                          }}
                          className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                            completedWorkouts[selectedDayDetails.date.toISOString().split('T')[0]]
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                        >
                          {completedWorkouts[selectedDayDetails.date.toISOString().split('T')[0]] ? (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Genomförd
                            </>
                          ) : (
                            'Markera som klar'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RaceCoachCalendarPage; 