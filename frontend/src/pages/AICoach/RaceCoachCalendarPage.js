import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RaceCoachCalendarPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [completedWorkouts, setCompletedWorkouts] = useState({});
  
  // Helper functions defined first to avoid use-before-define errors
  const getTrainingPhase = useCallback((weeksUntilRace, phases) => {
    // Determine which training phase we're in
    if (weeksUntilRace <= 2) return 'taper';
    if (weeksUntilRace <= 6) return 'peak';
    if (weeksUntilRace <= 12) return 'build';
    return 'base';
  }, []);

  const generateDailyNutrition = useCallback((workoutType) => {
    const nutritionPlans = {
      rest: {
        calories: 2200,
        focus: 'Balanserad kost, fokus på återhämtning',
        hydration: '2-2.5L vatten'
      },
      easy: {
        calories: 2400,
        focus: 'Normal kost, extra kolhydrater',
        hydration: '2.5-3L vatten',
        preworkout: 'Banan 30 min före'
      },
      interval: {
        calories: 2600,
        focus: 'Högt kolhydratintag',
        hydration: '3-3.5L vatten',
        preworkout: 'Toast med honung 1h före',
        postworkout: 'Proteinshake inom 30 min'
      },
      tempo: {
        calories: 2500,
        focus: 'Balanserat protein och kolhydrater',
        hydration: '3L vatten',
        preworkout: 'Havregrynsgröt 2h före'
      },
      long: {
        calories: 2800,
        focus: 'Kolhydratladdning dagen innan',
        hydration: '3.5-4L vatten',
        during: 'Sportdryck var 45 min',
        postworkout: 'Fullständig måltid inom 1h'
      }
    };
    
    return nutritionPlans[workoutType] || nutritionPlans.easy;
  }, []);

  const generateDailyRecovery = useCallback((workoutType) => {
    const recoveryPlans = {
      rest: ['Lätt stretching', 'Foam rolling', 'Tidigt till sängs'],
      easy: ['Stretching 10 min', 'Varm dusch'],
      interval: ['Stretching 15 min', 'Isbad', 'Massage'],
      tempo: ['Stretching 15 min', 'Foam rolling'],
      long: ['Stretching 20 min', 'Kompression', 'Höjd på benen']
    };
    
    return recoveryPlans[workoutType] || recoveryPlans.easy;
  }, []);

  const generateDailyWorkout = useCallback((dayOfWeek, phase, weeksUntilRace, plan) => {
    // Use actual training schedule from AI coach if available
    if (plan.training?.weeklySchedule) {
      const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
      const dayName = dayNames[dayOfWeek];
      
      // Find matching workout from AI coach plan
      const aiWorkout = plan.training.weeklySchedule.find(w => w.day === dayName);
      
      if (aiWorkout) {
        const typeMap = {
          'Vila': { type: 'rest', icon: '😴' },
          'Lugn löpning': { type: 'easy', icon: '🏃' },
          'Intervaller': { type: 'interval', icon: '⚡' },
          'Tempopass': { type: 'tempo', icon: '💪' },
          'Långpass': { type: 'long', icon: '⏱️' },
          'Styrketräning': { type: 'strength', icon: '💪' },
          'Återhämtning': { type: 'recovery', icon: '🚶' }
        };
        
        const workoutType = typeMap[aiWorkout.type] || { type: 'easy', icon: '🏃' };
        
        return {
          type: workoutType.type,
          title: aiWorkout.type,
          duration: aiWorkout.duration,
          icon: workoutType.icon,
          description: aiWorkout.description,
          time: aiWorkout.time,
          location: aiWorkout.location,
          phase,
          nutrition: plan.nutrition ? {
            calories: plan.nutrition.dailyCalories || 2400,
            focus: plan.nutrition.focus || 'Balanserad kost',
            hydration: plan.nutrition.hydration || '2.5-3L vatten',
            preworkout: plan.nutrition.preWorkout,
            postworkout: plan.nutrition.postWorkout
          } : generateDailyNutrition(workoutType.type),
          recovery: plan.recovery ? [
            plan.recovery.weeklyPlan?.stretching || 'Stretching 10-15 min',
            plan.recovery.weeklyPlan?.activeRecovery || 'Lätt aktivitet',
            plan.recovery.sleepPriority || 'God sömn'
          ] : generateDailyRecovery(workoutType.type)
        };
      }
    }
    
    // Fallback to default schedule if no AI plan available
    const workoutSchedule = {
      0: { type: 'rest', title: 'Vila', icon: '😴' },
      1: { type: 'easy', title: 'Lätt löpning', duration: '30-45 min', icon: '🏃' },
      2: { type: 'interval', title: 'Intervaller', duration: '45-60 min', icon: '⚡' },
      3: { type: 'recovery', title: 'Återhämtning', duration: '20-30 min', icon: '🚶' },
      4: { type: 'tempo', title: 'Tempopass', duration: '40-50 min', icon: '💪' },
      5: { type: 'rest', title: 'Vila', icon: '😴' },
      6: { type: 'long', title: 'Långpass', duration: '60-120 min', icon: '⏱️' }
    };
    
    const baseWorkout = workoutSchedule[dayOfWeek];
    
    if (phase === 'taper' && baseWorkout.type !== 'rest') {
      baseWorkout.duration = baseWorkout.duration?.split('-')[0] + ' min';
      baseWorkout.intensity = 'Lätt';
    }
    
    return {
      ...baseWorkout,
      phase,
      nutrition: generateDailyNutrition(baseWorkout.type),
      recovery: generateDailyRecovery(baseWorkout.type)
    };
  }, [generateDailyNutrition, generateDailyRecovery]);

  const generateCalendarEvents = useCallback((plan) => {
    // Generate daily training events based on the plan
    const events = {};
    const startDate = new Date();
    const raceDate = new Date(plan.raceDate);
    
    // Generate events for each day until race
    let currentDate = new Date(startDate);
    while (currentDate <= raceDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      const weeksUntilRace = Math.floor((raceDate - currentDate) / (1000 * 60 * 60 * 24 * 7));
      
      // Determine training phase
      const phase = getTrainingPhase(weeksUntilRace, plan.trainingPhases);
      
      // Generate workout for this day
      events[dateKey] = generateDailyWorkout(dayOfWeek, phase, weeksUntilRace, plan);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add race day
    events[raceDate.toISOString().split('T')[0]] = {
      type: 'race',
      title: plan.race.name,
      description: `${plan.race.distance} i ${plan.race.location}`,
      icon: '🏆',
      color: 'from-yellow-400 to-orange-500'
    };
    
    setPlan({ ...plan, calendarEvents: events });
  }, [generateDailyWorkout, getTrainingPhase]);

  useEffect(() => {
    const navigationPlan = location.state?.plan;
    const storedPlan = localStorage.getItem('raceCoachPlan');
    
    if (navigationPlan) {
      // Convert structured AI coach plan to calendar format
      const calendarPlan = convertStructuredPlanToCalendar(navigationPlan);
      setPlan(calendarPlan);
      localStorage.setItem('raceCoachPlan', JSON.stringify(calendarPlan));
      generateCalendarEvents(calendarPlan);
    } else if (storedPlan) {
      const parsedPlan = JSON.parse(storedPlan);
      setPlan(parsedPlan);
      if (!parsedPlan.calendarEvents) {
        generateCalendarEvents(parsedPlan);
      }
    } else {
      toast.error('Ingen träningsplan hittades');
      navigate('/app/dashboard');
    }
  }, [location.state, navigate, generateCalendarEvents]);

  // Convert structured AI coach plan to calendar format
  const convertStructuredPlanToCalendar = (structuredPlan) => {
    // Extract race info from structured plan
    const race = {
      name: structuredPlan.raceGoal?.name || structuredPlan.goal?.race || 'Ditt Valda Lopp',
      location: structuredPlan.raceGoal?.location || structuredPlan.goal?.location || 'Din Plats',
      distance: structuredPlan.raceGoal?.distance || structuredPlan.goal?.distance || '42.195 km'
    };
    
    // Extract race date from plan or calculate based on training duration
    let raceDate;
    if (structuredPlan.raceGoal?.date) {
      raceDate = new Date(structuredPlan.raceGoal.date);
    } else if (structuredPlan.training?.duration) {
      raceDate = new Date();
      const weeks = parseInt(structuredPlan.training.duration.match(/(\d+)/)?.[1] || '12');
      raceDate.setDate(raceDate.getDate() + (weeks * 7));
    } else {
      raceDate = new Date();
      raceDate.setDate(raceDate.getDate() + (12 * 7)); // Default 12 weeks
    }
    
    return {
      ...structuredPlan,
      race,
      raceDate: raceDate.toISOString(),
      trainingPhases: structuredPlan.training?.phases || [
        { name: 'Grundfas', weeks: 12 },
        { name: 'Uppbyggnadsfas', weeks: 8 },
        { name: 'Toppfas', weeks: 4 },
        { name: 'Nedtrappning', weeks: 2 }
      ]
    };
  };

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
    toast.success(completedWorkouts[dateKey] ? 'Träning avmarkerad' : 'Träning genomförd! 💪');
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('sv-SE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!plan) return null;

  const days = getDaysInMonth(currentMonth);
  const selectedDateKey = selectedDate?.toISOString().split('T')[0];
  const selectedEvent = plan.calendarEvents?.[selectedDateKey];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Träningskalender</h1>
              <p className="text-gray-600 mt-1">
                {plan.race.name} • {new Date(plan.raceDate).toLocaleDateString('sv-SE')}
              </p>
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
          {/* Calendar */}
          <div className="lg:col-span-2">
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
                  const event = plan.calendarEvents?.[dateKey];
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();
                  const isCompleted = completedWorkouts[dateKey];
                  
                  return (
                    <motion.button
                      key={dateKey}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDateClick(date)}
                      className={`aspect-square p-2 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : isToday
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isCompleted ? 'bg-green-50' : ''}`}
                    >
                      <div className="h-full flex flex-col items-center justify-center">
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-purple-900' : isToday ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </span>
                        {event && (
                          <span className="text-2xl mt-1">{event.icon}</span>
                        )}
                        {isCompleted && (
                          <Check className="w-4 h-4 text-green-600 mt-1" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 bg-white rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-3">Förklaring</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏃</span>
                  <span className="text-sm text-gray-600">Lätt löpning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span className="text-sm text-gray-600">Intervaller</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💪</span>
                  <span className="text-sm text-gray-600">Tempo/Styrka</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <span className="text-sm text-gray-600">Långpass</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚶</span>
                  <span className="text-sm text-gray-600">Återhämtning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">😴</span>
                  <span className="text-sm text-gray-600">Vila</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span className="text-sm text-gray-600">Tävling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Genomförd</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily details */}
          <div className="space-y-6">
            {/* Selected day details */}
            {selectedDate && selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedDate)}
                  </h3>
                  {selectedEvent.type !== 'race' && (
                    <button
                      onClick={() => handleWorkoutComplete(selectedDateKey)}
                      className={`p-2 rounded-lg transition-colors ${
                        completedWorkouts[selectedDateKey]
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Workout details */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{selectedEvent.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedEvent.title}</h4>
                        {selectedEvent.duration && (
                          <p className="text-sm text-gray-600">{selectedEvent.duration}</p>
                        )}
                        {selectedEvent.time && (
                          <p className="text-sm text-purple-600">⏰ {selectedEvent.time}</p>
                        )}
                        {selectedEvent.location && (
                          <p className="text-sm text-purple-600">📍 {selectedEvent.location}</p>
                        )}
                      </div>
                    </div>
                    {selectedEvent.description && (
                      <p className="text-sm text-gray-700 mt-2">{selectedEvent.description}</p>
                    )}
                  </div>

                  {/* Nutrition */}
                  {selectedEvent.nutrition && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-green-600" />
                        Kost
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Kalorier: {selectedEvent.nutrition.calories} kcal</p>
                        <p>{selectedEvent.nutrition.focus}</p>
                        <p>Vätska: {selectedEvent.nutrition.hydration}</p>
                        {selectedEvent.nutrition.preworkout && (
                          <p>Före: {selectedEvent.nutrition.preworkout}</p>
                        )}
                        {selectedEvent.nutrition.postworkout && (
                          <p>Efter: {selectedEvent.nutrition.postworkout}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recovery */}
                  {selectedEvent.recovery && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-600" />
                        Återhämtning
                      </h4>
                      <ul className="space-y-1">
                        {selectedEvent.recovery.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Race countdown */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Nedräkning till lopp</h3>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {Math.max(0, Math.floor((new Date(plan.raceDate) - new Date()) / (1000 * 60 * 60 * 24)))}
                </div>
                <p className="text-white/80">dagar kvar</p>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm">{plan.race.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">{plan.race.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">{plan.race.distance}</span>
                </div>
              </div>
            </div>

            {/* Progress summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Din progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Genomförda pass</span>
                    <span className="text-sm font-medium">
                      {Object.values(completedWorkouts).filter(Boolean).length} / {Object.keys(plan.calendarEvents || {}).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(Object.values(completedWorkouts).filter(Boolean).length / Object.keys(plan.calendarEvents || {}).length) * 100}%`
                      }}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Nuvarande fas:</p>
                  <p className="font-medium text-gray-900">
                    {plan.trainingPhases?.find(phase => {
                      const weeksLeft = Math.floor((new Date(plan.raceDate) - new Date()) / (1000 * 60 * 60 * 24 * 7));
                      return weeksLeft >= phase.weeks;
                    })?.name || 'Nedtrappning'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceCoachCalendarPage; 