import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Utensils,
  Heart,
  Trophy,
  MapPin,
  Download,
  Share,
  Calendar,
  Clock,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RaceCoachCalendarPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completedWorkouts, setCompletedWorkouts] = useState({});
  const [showRaceInfo, setShowRaceInfo] = useState(true);
  
  useEffect(() => {
    const navigationPlan = location.state?.plan;
    const storedPlan = localStorage.getItem('raceCoachPlan');
    
    if (navigationPlan) {
      setPlan(navigationPlan);
      localStorage.setItem('raceCoachPlan', JSON.stringify(navigationPlan));
    } else if (storedPlan) {
      setPlan(JSON.parse(storedPlan));
    } else {
      toast.error('Ingen träningsplan hittades');
      navigate('/app/dashboard');
    }
  }, [location.state, navigate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getWorkoutForDate = (date) => {
    if (!plan || !date) return null;
    
    // Get day of week (0 = Sunday, 1 = Monday, etc)
    const dayOfWeek = date.getDay();
    const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
    
    // Find workout from weekly schedule
    if (plan.training?.weeklySchedule) {
      const workout = plan.training.weeklySchedule.find(w => w.day === dayNames[dayOfWeek]);
      if (workout) {
        return {
          ...workout,
          icon: getWorkoutIcon(workout.type)
        };
      }
    }
    
    // Fallback to default schedule
    const defaultSchedule = {
      0: { type: 'Vila', icon: '😴' },
      1: { type: 'Lugn löpning', icon: '🏃', duration: '40 min' },
      2: { type: 'Intervaller', icon: '⚡', duration: '45 min' },
      3: { type: 'Återhämtning', icon: '🚶', duration: '30 min' },
      4: { type: 'Tempopass', icon: '💪', duration: '40 min' },
      5: { type: 'Vila', icon: '😴' },
      6: { type: 'Långpass', icon: '⏱️', duration: '75 min' }
    };
    
    return defaultSchedule[dayOfWeek];
  };

  const getWorkoutIcon = (type) => {
    const iconMap = {
      'Vila': '😴',
      'Lugn löpning': '🏃',
      'Intervaller': '⚡',
      'Tempopass': '💪',
      'Långpass': '⏱️',
      'Återhämtning': '🚶',
      'Styrketräning': '🏋️'
    };
    return iconMap[type] || '🏃';
  };

  const getDailyDetails = (date) => {
    const workout = getWorkoutForDate(date);
    if (!workout) return null;
    
    // Generate daily nutrition based on workout type
    const nutritionMap = {
      'Vila': {
        calories: 2200,
        focus: 'Balanserad kost, fokus på återhämtning',
        meals: {
          breakfast: 'Havregrynsgröt med bär',
          lunch: 'Sallad med protein',
          dinner: 'Fisk med grönsaker',
          snacks: 'Frukt och nötter'
        }
      },
      'Lugn löpning': {
        calories: 2400,
        focus: 'Normal kost med extra kolhydrater',
        meals: {
          breakfast: 'Fullkornsbröd med ägg',
          lunch: 'Pasta med kyckling',
          dinner: 'Ris och grönsaker',
          snacks: 'Banan före löpning'
        }
      },
      'Intervaller': {
        calories: 2600,
        focus: 'Högt kolhydratintag för energi',
        meals: {
          breakfast: 'Pannkakor med sylt',
          lunch: 'Quinoabowl',
          dinner: 'Pasta med köttfärssås',
          snacks: 'Energibar och sportdryck'
        }
      },
      'Långpass': {
        calories: 2800,
        focus: 'Kolhydratladdning dagen innan',
        meals: {
          breakfast: 'Stor portion gröt',
          lunch: 'Ris med kyckling',
          dinner: 'Pasta med lax',
          snacks: 'Energigel under passet'
        }
      }
    };
    
    const nutrition = nutritionMap[workout.type] || nutritionMap['Lugn löpning'];
    
    // Generate tips based on workout and race info
    const tips = generateDailyTips(workout.type, date);
    
    return {
      workout,
      nutrition,
      tips,
      recovery: generateRecoveryPlan(workout.type)
    };
  };

  const generateDailyTips = (workoutType, date) => {
    const tips = {
      'Vila': [
        'Fokusera på stretching och mobility',
        'Drick extra vatten för återhämtning',
        'Gå en promenad för aktiv vila'
      ],
      'Lugn löpning': [
        'Håll ett tempo där du kan prata',
        'Fokus på löpteknik och andning',
        'Avsluta med 5 min stretching'
      ],
      'Intervaller': [
        'Värm upp ordentligt i 15 min',
        'Fokusera på explosivitet',
        'Cool down är extra viktigt idag'
      ],
      'Långpass': [
        'Starta lugnt, öka gradvis',
        'Ta med vatten eller planera vätskestationer',
        'Lyssna på kroppen och justera tempo'
      ]
    };
    
    return tips[workoutType] || ['Lyssna på din kropp', 'Håll dig hydrerad', 'Vila om du känner smärta'];
  };

  const generateRecoveryPlan = (workoutType) => {
    const recovery = {
      'Vila': ['Lätt yoga', 'Foam rolling', 'Tidigt till sängs'],
      'Lugn löpning': ['Stretching 10 min', 'Varm dusch'],
      'Intervaller': ['Isbad', 'Massage', 'Extra protein'],
      'Långpass': ['Kompression', 'Höjd på benen', 'Elektrolyter']
    };
    
    return recovery[workoutType] || ['Stretching', 'Hydrering', 'Vila'];
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleWorkoutComplete = (dateKey) => {
    setCompletedWorkouts(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
    toast.success(completedWorkouts[dateKey] ? 'Träning avmarkerad' : 'Bra jobbat! 💪');
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  if (!plan) return null;

  const days = getDaysInMonth(currentMonth);
  const selectedDateKey = selectedDate?.toISOString().split('T')[0];
  const dailyDetails = getDailyDetails(selectedDate);
  const raceDate = plan.raceDate ? new Date(plan.raceDate) : new Date();
  const daysUntilRace = Math.max(0, Math.floor((raceDate - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Träningskalender</h1>
              <p className="text-gray-600 mt-1">Din personliga plan från AI Coach</p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Delning kommer snart!')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Export kommer snart!')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calendar Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-semibold capitalize">
                  {currentMonth.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                </h2>
                
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  
                  const dateKey = date.toISOString().split('T')[0];
                  const workout = getWorkoutForDate(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();
                  const isCompleted = completedWorkouts[dateKey];
                  const isRaceDay = date.toDateString() === raceDate.toDateString();
                  
                  return (
                    <motion.button
                      key={dateKey}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDateClick(date)}
                      className={`aspect-square p-2 rounded-xl border-2 transition-all ${
                        isRaceDay
                          ? 'border-yellow-500 bg-yellow-50'
                          : isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : isToday
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isCompleted ? 'bg-green-50' : ''}`}
                    >
                      <div className="h-full flex flex-col items-center justify-center">
                        <span className={`text-sm font-medium ${
                          isRaceDay ? 'text-yellow-900' : isSelected ? 'text-purple-900' : isToday ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </span>
                        {workout && (
                          <span className="text-2xl mt-1">{isRaceDay ? '🏆' : workout.icon}</span>
                        )}
                        {isCompleted && !isRaceDay && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Details */}
            {dailyDetails && (
              <motion.div
                key={selectedDateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedDate.toLocaleDateString('sv-SE', { 
                      weekday: 'long', 
                      day: 'numeric',
                      month: 'long'
                    })}
                  </h3>
                  {dailyDetails.workout.type !== 'Vila' && (
                    <button
                      onClick={() => handleWorkoutComplete(selectedDateKey)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        completedWorkouts[selectedDateKey]
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {completedWorkouts[selectedDateKey] ? '✓ Genomförd' : 'Markera som klar'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Workout Section */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{dailyDetails.workout.icon}</span>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{dailyDetails.workout.type}</h4>
                          {dailyDetails.workout.duration && (
                            <p className="text-gray-600">{dailyDetails.workout.duration}</p>
                          )}
                        </div>
                      </div>
                      {dailyDetails.workout.description && (
                        <p className="text-gray-700">{dailyDetails.workout.description}</p>
                      )}
                      {dailyDetails.workout.time && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-purple-600">
                          <Clock className="w-4 h-4" />
                          <span>Rekommenderad tid: {dailyDetails.workout.time}</span>
                        </div>
                      )}
                      {dailyDetails.workout.location && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-purple-600">
                          <MapPin className="w-4 h-4" />
                          <span>{dailyDetails.workout.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Tips Section */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        Dagens tips
                      </h4>
                      <ul className="space-y-2">
                        {dailyDetails.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Nutrition & Recovery Section */}
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-green-600" />
                        Kost & Nutrition
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Dagligt kaloriintag</p>
                          <p className="text-2xl font-bold text-gray-900">{dailyDetails.nutrition.calories} kcal</p>
                        </div>
                        <p className="text-gray-700">{dailyDetails.nutrition.focus}</p>
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Frukost:</span>
                            <span className="text-gray-900">{dailyDetails.nutrition.meals.breakfast}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Lunch:</span>
                            <span className="text-gray-900">{dailyDetails.nutrition.meals.lunch}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Middag:</span>
                            <span className="text-gray-900">{dailyDetails.nutrition.meals.dinner}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Mellanmål:</span>
                            <span className="text-gray-900">{dailyDetails.nutrition.meals.snacks}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-600" />
                        Återhämtning
                      </h4>
                      <ul className="space-y-2">
                        {dailyDetails.recovery.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Race Info Card */}
            <AnimatePresence>
              {showRaceInfo && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden"
                >
                  <button
                    onClick={() => setShowRaceInfo(false)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white"
                  >
                    ×
                  </button>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="w-8 h-8" />
                      <h3 className="text-xl font-bold">Ditt Lopp</h3>
                    </div>
                    
                    <h4 className="text-2xl font-bold mb-2">
                      {plan.race?.name || 'Marathon'}
                    </h4>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{plan.race?.location || 'Din stad'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{raceDate.toLocaleDateString('sv-SE')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>{plan.race?.distance || '42.195 km'}</span>
                      </div>
                    </div>
                    
                    {plan.raceDescription && (
                      <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                        <p className="text-sm leading-relaxed">
                          {plan.raceDescription}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Countdown */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nedräkning</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {daysUntilRace}
                </div>
                <p className="text-gray-600">dagar kvar</p>
                
                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor(daysUntilRace / 7)}
                    </p>
                    <p className="text-xs text-gray-600">veckor</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.values(completedWorkouts).filter(Boolean).length}
                    </p>
                    <p className="text-xs text-gray-600">pass klara</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((Object.values(completedWorkouts).filter(Boolean).length / Math.max(1, Object.keys(completedWorkouts).length)) * 100)}%
                    </p>
                    <p className="text-xs text-gray-600">genomfört</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Veckans översikt</h3>
              <div className="space-y-3">
                {plan.training?.weeklySchedule?.slice(0, 7).map((workout, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getWorkoutIcon(workout.type)}</span>
                      <span className="text-sm text-gray-700">{workout.day}</span>
                    </div>
                    <span className="text-sm text-gray-500">{workout.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
              <Sparkles className="w-6 h-6 text-yellow-500 mb-3" />
              <p className="text-gray-700 italic">
                "Varje steg tar dig närmare målet. Fortsätt kämpa, du klarar det!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceCoachCalendarPage; 