// AI Race Coach Modal - Modern Interactive Design v2.1
// Updated with enhanced animations and improved UX - Force redeploy
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
  Activity,
  Heart,
  Sparkles,
  Trophy
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
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load races on mount
  useEffect(() => {
    const loadRaces = async () => {
      try {
        console.log('Loading races from API...');
        const response = await api.get('/races');
        console.log('API response:', response.data);
        
        if (response.data.success && response.data.races) {
          setRaces(response.data.races);
          setFilteredRaces(response.data.races);
          console.log(`Loaded ${response.data.races.length} races`);
        } else {
          console.error('API response missing success or races:', response.data);
        }
      } catch (error) {
        console.error('Error loading races:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Fallback data if API fails
        const fallbackRaces = [
          {
            id: 'boston-marathon',
            name: 'Boston Marathon',
            location: 'Boston, USA',
            distance: '42.195 km',
            difficulty: 'Advanced',
            ranking: 1
          },
          {
            id: 'stockholm-marathon',
            name: 'Stockholm Marathon',
            location: 'Stockholm, Sweden',
            distance: '42.195 km',
            difficulty: 'Intermediate',
            ranking: 2
          }
        ];
        setRaces(fallbackRaces);
        setFilteredRaces(fallbackRaces);
      } finally {
        setLoadingRaces(false);
      }
    };
    
    if (isOpen && isClient) {
      loadRaces();
    }
  }, [isOpen, isClient]);

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

  // Count races by type
  const countRacesByType = (type) => {
    return races.filter(race => {
      const raceType = race.type?.toLowerCase() || '';
      const distance = race.distance?.toLowerCase() || '';
      const terrain = race.terrain?.toLowerCase() || '';
      
      switch(type) {
        case 'marathon':
          return raceType.includes('marathon') && !raceType.includes('ultra') && !raceType.includes('halv');
        case 'halvmarathon':
          return raceType.includes('halvmarathon') || distance.includes('21');
        case 'ultra':
          return raceType.includes('ultra') || (distance.includes('km') && parseInt(distance) > 50);
        case 'trail':
          return raceType.includes('trail') || terrain.includes('trail') || terrain.includes('berg');
        default:
          return true;
      }
    }).length;
  };

  // Count races by location
  const countRacesByLocation = (location) => {
    return races.filter(race => {
      const raceLocation = race.location?.toLowerCase() || '';
      const tags = race.searchTags?.map(t => t.toLowerCase()) || [];
      
      switch(location) {
        case 'sverige':
          return raceLocation.includes('sverige') || tags.includes('sverige');
        case 'usa':
          return raceLocation.includes('usa') || tags.includes('usa') || tags.includes('amerika');
        case 'europa':
          return ['england', 'frankrike', 'tyskland', 'schweiz', 'italien', 'spanien', 'norge'].some(country => 
            raceLocation.includes(country) || tags.includes(country)
          );
        case 'asien':
          return ['japan', 'kina', 'nepal', 'indien'].some(country => 
            raceLocation.includes(country) || tags.includes(country)
          );
        default:
          return true;
      }
    }).length;
  };

  const questions = [
    // 1. Race selection (standalone)
    {
      id: 'race_picker',
      type: 'race_picker',
      category: 'race_info',
      question: 'Vilket lopp siktar du på?',
      description: 'Välj från vår lista med världens bästa lopp'
    },
    
    // 2. Race details - Date & Location type
    {
      id: 'race_details',
      type: 'multi_question',
      category: 'race_info',
      questions: [
        {
          id: 'race_date',
          type: 'date_picker',
          question: 'När går startskottet?',
          description: '📅 Ange exakt datum → appen visar automatiskt X veckor kvar'
        },
        {
          id: 'race_location_type',
          type: 'single',
          question: 'Var hålls loppet?',
          options: [
            { value: 'city', label: 'Stad', icon: '🏙️' },
            { value: 'trail', label: 'Skog/Trail', icon: '🌳' },
            { value: 'altitude', label: 'Höjd (>1 500 m)', icon: '🏔️' }
          ]
        }
      ]
    },

    // 3. Goals - Main goal & Motivation
    {
      id: 'goals_motivation',
      type: 'multi_question',
      category: 'goals',
      questions: [
        {
          id: 'main_goal',
          type: 'single',
          question: 'Vad är ditt huvudmål?',
          options: [
            { value: 'finish', label: 'Bara gå i mål', icon: '🎯' },
            { value: 'enjoy', label: 'Njuta', icon: '😊' },
            { value: 'pb', label: 'Personbästa', icon: '⚡' },
            { value: 'qualify', label: 'Kvala till större lopp', icon: '🚀' }
          ]
        },
        {
          id: 'motivation',
          type: 'single',
          question: 'Vad motiverar dig mest?',
          options: [
            { value: 'times', label: 'Tider & medaljer', icon: '🏅' },
            { value: 'community', label: 'Gemenskap', icon: '👯‍♀️' },
            { value: 'mental', label: 'Mental hälsa', icon: '🧠' },
            { value: 'experience', label: 'Upplevelsen', icon: '🌍' }
          ]
        }
      ]
    },

    // 4. Coaching style (standalone - important)
    {
      id: 'coaching_style',
      type: 'single',
      category: 'goals',
      question: 'Hur vill du att coachen peppar dig?',
      options: [
        { value: 'data', label: 'Datadrivet', icon: '📈' },
        { value: 'positive', label: 'Positiv boost', icon: '🤗' },
        { value: 'gamification', label: 'Gamification', icon: '🎮' },
        { value: 'mindful', label: 'Mindful ton', icon: '🧘‍♂️' }
      ]
    },

    // 5. Current fitness - Level & Recent run
    {
      id: 'fitness_level',
      type: 'multi_question',
      category: 'fitness',
      questions: [
        {
          id: 'current_fitness',
          type: 'single',
          question: 'Hur skulle du beskriva din form just nu?',
          options: [
            { value: 'beginner', label: 'Nybörjare (kan springa 5 km)', icon: '🌱' },
            { value: 'recreational', label: 'Motionär', icon: '🏃' },
            { value: 'experienced', label: 'Erfaren', icon: '💪' },
            { value: 'elite', label: 'Elitnära', icon: '🐐' }
          ]
        },
        {
          id: 'longest_recent_run',
          type: 'single',
          question: 'Din längsta löptur senaste månaden?',
          options: [
            { value: '<5', label: '<5 km', icon: '🏁' },
            { value: '5-10', label: '5–10 km', icon: '🏃‍♂️' },
            { value: '10-15', label: '10–15 km', icon: '🏃‍♀️' },
            { value: '15-21', label: '15–21 km', icon: '🏅' },
            { value: '>21', label: '>21 km', icon: '🏆' }
          ]
        }
      ]
    },

    // 6. Pace & Training time
    {
      id: 'pace_training',
      type: 'multi_question',
      category: 'fitness',
      questions: [
        {
          id: 'average_pace',
          type: 'single',
          question: 'Snittfart på distanspass (min/km)?',
          options: [
            { value: '>7:00', label: '>7:00', icon: '🐢' },
            { value: '6:00-7:00', label: '6:00–7:00', icon: '🙂' },
            { value: '5:00-6:00', label: '5:00–6:00', icon: '😎' },
            { value: '<5:00', label: '<5:00', icon: '⚡' }
          ]
        },
        {
          id: 'weekly_runs',
          type: 'single',
          question: 'Hur många löppass kan du lägga per vecka?',
          options: [
            { value: '3', label: '3', icon: '📅' },
            { value: '4', label: '4', icon: '📆' },
            { value: '5', label: '5', icon: '🗓️' },
            { value: '6+', label: '6+', icon: '🚀' }
          ]
        }
      ]
    },

    // 7. Long runs & Preferred times
    {
      id: 'training_schedule',
      type: 'multi_question',
      category: 'training_time',
      questions: [
        {
          id: 'long_run_duration',
          type: 'single',
          question: 'Hur långa får långpassen bli?',
          options: [
            { value: '<60', label: '<60 min', icon: '⌛' },
            { value: '60-90', label: '60–90 min', icon: '⏰' },
            { value: '90-120', label: '90–120 min', icon: '⏱️' },
            { value: '>120', label: '>120 min', icon: '🕒' }
          ]
        },
        {
          id: 'preferred_time',
          type: 'multiple',
          question: 'Vilka tider på dygnet föredrar du att träna?',
          options: [
            { value: 'morning', label: 'Morgon', icon: '🌅' },
            { value: 'lunch', label: 'Lunch', icon: '🕛' },
            { value: 'afternoon', label: 'Eftermiddag', icon: '🌆' },
            { value: 'evening', label: 'Kväll', icon: '🌙' },
            { value: 'flexible', label: 'Flexibelt', icon: '🎲' }
          ]
        }
      ]
    },

    // 8. Experience & Injuries
    {
      id: 'history_injuries',
      type: 'multi_question',
      category: 'history',
      questions: [
        {
          id: 'running_experience',
          type: 'single',
          question: 'Hur länge har du löptränat regelbundet?',
          options: [
            { value: '<6m', label: '<6 mån', icon: '⏳' },
            { value: '6-12m', label: '6–12 mån', icon: '📅' },
            { value: '1-3y', label: '1–3 år', icon: '📆' },
            { value: '3y+', label: '3+ år', icon: '🏆' }
          ]
        },
        {
          id: 'injury_count',
          type: 'single',
          question: 'Antal skador senaste året?',
          options: [
            { value: '0', label: '0', icon: '🌟' },
            { value: '1', label: '1', icon: '😅' },
            { value: '2-3', label: '2–3', icon: '😬' },
            { value: '4+', label: '4+', icon: '😖' }
          ]
        }
      ]
    },

    // 9. Current injuries (standalone - important)
    {
      id: 'current_injuries',
      type: 'multiple',
      category: 'history',
      question: 'Aktuella skador eller besvär?',
      options: [
        { value: 'none', label: 'Inga', icon: '🚫' },
        { value: 'knee', label: 'Knä', icon: '🤕' },
        { value: 'foot', label: 'Fot/ankel', icon: '🦶' },
        { value: 'muscle', label: 'Muskel', icon: '🦵' },
        { value: 'other', label: 'Annat', icon: '🩹' }
      ]
    },

    // 10. Sleep & Stress
    {
      id: 'health_recovery',
      type: 'multi_question',
      category: 'health',
      questions: [
        {
          id: 'sleep_hours',
          type: 'single',
          question: 'Sömn per natt i snitt?',
          options: [
            { value: '<6', label: '<6 h', icon: '💤' },
            { value: '6-7', label: '6–7 h', icon: '😌' },
            { value: '7-8', label: '7–8 h', icon: '😴' },
            { value: '>8', label: '>8 h', icon: '😇' }
          ]
        },
        {
          id: 'stress_level',
          type: 'single',
          question: 'Stressnivå i vardagen?',
          options: [
            { value: 'low', label: 'Låg', icon: '🧘' },
            { value: 'medium', label: 'Medel', icon: '🙂' },
            { value: 'high', label: 'Hög', icon: '😰' },
            { value: 'extreme', label: 'Extrem', icon: '😱' }
          ]
        }
      ]
    },

    // 11. Medical clearance (standalone - important)
    {
      id: 'medical_clearance',
      type: 'single',
      category: 'health',
      question: 'Har läkare godkänt hård träning?',
      options: [
        { value: 'yes', label: 'Ja', icon: '✅' },
        { value: 'pending', label: 'Under utredning', icon: '❓' },
        { value: 'no', label: 'Nej', icon: '🚫' }
      ]
    },

    // 12. Strength & Flexibility
    {
      id: 'cross_training',
      type: 'multi_question',
      category: 'cross_training',
      questions: [
        {
          id: 'strength_training',
          type: 'single',
          question: 'Styrkepass per vecka?',
          options: [
            { value: '0', label: '0', icon: '🏋️' },
            { value: '1', label: '1', icon: '💪' },
            { value: '2', label: '2', icon: '💪' },
            { value: '3+', label: '3+', icon: '🦾' }
          ]
        },
        {
          id: 'flexibility_yoga',
          type: 'single',
          question: 'Rörlighet/yoga?',
          options: [
            { value: 'never', label: 'Aldrig', icon: '🧘' },
            { value: 'sometimes', label: 'Ibland', icon: '🤸' },
            { value: '1x', label: '1×/vecka', icon: '🧘‍♀️' },
            { value: '2x+', label: '2+×/vecka', icon: '🧘‍♂️' }
          ]
        }
      ]
    },

    // 13. Other cardio (standalone - can be multiple)
    {
      id: 'other_cardio',
      type: 'multiple',
      category: 'cross_training',
      question: 'Övrig uthållighetsträning?',
      options: [
        { value: 'cycling', label: 'Cykel', icon: '🚴' },
        { value: 'swimming', label: 'Simning', icon: '🏊‍♂️' },
        { value: 'skiing', label: 'Längdskidor', icon: '⛷️' },
        { value: 'none', label: 'Inget', icon: '🚫' }
      ]
    },

    // 14. Environment - Surface & Climate
    {
      id: 'environment_conditions',
      type: 'multi_question',
      category: 'environment',
      questions: [
        {
          id: 'training_surface',
          type: 'single',
          question: 'Vanligaste underlaget i träning?',
          options: [
            { value: 'asphalt', label: 'Asfalt', icon: '🏙️' },
            { value: 'gravel', label: 'Grus/skog', icon: '🌳' },
            { value: 'mountain', label: 'Berg', icon: '🏔️' },
            { value: 'mix', label: 'Mix', icon: '⚖️' }
          ]
        },
        {
          id: 'climate',
          type: 'single',
          question: 'Klimat där du tränar mest?',
          options: [
            { value: '<5', label: '<5 °C', icon: '❄️' },
            { value: '5-15', label: '5–15 °C', icon: '🌤️' },
            { value: '15-25', label: '15–25 °C', icon: '☀️' },
            { value: '>25', label: '>25 °C', icon: '🔥' }
          ]
        }
      ]
    },

    // 15. Terrain (standalone)
    {
      id: 'terrain_hilliness',
      type: 'single',
      category: 'environment',
      question: 'Hur kuperad är din standardrunda?',
      options: [
        { value: 'flat', label: 'Platt', icon: '🏖️' },
        { value: 'rolling', label: 'Lätt backigt', icon: '🚶‍♂️' },
        { value: 'hilly', label: 'Backigt', icon: '⛰️' }
      ]
    },

    // 16. Equipment - Shoes & Tracking
    {
      id: 'equipment_tracking',
      type: 'multi_question',
      category: 'equipment',
      questions: [
        {
          id: 'shoe_type',
          type: 'single',
          question: 'Vilka skor springer du oftast i?',
          options: [
            { value: 'cushioned', label: 'Vägdämpade', icon: '👟' },
            { value: 'racing', label: 'Lätta tävlingsskor', icon: '🏃‍♀️' },
            { value: 'trail', label: 'Trailsko', icon: '⛰️' },
            { value: 'unknown', label: 'Vet ej', icon: '❓' }
          ]
        },
        {
          id: 'tracking_device',
          type: 'single',
          question: 'Använder du löparklocka/GPS?',
          options: [
            { value: 'watch_hr', label: 'Klocka + pulsband', icon: '⌚' },
            { value: 'watch', label: 'Klocka (handledpuls)', icon: '⌚' },
            { value: 'phone', label: 'Mobil-app', icon: '📱' },
            { value: 'none', label: 'Nej', icon: '🚫' }
          ]
        }
      ]
    },

    // 17. Nutrition basics
    {
      id: 'nutrition_basics',
      type: 'multi_question',
      category: 'nutrition',
      questions: [
        {
          id: 'diet_type',
          type: 'single',
          question: 'Kosthållning/restriktioner?',
          options: [
            { value: 'omnivore', label: 'Omnivor', icon: '🥩' },
            { value: 'vegetarian', label: 'Veggie', icon: '🌱' },
            { value: 'vegan', label: 'Vegan', icon: '🌿' },
            { value: 'pescatarian', label: 'Pesc', icon: '🐟' },
            { value: 'allergies', label: 'Allergier', icon: '🚫' }
          ]
        },
        {
          id: 'sports_nutrition',
          type: 'single',
          question: 'Hur ofta använder du sportdryck/gels?',
          options: [
            { value: 'never', label: 'Aldrig', icon: '💧' },
            { value: 'long_runs', label: 'På långpass', icon: '🥤' },
            { value: 'every_run', label: 'Varje pass', icon: '⚡' }
          ]
        }
      ]
    },

    // 18. Travel & Experience
    {
      id: 'race_logistics',
      type: 'multi_question',
      category: 'logistics',
      questions: [
        {
          id: 'travel_required',
          type: 'single',
          question: 'Behöver du resa till loppet?',
          options: [
            { value: 'local', label: 'Lokal', icon: '🚶‍♂️' },
            { value: 'domestic', label: 'Inrikes', icon: '🚆' },
            { value: 'international', label: 'Internationellt', icon: '✈️' }
          ]
        },
        {
          id: 'heat_altitude_experience',
          type: 'single',
          question: 'Erfarenhet av tävling i värme/höjd?',
          options: [
            { value: 'none', label: 'Ingen', icon: '🔴' },
            { value: 'some', label: 'Lite', icon: '🟡' },
            { value: 'experienced', label: 'Ja, flera gånger', icon: '🟢' }
          ]
        }
      ]
    },

    // 19. Technique & Cadence
    {
      id: 'running_technique',
      type: 'multi_question',
      category: 'technique',
      questions: [
        {
          id: 'technique_analysis',
          type: 'single',
          question: 'Har du gjort löpteknik-analys?',
          options: [
            { value: 'video', label: 'Video', icon: '🎥' },
            { value: 'coach', label: 'Coach live', icon: '👁️' },
            { value: 'no', label: 'Nej', icon: '❌' }
          ]
        },
        {
          id: 'cadence',
          type: 'single',
          question: 'Känner du din kadens (steg/min)?',
          options: [
            { value: '<160', label: '<160', icon: '👟' },
            { value: '160-170', label: '160–170', icon: '👟' },
            { value: '170-180', label: '170–180', icon: '👟' },
            { value: '>180', label: '>180', icon: '👟' },
            { value: 'unknown', label: 'Vet ej', icon: '❓' }
          ]
        }
      ]
    },

    // 20. Delivery preferences
    {
      id: 'coaching_preferences',
      type: 'multi_question',
      category: 'preferences',
      questions: [
        {
          id: 'delivery_method',
          type: 'single',
          question: 'Hur vill du få träningspassen levererade?',
          options: [
            { value: 'push', label: 'Push-notiser', icon: '📲' },
            { value: 'email', label: 'Mail', icon: '📧' },
            { value: 'calendar', label: 'Kalender-sync', icon: '🗓️' }
          ]
        },
        {
          id: 'auto_adjust',
          type: 'single',
          question: 'Vill du ha automatiska justeringar vid missade pass?',
          options: [
            { value: 'yes', label: 'Ja, anpassa', icon: '🤖' },
            { value: 'no', label: 'Nej, jag planerar själv', icon: '✋' }
          ]
        }
      ]
    },

    // 21. Apple Health Integration (standalone - final)
    {
      id: 'apple_health_check',
      type: 'apple_health',
      category: 'integration',
      question: 'Vill du synka din träningsdata?',
      description: 'Få personliga insikter baserat på din faktiska träningshistorik'
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const getCategoryName = (category) => {
    const categoryNames = {
      race_info: 'Loppet du satsar på',
      goals: 'Mål & motivation',
      fitness: 'Din nuvarande kondition',
      training_time: 'Tillgänglig träningstid',
      history: 'Tränings- & skadehistoria',
      health: 'Hälsa & återhämtning',
      cross_training: 'Crossträning & styrka',
      environment: 'Miljö & underlag',
      equipment: 'Utrustning',
      nutrition: 'Kost & nutrition',
      logistics: 'Resa & tävlingslogistik',
      technique: 'Teknik & löpform',
      preferences: 'Coachning-preferenser',
      integration: 'Integration'
    };
    return categoryNames[category] || category;
  };

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
      
      // Format data correctly for backend API with all comprehensive questions
      const planData = {
        raceId: selectedRace?.id,
        answers: {
          ...answers,
          weeksUntilRace,
          raceDetails: selectedRace,
          // Include all category data
          raceInfo: {
            race: selectedRace,
            locationType: answers.race_location_type,
            date: answers.raceDate
          },
          goals: {
            main: answers.main_goal,
            motivation: answers.motivation,
            coachingStyle: answers.coaching_style
          },
          fitness: {
            current: answers.current_fitness,
            longestRun: answers.longest_recent_run,
            pace: answers.average_pace
          },
          trainingTime: {
            weeklyRuns: answers.weekly_runs,
            longRunDuration: answers.long_run_duration,
            preferredTimes: answers.preferred_time
          },
          history: {
            experience: answers.running_experience,
            injuries: answers.injury_count,
            currentInjuries: answers.current_injuries
          },
          health: {
            sleep: answers.sleep_hours,
            stress: answers.stress_level,
            medical: answers.medical_clearance
          },
          crossTraining: {
            strength: answers.strength_training,
            flexibility: answers.flexibility_yoga,
            otherCardio: answers.other_cardio
          },
          environment: {
            surface: answers.training_surface,
            climate: answers.climate,
            terrain: answers.terrain_hilliness
          },
          equipment: {
            shoes: answers.shoe_type,
            budget: answers.shoe_budget,
            tracking: answers.tracking_device
          },
          nutrition: {
            diet: answers.diet_type,
            sportsNutrition: answers.sports_nutrition,
            meals: answers.meals_per_day
          },
          logistics: {
            travel: answers.travel_required,
            arrival: answers.arrival_days,
            experience: answers.heat_altitude_experience
          },
          technique: {
            analysis: answers.technique_analysis,
            cadence: answers.cadence,
            pronation: answers.pronation
          },
          preferences: {
            delivery: answers.delivery_method,
            reports: answers.report_frequency,
            autoAdjust: answers.auto_adjust
          },
          appleHealth: answers.apple_health_check
        }
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
          <div className="space-y-6">
            {/* Beautiful header section */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Välj ditt mållopp</h3>
              <p className="text-gray-600">Bläddra bland världens mest prestigefyllda lopp</p>
            </div>

            {/* Filter pills with gradient backgrounds */}
            <div className="space-y-4">
              {/* Type filters */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filtrera efter typ</p>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchTerm('')}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      searchTerm === '' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🌍</span>
                      <span>Alla lopp</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{races.length}</span>
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchTerm('Marathon')}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      searchTerm.toLowerCase() === 'marathon' 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🏃‍♂️</span>
                      <span>Marathon</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        searchTerm.toLowerCase() === 'marathon' ? 'bg-white/20' : 'bg-blue-200'
                      }`}>{countRacesByType('marathon')}</span>
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchTerm('Ultra')}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      searchTerm.toLowerCase() === 'ultra' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25' 
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🏔️</span>
                      <span>Ultramarathon</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        searchTerm.toLowerCase() === 'ultra' ? 'bg-white/20' : 'bg-purple-200'
                      }`}>{countRacesByType('ultra')}</span>
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchTerm('Trail')}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      searchTerm.toLowerCase() === 'trail' 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25' 
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🌲</span>
                      <span>Trail</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        searchTerm.toLowerCase() === 'trail' ? 'bg-white/20' : 'bg-green-200'
                      }`}>{countRacesByType('trail')}</span>
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Location filters */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Populära destinationer</p>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchTerm('Sverige')}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      searchTerm.toLowerCase() === 'sverige' 
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/25' 
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🇸🇪</span>
                      <span>Sverige</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        searchTerm.toLowerCase() === 'sverige' ? 'bg-white/20' : 'bg-yellow-200'
                      }`}>{countRacesByLocation('sverige')}</span>
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchTerm('USA')}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      searchTerm.toLowerCase() === 'usa' 
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25' 
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🇺🇸</span>
                      <span>USA</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        searchTerm.toLowerCase() === 'usa' ? 'bg-white/20' : 'bg-red-200'
                      }`}>{countRacesByLocation('usa')}</span>
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Beautiful search bar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Sök lopp, plats eller distans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-700 placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>
            
            {/* Race cards with beautiful design */}
            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {loadingRaces ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                  </motion.div>
                  <p className="text-gray-500 mt-4">Laddar världens bästa lopp...</p>
                </div>
              ) : filteredRaces.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">Inga lopp hittades</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Visa alla lopp →
                  </button>
                </div>
              ) : (
                filteredRaces.map((race, index) => {
                  const distanceStr = String(race.distance || '');
                  const terrainStr = String(race.terrain || '');
                  
                  const isMarathon = distanceStr.includes('42') || distanceStr.includes('Marathon');
                  const isUltra = distanceStr.includes('km') && parseInt(distanceStr) > 50;
                  const isTrail = terrainStr.toLowerCase().includes('trail') || terrainStr.toLowerCase().includes('berg');
                  
                  return (
                    <motion.div
                      key={race.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRaceSelect(race)}
                      className={`relative p-5 rounded-2xl cursor-pointer transition-all ${
                        selectedRace?.id === race.id
                          ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-500 shadow-xl shadow-purple-500/10'
                          : 'bg-white border border-gray-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5'
                      }`}
                    >
                      {/* Ranking badge */}
                      <div className="absolute -top-2 -left-2">
                        <motion.div
                          animate={selectedRace?.id === race.id ? { rotate: [0, -10, 10, -10, 0] } : {}}
                          transition={{ duration: 0.5 }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            race.ranking <= 3
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30'
                              : race.ranking <= 10
                              ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                          }`}
                        >
                          #{race.ranking}
                        </motion.div>
                      </div>

                      <div className="flex items-start justify-between pl-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-gray-900 text-lg">{race.name}</h3>
                            <div className="flex gap-2">
                              {isMarathon && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                  Marathon
                                </span>
                              )}
                              {isUltra && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                  Ultra
                                </span>
                              )}
                              {isTrail && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  Trail
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Plats</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{race.location}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Distans</p>
                                <p className="text-sm font-medium text-gray-900">{race.distance}</p>
                              </div>
                            </div>
                            
                            {race.terrain && (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Mountain className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Terräng</p>
                                  <p className="text-sm font-medium text-gray-900 truncate">{race.terrain}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {selectedRace?.id === race.id && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            className="flex-shrink-0 ml-4"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'multi_question':
        // Render multiple questions on the same page
        const multiQuestions = currentQuestion.questions;
        return (
          <div className="space-y-8">
            {multiQuestions.map((question, qIndex) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.2 }}
                className="space-y-4"
              >
                {/* Question header */}
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    qIndex === 0 ? 'bg-purple-100 text-purple-600' : 'bg-pink-100 text-pink-600'
                  }`}>
                    {qIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{question.question}</h4>
                    {question.description && (
                      <p className="text-sm text-gray-500 mt-1">{question.description}</p>
                    )}
                  </div>
                </div>

                {/* Question content based on type */}
                {question.type === 'date_picker' ? (
                  <div className="pl-11">
                    <input
                      type="date"
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700"
                    />
                    {answers[question.id] && (
                      <p className="mt-2 text-sm text-gray-600">
                        {Math.floor((new Date(answers[question.id]) - new Date()) / (1000 * 60 * 60 * 24 * 7))} veckor till loppet
                      </p>
                    )}
                  </div>
                ) : question.type === 'single' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-11">
                    {question.options.map((option, index) => {
                      const isSelected = answers[question.id] === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAnswers({ ...answers, [question.id]: option.value })}
                          className={`relative p-4 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-500 shadow-md'
                              : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <span className={`font-medium ${
                              isSelected ? 'text-purple-900' : 'text-gray-700'
                            }`}>
                              {option.label}
                            </span>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2"
                            >
                              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : question.type === 'multiple' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-11">
                    {question.options.map((option, index) => {
                      const currentAnswers = answers[question.id] || [];
                      const isSelected = currentAnswers.includes(option.value);
                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const updated = isSelected
                              ? currentAnswers.filter(v => v !== option.value)
                              : [...currentAnswers, option.value];
                            setAnswers({ ...answers, [question.id]: updated });
                          }}
                          className={`relative p-4 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-500 shadow-md'
                              : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <span className={`font-medium ${
                              isSelected ? 'text-purple-900' : 'text-gray-700'
                            }`}>
                              {option.label}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <div className={`w-6 h-6 rounded-md border-2 transition-all ${
                              isSelected
                                ? 'bg-purple-600 border-purple-600'
                                : 'bg-white border-gray-300'
                            }`}>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-full h-full flex items-center justify-center"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : null}

                {/* Divider between questions */}
                {qIndex < multiQuestions.length - 1 && (
                  <div className="pt-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  </div>
                )}
              </motion.div>
            ))}
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
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700"
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
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option.value)}
                  className={`relative group w-full p-4 rounded-2xl text-left transition-all overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-500 shadow-lg'
                      : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30'
                  }`}
                >
                  {/* Background decoration */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity ${
                    isSelected ? 'opacity-5' : 'group-hover:opacity-3'
                  }`} />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: isSelected ? [0, 10, -10, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                        className={`text-3xl flex-shrink-0 ${isSelected ? 'filter drop-shadow-md' : ''}`}
                      >
                        {option.icon}
                      </motion.div>
                      <span className={`font-medium text-lg ${
                        isSelected
                          ? 'text-purple-900'
                          : 'text-gray-700 group-hover:text-purple-700'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="flex-shrink-0"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Hover effect line */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: isSelected ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              );
            })}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-2">Välj alla som gäller</p>
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const selected = (answers[currentQuestion.id] || []).includes(option.value);
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const current = answers[currentQuestion.id] || [];
                      const updated = selected
                        ? current.filter(v => v !== option.value)
                        : [...current, option.value];
                      handleAnswer(updated);
                    }}
                    className={`relative group w-full p-4 rounded-2xl text-left transition-all overflow-hidden ${
                      selected
                        ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-500 shadow-lg'
                        : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30'
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div className="absolute top-4 right-4">
                      <motion.div
                        animate={selected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        className={`w-6 h-6 rounded-md border-2 transition-all ${
                          selected
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-600'
                            : 'bg-white border-gray-300 group-hover:border-purple-400'
                        }`}
                      >
                        {selected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            className="w-full h-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                    
                    <div className="flex items-center gap-4 pr-12">
                      <motion.div
                        animate={{ rotate: selected ? [0, 10, -10, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                        className={`text-3xl flex-shrink-0 ${selected ? 'filter drop-shadow-md' : ''}`}
                      >
                        {option.icon}
                      </motion.div>
                      <span className={`font-medium text-lg ${
                        selected
                          ? 'text-purple-900'
                          : 'text-gray-700 group-hover:text-purple-700'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                    
                    {/* Hover effect line */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
                      initial={{ width: 0 }}
                      animate={{ width: selected ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                );
              })}
            </div>
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700 placeholder-gray-400"
            />
          </div>
        );

      case 'apple_health':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Apple Health Integration
              </h4>
              <p className="text-sm text-gray-600 text-center mb-4">
                Synka din träningshistorik för att få en mer personlig träningsplan baserad på din faktiska träningsdata
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Analysera din träningsfrekvens</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Se dina faktiska löpdistanser</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Få insikter om din utveckling</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleAnswer('sync');
                  // Open Apple Health sync in a new tab to keep modal open
                  window.open('/app/settings#apple-health', '_blank');
                }}
                className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-center gap-3">
                  <Heart className="w-5 h-5" />
                  <span>Synka med Apple Health</span>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer('skip')}
                className="w-full p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-center gap-3">
                  <X className="w-5 h-5" />
                  <span>Hoppa över</span>
                </div>
              </motion.button>
            </div>
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
      case 'multi_question':
        // All sub-questions must be answered
        return currentQuestion.questions.every(q => {
          if (q.type === 'multiple') {
            return (answers[q.id] || []).length > 0;
          }
          return !!answers[q.id];
        });
      case 'text':
        return currentQuestion.validation ? 
          currentQuestion.validation(answers[currentQuestion.id]) : 
          !!answers[currentQuestion.id];
      case 'multiple':
        return (answers[currentQuestion.id] || []).length > 0;
      case 'apple_health':
        return !!answers[currentQuestion.id];
      default:
        return !!answers[currentQuestion.id];
    }
  };

  if (!isOpen || !isClient) return null;

  if (isLoading) {
    return <AILoadingScreen onComplete={() => {}} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/20 to-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-purple-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-10" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-10" />
        
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 animate-gradient-x" />
          <div className="relative bg-gradient-to-b from-transparent to-black/10 p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-white">
                    AI Race Coach
                  </h2>
                  <p className="text-white/80 text-xs md:text-sm">
                    Steg {currentStep + 1} av {questions.length} • {Math.round(progress)}% klart
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
            
            {/* Enhanced Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Steg {currentStep + 1} av {questions.length}
                </span>
                <span className="text-white/80">
                  {getCategoryName(currentQuestion.category)}
                </span>
              </div>
              <div className="relative w-full bg-white/30 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-white to-yellow-300 rounded-full h-3 shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between">
                {[...Array(Math.min(5, questions.length))].map((_, i) => {
                  const stepIndex = Math.floor((i / 4) * (questions.length - 1));
                  const isCompleted = currentStep > stepIndex;
                  const isCurrent = currentStep === stepIndex;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        isCompleted ? 'bg-white' : isCurrent ? 'bg-white/60 animate-pulse' : 'bg-white/30'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content with better styling */}
        <div className="relative p-6 md:p-8 overflow-y-auto max-h-[55vh] custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.h3 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-900 via-pink-900 to-orange-900 bg-clip-text text-transparent mb-3"
              >
                {currentQuestion.question}
              </motion.h3>
              {currentQuestion.description && (
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 mb-6 text-lg leading-relaxed"
                >
                  {currentQuestion.description}
                </motion.p>
              )}
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {renderQuestion()}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enhanced Footer */}
        <div className="relative border-t border-gray-100 p-6 bg-gradient-to-t from-gray-50 to-transparent">
          <div className="flex items-center justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md border border-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Tillbaka</span>
            </motion.button>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && currentStep < questions.length - 1 && (
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}% klart
                </span>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!isStepComplete()}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all overflow-hidden ${
                  isStepComplete()
                    ? 'text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isStepComplete() && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 animate-gradient-x" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </>
                )}
                <span className="relative">
                  {currentStep === questions.length - 1 ? 'Skapa träningsplan' : 'Nästa'}
                </span>
                <ChevronRight className="w-5 h-5 relative" />
              </motion.button>
            </div>
          </div>
          
          {/* Motivational text */}
          {currentStep > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-500 mt-4"
            >
              {currentStep < 5 && "🎯 Bra start! Fortsätt så..."}
              {currentStep >= 5 && currentStep < 10 && "💪 Halvvägs där! Du klarar det..."}
              {currentStep >= 10 && currentStep < questions.length - 1 && "🔥 Snart klar! Bara några frågor till..."}
              {currentStep === questions.length - 1 && "🎉 Sista frågan! Din plan är nästan redo..."}
            </motion.p>
          )}
        </div>
      </motion.div>
      
      
    </motion.div>
  );
};

export default RaceCoachOnboarding; 