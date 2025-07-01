import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Mountain,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import AILoadingScreen from './AILoadingScreen';

const RaceCoachOnboarding = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [races, setRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const navigate = useNavigate();

  // Load races on mount
  useEffect(() => {
    const loadRaces = async () => {
      try {
        const response = await api.get('/races/race-files');
        if (response.data.success) {
          setRaces(response.data.races);
          setFilteredRaces(response.data.races);
        }
      } catch (error) {
        console.error('Error loading races:', error);
      } finally {
        setLoadingRaces(false);
      }
    };
    
    if (isOpen) {
      loadRaces();
    }
  }, [isOpen]);

  // Filter races based on search
  useEffect(() => {
    const filtered = races.filter(race => {
      const name = race.name || '';
      const location = race.location || '';
      const searchLower = searchTerm.toLowerCase();
      
      return name.toLowerCase().includes(searchLower) ||
             location.toLowerCase().includes(searchLower);
    });
    setFilteredRaces(filtered);
  }, [searchTerm, races]);

  const questions = [
    {
      id: 'race_selection',
      type: 'race_picker',
      question: 'Vilket lopp vill du förbereda dig för?',
      description: 'Välj från de 50 största loppen i världen'
    },
    {
      id: 'race_date',
      type: 'date_picker',
      question: 'När ska du springa loppet?',
      description: 'Välj datum så vi kan planera din träning'
    },
    {
      id: 'current_fitness',
      type: 'single',
      question: 'Hur skulle du beskriva din nuvarande kondition?',
      options: [
        { value: 'beginner', label: 'Nybörjare - Kan knappt springa 5km', icon: '🌱' },
        { value: 'recreational', label: 'Motionär - Springer regelbundet', icon: '🏃' },
        { value: 'experienced', label: 'Erfaren - Har sprungit flera lopp', icon: '💪' },
        { value: 'competitive', label: 'Tävlingslöpare - Tränar seriöst', icon: '🏆' }
      ]
    },
    {
      id: 'weekly_runs',
      type: 'single',
      question: 'Hur många gånger per vecka kan du träna?',
      options: [
        { value: '2-3', label: '2-3 gånger', icon: '📅' },
        { value: '3-4', label: '3-4 gånger', icon: '📆' },
        { value: '4-5', label: '4-5 gånger', icon: '🗓️' },
        { value: '5-6', label: '5-6 gånger', icon: '📊' },
        { value: '6+', label: '6+ gånger', icon: '🚀' }
      ]
    },
    {
      id: 'longest_recent_run',
      type: 'single',
      question: 'Vad är din längsta löprunda senaste månaden?',
      options: [
        { value: '0-5', label: '0-5 km', icon: '🏁' },
        { value: '5-10', label: '5-10 km', icon: '🏃‍♂️' },
        { value: '10-15', label: '10-15 km', icon: '🏃‍♀️' },
        { value: '15-21', label: '15-21 km', icon: '🏅' },
        { value: '21-30', label: '21-30 km', icon: '🥇' },
        { value: '30+', label: '30+ km', icon: '🏆' }
      ]
    },
    {
      id: 'race_goal',
      type: 'single',
      question: 'Vad är ditt mål med loppet?',
      options: [
        { value: 'finish', label: 'Bara ta mig i mål', icon: '🎯' },
        { value: 'enjoy', label: 'Njuta av upplevelsen', icon: '😊' },
        { value: 'pb', label: 'Sätta personbästa', icon: '⚡' },
        { value: 'podium', label: 'Topplacering', icon: '🥇' }
      ]
    },
    {
      id: 'target_time',
      type: 'text',
      question: 'Har du en måltid för loppet?',
      placeholder: 'T.ex. 3:30:00 eller "Ingen specifik tid"',
      validation: (value) => value && value.trim().length > 0
    },
    {
      id: 'cross_training',
      type: 'multiple',
      question: 'Vilken annan träning gör du?',
      options: [
        { value: 'gym', label: 'Gym/Styrketräning', icon: '🏋️' },
        { value: 'cycling', label: 'Cykling', icon: '🚴' },
        { value: 'swimming', label: 'Simning', icon: '🏊' },
        { value: 'yoga', label: 'Yoga/Stretching', icon: '🧘' },
        { value: 'none', label: 'Ingen annan träning', icon: '❌' }
      ]
    },
    {
      id: 'injury_history',
      type: 'text',
      question: 'Har du några skador eller fysiska begränsningar?',
      placeholder: 'Beskriv eventuella skador eller skriv "Inga skador"',
      validation: (value) => value && value.trim().length > 0
    },
    {
      id: 'nutrition_habits',
      type: 'single',
      question: 'Hur skulle du beskriva dina kostvanor?',
      options: [
        { value: 'excellent', label: 'Utmärkta - Mycket medveten', icon: '🥗' },
        { value: 'good', label: 'Bra - Försöker äta hälsosamt', icon: '🍎' },
        { value: 'average', label: 'OK - Kan förbättras', icon: '🍽️' },
        { value: 'poor', label: 'Dåliga - Behöver hjälp', icon: '🍔' }
      ]
    },
    {
      id: 'sleep_hours',
      type: 'single',
      question: 'Hur många timmar sover du per natt?',
      options: [
        { value: '5-6', label: '5-6 timmar', icon: '😴' },
        { value: '6-7', label: '6-7 timmar', icon: '😊' },
        { value: '7-8', label: '7-8 timmar', icon: '😃' },
        { value: '8+', label: '8+ timmar', icon: '🤩' }
      ]
    },
    {
      id: 'recovery_priority',
      type: 'single',
      question: 'Hur prioriterar du återhämtning?',
      options: [
        { value: 'high', label: 'Högt - Stretching, foam rolling, etc', icon: '💯' },
        { value: 'medium', label: 'Medel - Gör det ibland', icon: '👍' },
        { value: 'low', label: 'Lågt - Sällan eller aldrig', icon: '🤷' }
      ]
    },
    {
      id: 'race_experience',
      type: 'single',
      question: 'Har du sprungit liknande lopp tidigare?',
      options: [
        { value: 'never', label: 'Aldrig', icon: '🆕' },
        { value: '1-2', label: '1-2 lopp', icon: '✌️' },
        { value: '3-5', label: '3-5 lopp', icon: '🖐️' },
        { value: '5+', label: '5+ lopp', icon: '💪' }
      ]
    },
    {
      id: 'training_preference',
      type: 'multiple',
      question: 'Vilken typ av träning föredrar du?',
      options: [
        { value: 'intervals', label: 'Intervaller', icon: '⚡' },
        { value: 'tempo', label: 'Tempopass', icon: '🏃' },
        { value: 'long', label: 'Långpass', icon: '⏱️' },
        { value: 'easy', label: 'Lugna pass', icon: '🚶' },
        { value: 'hills', label: 'Backlöpning', icon: '⛰️' }
      ]
    },
    {
      id: 'equipment',
      type: 'multiple',
      question: 'Vilken träningsutrustning har du tillgång till?',
      options: [
        { value: 'watch', label: 'GPS-klocka', icon: '⌚' },
        { value: 'hr', label: 'Pulsmätare', icon: '❤️' },
        { value: 'treadmill', label: 'Löpband', icon: '🏃‍♂️' },
        { value: 'track', label: 'Löparbana', icon: '🏟️' },
        { value: 'trails', label: 'Terrängstigar', icon: '🌲' }
      ]
    },
    {
      id: 'biggest_challenge',
      type: 'text',
      question: 'Vad ser du som din största utmaning inför loppet?',
      placeholder: 'T.ex. "Distansen", "Höjdmeter", "Tidsbrist"...',
      validation: (value) => value && value.trim().length > 0
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleRaceSelect = (race) => {
    setSelectedRace(race);
    setAnswers({ ...answers, selectedRace: race });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setAnswers({ ...answers, raceDate: date });
  };

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Calculate weeks until race
      const raceDate = new Date(answers.raceDate);
      const today = new Date();
      const weeksUntilRace = Math.floor((raceDate - today) / (1000 * 60 * 60 * 24 * 7));
      
      const planData = {
        ...answers,
        weeksUntilRace,
        raceDetails: selectedRace
      };

      const response = await api.post('/aicoach/race-plan', planData);
      
      if (response.data.success) {
        navigate('/app/race-coach-calendar', {
          state: { plan: response.data.plan },
          replace: true
        });
        onClose();
      }
    } catch (error) {
      console.error('Error creating race plan:', error);
      // Create fallback plan
      const fallbackPlan = generateFallbackPlan(answers, selectedRace);
      navigate('/app/race-coach-calendar', {
        state: { plan: fallbackPlan },
        replace: true
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackPlan = (answers, race) => {
    // Generate a comprehensive training plan based on the answers
    const raceDate = new Date(answers.raceDate);
    const today = new Date();
    const weeksUntilRace = Math.floor((raceDate - today) / (1000 * 60 * 60 * 24 * 7));
    
    return {
      race: race,
      raceDate: answers.raceDate,
      weeksUntilRace,
      trainingPhases: generateTrainingPhases(weeksUntilRace, answers),
      weeklySchedule: generateWeeklySchedule(answers),
      nutritionPlan: generateNutritionPlan(answers),
      recoveryProtocol: generateRecoveryProtocol(answers)
    };
  };

  const generateTrainingPhases = (weeks, answers) => {
    // Logic to generate training phases based on weeks until race
    const phases = [];
    
    if (weeks > 16) {
      phases.push({
        name: 'Basbyggande',
        weeks: Math.floor(weeks * 0.3),
        focus: 'Bygga aerob kapacitet'
      });
    }
    
    phases.push({
      name: 'Uppbyggnad',
      weeks: Math.floor(weeks * 0.4),
      focus: 'Öka volym och intensitet'
    });
    
    phases.push({
      name: 'Toppning',
      weeks: Math.floor(weeks * 0.2),
      focus: 'Racefart och specifik träning'
    });
    
    phases.push({
      name: 'Nedtrappning',
      weeks: 2,
      focus: 'Vila och förberedelse'
    });
    
    return phases;
  };

  const generateWeeklySchedule = (answers) => {
    // Generate weekly schedule based on training frequency
    const frequency = answers.weekly_runs;
    const schedule = {};
    
    // Logic to create schedule based on frequency
    console.log('Generating schedule for frequency:', frequency);
    return schedule;
  };

  const generateNutritionPlan = (answers) => {
    // Generate nutrition plan based on goals and habits
    return {
      dailyCalories: calculateDailyCalories(answers),
      macros: { carbs: '50%', protein: '25%', fat: '25%' },
      preworkout: 'Banan och vatten 1-2h före',
      postworkout: 'Protein och kolhydrater inom 30 min'
    };
  };

  const generateRecoveryProtocol = (answers) => {
    // Generate recovery protocol based on priority
    return {
      stretching: '10-15 min efter varje pass',
      foamRolling: answers.recovery_priority === 'high' ? 'Dagligen' : '2-3 ggr/vecka',
      restDays: '1-2 per vecka',
      sleep: `Sikta på ${answers.sleep_hours} timmar per natt`
    };
  };

  const calculateDailyCalories = (answers) => {
    // Simple calorie calculation
    const baseCalories = 2000;
    const trainingMultiplier = {
      '2-3': 1.2,
      '3-4': 1.3,
      '4-5': 1.4,
      '5-6': 1.5,
      '6+': 1.6
    };
    
    return Math.round(baseCalories * (trainingMultiplier[answers.weekly_runs] || 1.3));
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'race_picker':
        return (
          <div className="space-y-4">
            {/* Popular Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => setSearchTerm('Marathon')}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                🏃‍♂️ Marathon
              </button>
              <button
                onClick={() => setSearchTerm('Ultra')}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                🏔️ Ultra
              </button>
              <button
                onClick={() => setSearchTerm('Sverige')}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
              >
                🇸🇪 Sverige
              </button>
              <button
                onClick={() => setSearchTerm('')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                🌍 Alla lopp
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Sök lopp, plats eller distans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              {loadingRaces ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Laddar lopp...</p>
                </div>
              ) : filteredRaces.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Inga lopp hittades</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-purple-600 hover:text-purple-700 text-sm mt-2"
                  >
                    Rensa sökning
                  </button>
                </div>
              ) : (
                filteredRaces.map((race) => {
                  const distanceStr = race.distance || '';
                  const terrainStr = race.terrain || '';
                  
                  const isMarathon = distanceStr.includes('42') || distanceStr.includes('Marathon');
                  const isUltra = distanceStr.includes('km') && parseInt(distanceStr) > 50;
                  const isTrail = terrainStr.toLowerCase().includes('trail') || terrainStr.toLowerCase().includes('berg');
                  
                  return (
                    <motion.div
                      key={race.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRaceSelect(race)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedRace?.id === race.id
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500 shadow-lg'
                          : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              #{race.ranking}
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg">{race.name}</h3>
                            {isMarathon && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                Marathon
                              </span>
                            )}
                            {isUltra && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                Ultra
                              </span>
                            )}
                            {isTrail && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Trail
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{race.location}</span>
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Activity className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{race.distance}</span>
                            </span>
                            {race.terrain && (
                              <span className="flex items-center gap-1 text-sm text-gray-600">
                                <Mountain className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{race.terrain}</span>
                              </span>
                            )}
                          </div>
                          {race.difficulty && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-gray-500">Svårighetsgrad:</span>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                                                        i < (race.difficulty && race.difficulty.includes('5') ? 5 : 
                                       race.difficulty && race.difficulty.includes('4') ? 4 : 
                                       race.difficulty && race.difficulty.includes('3') ? 3 : 
                                       race.difficulty && race.difficulty.includes('2') ? 2 : 1)
                                        ? 'bg-orange-500'
                                        : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedRace?.id === race.id && (
                          <div className="flex-shrink-0 ml-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'date_picker':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Valt lopp:</h3>
              <p className="text-purple-700">{selectedRace?.name}</p>
              <p className="text-sm text-purple-600">{selectedRace?.location} • {selectedRace?.distance}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Välj datum för loppet
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {selectedDate && (
                <p className="mt-2 text-sm text-gray-600">
                  {Math.floor((new Date(selectedDate) - new Date()) / (1000 * 60 * 60 * 24 * 7))} veckor till loppet
                </p>
              )}
            </div>
          </div>
        );

      case 'single':
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  answers[currentQuestion.id] === option.value
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const selected = (answers[currentQuestion.id] || []).includes(option.value);
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const current = answers[currentQuestion.id] || [];
                    const updated = selected
                      ? current.filter(v => v !== option.value)
                      : [...current, option.value];
                    handleAnswer(updated);
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selected
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                    {selected && <Check className="w-5 h-5 text-purple-600" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        );

      case 'text':
        return (
          <div>
            <input
              type="text"
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const isStepComplete = () => {
    switch (currentQuestion.type) {
      case 'race_picker':
        return !!selectedRace;
      case 'date_picker':
        return !!selectedDate;
      case 'text':
        return currentQuestion.validation ? 
          currentQuestion.validation(answers[currentQuestion.id]) : 
          !!answers[currentQuestion.id];
      case 'multiple':
        return (answers[currentQuestion.id] || []).length > 0;
      default:
        return !!answers[currentQuestion.id];
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return <AILoadingScreen onComplete={() => {}} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">AI Race Coach</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm mt-2 opacity-90">
            Steg {currentStep + 1} av {questions.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentQuestion.question}
              </h3>
              {currentQuestion.description && (
                <p className="text-gray-600 mb-6">{currentQuestion.description}</p>
              )}
              
              {renderQuestion()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Tillbaka
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isStepComplete()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isStepComplete()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === questions.length - 1 ? 'Skapa träningsplan' : 'Nästa'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RaceCoachOnboarding; 