import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AILoadingScreen from './AILoadingScreen';

// Matchning scoring system
const calculateMatchScore = (userAnswers, otherUserAnswers) => {
  let score = 0;
  let maxScore = 0;

  // Primary goal match (40 points)
  if (userAnswers.primaryGoal === otherUserAnswers.primaryGoal) {
    score += 40;
  } else if (
    (userAnswers.primaryGoal === 'fitness' && otherUserAnswers.primaryGoal === 'health') ||
    (userAnswers.primaryGoal === 'health' && otherUserAnswers.primaryGoal === 'fitness')
  ) {
    score += 20; // Partial match for related goals
  }
  maxScore += 40;

  // Running level match (30 points)
  const levelMap = { beginner: 1, casual: 2, regular: 3, experienced: 4, competitive: 5 };
  const levelDiff = Math.abs(levelMap[userAnswers.currentLevel] - levelMap[otherUserAnswers.currentLevel]);
  score += Math.max(0, 30 - (levelDiff * 10));
  maxScore += 30;

  // Training frequency match (20 points)
  const freqMap = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5+': 5 };
  const freqDiff = Math.abs(freqMap[userAnswers.weekly_runs] - freqMap[otherUserAnswers.weekly_runs]);
  score += Math.max(0, 20 - (freqDiff * 5));
  maxScore += 20;

  // Preferred time match (15 points)
  if (userAnswers.preferred_time === otherUserAnswers.preferred_time) {
    score += 15;
  } else if (
    (userAnswers.preferred_time === 'flexible' || otherUserAnswers.preferred_time === 'flexible')
  ) {
    score += 8; // Partial match if one is flexible
  }
  maxScore += 15;

  // Running environment match (15 points)
  if (userAnswers.preferred_environment === otherUserAnswers.preferred_environment) {
    score += 15;
  } else if (userAnswers.preferred_environment === 'both' || otherUserAnswers.preferred_environment === 'both') {
    score += 8;
  }
  maxScore += 15;

  // Social preference match (10 points)
  if (userAnswers.social_preference === otherUserAnswers.social_preference) {
    score += 10;
  }
  maxScore += 10;

  // Music preference match (5 points)
  if (userAnswers.music_preference === otherUserAnswers.music_preference) {
    score += 5;
  }
  maxScore += 5;

  return Math.round((score / maxScore) * 100);
};

const AICoachOnboarding = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  const questions = [
    {
      id: 'primary_goal',
      question: 'Vad är ditt primära löpmål?',
      type: 'single',
      options: [
        { value: 'first_5k', label: 'Springa mitt första 5K-lopp', icon: '🎯' },
        { value: 'improve_time', label: 'Förbättra min tid', icon: '⚡' },
        { value: 'marathon', label: 'Träna för marathon', icon: '🏃' },
        { value: 'health', label: 'Förbättra min hälsa', icon: '❤️' },
        { value: 'weight_loss', label: 'Gå ner i vikt', icon: '⚖️' },
        { value: 'social', label: 'Hitta löparvänner', icon: '👥' }
      ]
    },
    {
      id: 'current_level',
      question: 'Hur skulle du beskriva din nuvarande löpnivå?',
      type: 'single',
      options: [
        { value: 'beginner', label: 'Nybörjare - Just börjat', icon: '🌱' },
        { value: 'occasional', label: 'Springer ibland', icon: '🚶' },
        { value: 'regular', label: 'Springer regelbundet', icon: '🏃' },
        { value: 'advanced', label: 'Avancerad löpare', icon: '🚀' }
      ]
    },
    {
      id: 'training_experience',
      question: 'Hur länge har du tränat löpning?',
      type: 'single',
      options: [
        { value: 'new', label: 'Har inte börjat än', icon: '🆕' },
        { value: 'months', label: 'Några månader', icon: '📅' },
        { value: '1-2years', label: '1-2 år', icon: '📆' },
        { value: '3+years', label: '3+ år', icon: '🗓️' }
      ]
    },
    {
      id: 'weekly_time',
      question: 'Hur mycket tid kan du lägga på träning per vecka?',
      type: 'single',
      options: [
        { value: '1-2h', label: '1-2 timmar', icon: '⏱️' },
        { value: '3-4h', label: '3-4 timmar', icon: '⏲️' },
        { value: '5-7h', label: '5-7 timmar', icon: '⏰' },
        { value: '8+h', label: '8+ timmar', icon: '🕐' }
      ]
    },
    {
      id: 'run_frequency',
      question: 'Hur ofta springer du idag?',
      type: 'single',
      options: [
        { value: 'none', label: 'Inte alls än', icon: '🚫' },
        { value: '1-2', label: '1-2 gånger/vecka', icon: '1️⃣' },
        { value: '3-4', label: '3-4 gånger/vecka', icon: '3️⃣' },
        { value: '5+', label: '5+ gånger/vecka', icon: '5️⃣' }
      ]
    },
    {
      id: 'longest_run',
      question: 'Vad är din längsta löprunda hittills?',
      type: 'single',
      options: [
        { value: '0-3km', label: '0-3 km', icon: '🏁' },
        { value: '3-5km', label: '3-5 km', icon: '🏃‍♂️' },
        { value: '5-10km', label: '5-10 km', icon: '🏃‍♀️' },
        { value: '10-21km', label: '10-21 km', icon: '🏅' },
        { value: '21+km', label: '21+ km', icon: '🏆' }
      ]
    },
    {
      id: 'personal_best',
      question: 'Vad är ditt personbästa på 5K? (om du har ett)',
      type: 'text',
      placeholder: 'T.ex. 25:30 eller "Har inte sprungit 5K än"',
      validation: (value) => value && value.trim().length > 0
    },
    {
      id: 'injuries',
      question: 'Har du några skador eller fysiska begränsningar?',
      type: 'text',
      placeholder: 'Beskriv eventuella skador eller skriv "Inga skador"',
      validation: (value) => value && value.trim().length > 0
    },
    {
      id: 'motivation',
      question: 'Vad motiverar dig mest att springa?',
      type: 'multiple',
      options: [
        { value: 'health', label: 'Hälsa & välmående', icon: '❤️' },
        { value: 'achievement', label: 'Nå mål', icon: '🎯' },
        { value: 'social', label: 'Socialt umgänge', icon: '👥' },
        { value: 'stress', label: 'Stresshantering', icon: '🧘' },
        { value: 'competition', label: 'Tävling', icon: '🏆' },
        { value: 'nature', label: 'Vara i naturen', icon: '🌲' }
      ]
    },
    {
      id: 'preferred_time',
      question: 'När på dagen föredrar du att träna?',
      type: 'single',
      options: [
        { value: 'early_morning', label: 'Tidig morgon (05-07)', icon: '🌅' },
        { value: 'morning', label: 'Morgon (07-10)', icon: '☀️' },
        { value: 'lunch', label: 'Lunch (11-13)', icon: '🌤️' },
        { value: 'afternoon', label: 'Eftermiddag (14-17)', icon: '🌞' },
        { value: 'evening', label: 'Kväll (18-21)', icon: '🌆' },
        { value: 'flexible', label: 'Flexibel', icon: '🔄' }
      ]
    },
    {
      id: 'environment',
      question: 'Var springer du helst?',
      type: 'multiple',
      options: [
        { value: 'road', label: 'Väg/asfalt', icon: '🛣️' },
        { value: 'trail', label: 'Stig/terräng', icon: '🏞️' },
        { value: 'track', label: 'Löparbana', icon: '🏟️' },
        { value: 'treadmill', label: 'Löpband', icon: '🏃‍♂️' },
        { value: 'park', label: 'Park', icon: '🌳' }
      ]
    },
    {
      id: 'diet_style',
      question: 'Hur skulle du beskriva din nuvarande kost?',
      type: 'single',
      options: [
        { value: 'balanced', label: 'Balanserad kost', icon: '🥗' },
        { value: 'vegetarian', label: 'Vegetarisk', icon: '🥬' },
        { value: 'vegan', label: 'Vegansk', icon: '🌱' },
        { value: 'low_carb', label: 'Låg kolhydrat', icon: '🥩' },
        { value: 'flexible', label: 'Äter allt', icon: '🍽️' },
        { value: 'improving', label: 'Vill förbättra', icon: '📈' }
      ]
    },
    {
      id: 'sleep_quality',
      question: 'Hur är din sömnkvalitet generellt?',
      type: 'single',
      options: [
        { value: 'excellent', label: 'Utmärkt (7-9h)', icon: '😴' },
        { value: 'good', label: 'Bra (6-7h)', icon: '😊' },
        { value: 'fair', label: 'OK (5-6h)', icon: '😐' },
        { value: 'poor', label: 'Dålig (<5h)', icon: '😫' }
      ]
    },
    {
      id: 'stress_level',
      question: 'Hur stressad känner du dig i vardagen?',
      type: 'single',
      options: [
        { value: 'low', label: 'Låg stress', icon: '😌' },
        { value: 'moderate', label: 'Måttlig stress', icon: '😊' },
        { value: 'high', label: 'Hög stress', icon: '😰' },
        { value: 'very_high', label: 'Mycket hög stress', icon: '😱' }
      ]
    },
    {
      id: 'running_social',
      question: 'Föredrar du att springa ensam eller med andra?',
      type: 'single',
      options: [
        { value: 'alone', label: 'Alltid ensam', icon: '🏃' },
        { value: 'mostly_alone', label: 'Oftast ensam', icon: '🏃‍♂️' },
        { value: 'mix', label: 'Blandat', icon: '👥' },
        { value: 'mostly_group', label: 'Oftast i grupp', icon: '👫' },
        { value: 'always_group', label: 'Alltid i grupp', icon: '👨‍👩‍👧‍👦' }
      ]
    },
    {
      id: 'specific_challenges',
      question: 'Vad är din största utmaning med löpning just nu?',
      type: 'text',
      placeholder: 'Beskriv din största utmaning...',
      validation: (value) => value && value.trim().length > 0
    }
  ];

  const progress = ((currentStep) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const isStepComplete = () => {
    if (currentQuestion.type === 'welcome') return true;
    if (currentQuestion.type === 'motivation_cloud') {
      const selections = answers[currentQuestion.id] || [];
      return selections.length > 0;
    }
    return answers[currentQuestion.id] !== undefined;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last question - directly submit
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
      // Prepare complete data for API
      const apiData = {
        // Profile
        ageGroup: answers.age_group,
        
        // Goals and fitness level
        primaryGoal: answers.primaryGoal,
        currentLevel: answers.currentLevel,
        trainingExperience: answers.trainingExperience,
        
        // Training details
        weeklyRuns: answers.trainingFrequency,
        weeklyHours: answers.weeklyHours,
        distancePreference: answers.distancePreference,
        pacePreference: answers.pacePreference,
        personalBest5k: answers.personalBest5k,
        
        // Preferences
        preferredTime: answers.preferredTime,
        preferredEnvironment: answers.environment,
        socialPreference: answers.socialPreference,
        musicPreference: answers.musicPreference,
        
        // Health and lifestyle
        healthConcerns: answers.healthConcerns || [],
        dietStyle: answers.dietStyle,
        sleepQuality: answers.sleepQuality,
        stressLevel: answers.stressLevel,
        motivationFactors: answers.finalMotivation || [],
        
        // For match scoring
        matchingProfile: {
          goal: answers.primaryGoal,
          level: answers.currentLevel,
          frequency: answers.trainingFrequency,
          distance: answers.distancePreference,
          pace: answers.pacePreference,
          time: answers.preferredTime,
          environment: answers.environment,
          social: answers.socialPreference,
          music: answers.musicPreference,
          experience: answers.trainingExperience,
          weeklyHours: answers.weeklyHours,
          personalBest: answers.personalBest5k
        }
      };

      const response = await api.post('/aicoach/comprehensive-plan', apiData);

      if (response.data.success) {
        // Navigate to results page with plan data
        setTimeout(() => {
          navigate('/app/ai-coach-results', { 
            state: { plan: response.data.plan },
            replace: true 
          });
          onClose();
          setIsLoading(false);
        }, 1000);
      } else {
        throw new Error('Failed to generate plan');
      }
    } catch (error) {
      console.error('Error creating comprehensive plan:', error);
      
      // Enhanced demo fallback with complete data
      const demoResponse = {
        success: true,
        plan: {
          summary: {
            name: 'Din Personliga Löparplan',
            level: answers.currentLevel,
            goal: answers.primaryGoal,
            duration: '12 veckor',
            startDate: new Date().toLocaleDateString('sv-SE')
          },
          training: {
            weeklySchedule: generateWeeklySchedule(answers),
            phases: [
              {
                name: 'Grundfas (Vecka 1-4)',
                focus: 'Bygga uthållighet och vana',
                weeklyDistance: calculateWeeklyDistance(answers, 1),
                keyWorkouts: generateKeyWorkouts(answers, 'base')
              },
              {
                name: 'Uppbyggnadsfas (Vecka 5-8)',
                focus: 'Öka distans och tempo',
                weeklyDistance: calculateWeeklyDistance(answers, 2),
                keyWorkouts: generateKeyWorkouts(answers, 'build')
              },
              {
                name: 'Toppfas (Vecka 9-12)',
                focus: 'Maximera prestation',
                weeklyDistance: calculateWeeklyDistance(answers, 3),
                keyWorkouts: generateKeyWorkouts(answers, 'peak')
              }
            ],
            progressionPlan: generateProgressionPlan(answers),
            recoveryProtocol: generateRecoveryProtocol(answers)
          },
          nutrition: {
            dailyCalories: calculateDailyCalories(answers),
            macros: {
              carbs: '50-60%',
              protein: '20-25%',
              fat: '20-25%'
            },
            hydration: calculateHydration(answers),
            preworkout: generatePreWorkoutMeal(answers),
            postworkout: generatePostWorkoutMeal(answers),
            supplements: generateSupplements(answers)
          },
          lifestyle: {
            sleep: generateSleepRecommendation(answers),
            stressManagement: generateStressManagement(answers),
            crossTraining: generateCrossTraining(answers),
            injuryPrevention: generateInjuryPrevention(answers)
          },
          matches: {
            score: calculateMatchScore(answers, answers),
            topMatches: generateTopMatches(answers)
          }
        }
      };
      
      // Navigate to results page with demo plan
      setTimeout(() => {
        navigate('/app/ai-coach-results', { 
          state: { plan: demoResponse.plan },
          replace: true 
        });
        onClose();
        setIsLoading(false);
      }, 1000);
    }
  };

  // Helper functions for generating comprehensive plan
  const generateWeeklySchedule = (data) => {
    const frequency = parseInt(data.trainingFrequency) || 3;
    const schedule = {};
    
    if (frequency === 1) {
      schedule['Lördag'] = 'Långpass - lugnt tempo';
    } else if (frequency === 2) {
      schedule['Tisdag'] = 'Intervaller - medeltempo';
      schedule['Lördag'] = 'Långpass - lugnt tempo';
    } else if (frequency === 3) {
      schedule['Tisdag'] = 'Intervaller - högt tempo';
      schedule['Torsdag'] = 'Lugn löpning - återhämtning';
      schedule['Lördag'] = 'Långpass - medeltempo';
    } else if (frequency === 4) {
      schedule['Måndag'] = 'Lugn löpning - återhämtning';
      schedule['Onsdag'] = 'Tempopass - medelhögt';
      schedule['Fredag'] = 'Intervaller - högt tempo';
      schedule['Söndag'] = 'Långpass - lugnt tempo';
    } else {
      schedule['Måndag'] = 'Lugn löpning - återhämtning';
      schedule['Tisdag'] = 'Tempopass - medelhögt';
      schedule['Torsdag'] = 'Intervaller - högt tempo';
      schedule['Fredag'] = 'Lugn löpning - återhämtning';
      schedule['Söndag'] = 'Långpass - lugnt tempo';
    }
    
    return schedule;
  };

  const calculateWeeklyDistance = (data, phase) => {
    const baseDistance = {
      '0-3': 10,
      '3-5': 20,
      '5-10': 35,
      '10-15': 50,
      '15-21': 60,
      '21+': 70
    };
    
    const base = baseDistance[data.distancePreference] || 25;
    const multiplier = phase === 1 ? 1 : phase === 2 ? 1.2 : 1.4;
    
    return `${Math.round(base * multiplier)} km`;
  };

  const generateKeyWorkouts = (data, phase) => {
    const workouts = [];
    
    if (phase === 'base') {
      workouts.push('Lugna löprundor 30-45 min');
      workouts.push('Långpass 60-90 min i samtalstempo');
    } else if (phase === 'build') {
      workouts.push('Tempopass 20-30 min i tröskeltempo');
      workouts.push('Intervaller 5x3 min med 90 sek vila');
      workouts.push('Långpass med tempoväxlingar');
    } else {
      workouts.push('Intervaller 8x2 min i hög hastighet');
      workouts.push('Tempopass 30-40 min');
      workouts.push('Simuleringslopp på 80% av målsträcka');
    }
    
    return workouts;
  };

  const generateProgressionPlan = (data) => {
    return {
      week1_4: 'Fokus på att bygga löpvana och grundkondition',
      week5_8: 'Gradvis ökning av distans och införande av tempopass',
      week9_12: 'Intensifiering med intervaller och målspecifik träning'
    };
  };

  const generateRecoveryProtocol = (data) => {
    return {
      betweenRuns: 'Minst 1 vilodag mellan hårda pass',
      weekly: '1-2 kompletta vilodagar per vecka',
      methods: ['Stretching 10-15 min efter varje pass', 'Foam rolling 2-3 ggr/vecka', 'Lätt yoga eller simning på vilodagar']
    };
  };

  const calculateDailyCalories = (data) => {
    const baseCalories = {
      '18-25': 2400,
      '26-35': 2300,
      '36-45': 2200,
      '46-55': 2100,
      '56+': 2000
    };
    
    const base = baseCalories[data.age_group] || 2200;
    const activityMultiplier = parseInt(data.trainingFrequency) * 0.1 + 1;
    
    return `${Math.round(base * activityMultiplier)}-${Math.round(base * activityMultiplier + 200)} kcal`;
  };

  const calculateHydration = (data) => {
    const base = 2.5;
    const trainingAddition = parseInt(data.trainingFrequency) * 0.2;
    
    return `${(base + trainingAddition).toFixed(1)}-${(base + trainingAddition + 0.5).toFixed(1)} liter per dag`;
  };

  const generatePreWorkoutMeal = (data) => {
    return {
      timing: '1-2 timmar före träning',
      options: [
        'Havregrynsgröt med banan och honung',
        'Toast med jordnötssmör och sylt',
        'Smoothie med bär, banan och yoghurt'
      ]
    };
  };

  const generatePostWorkoutMeal = (data) => {
    return {
      timing: 'Inom 30-60 minuter efter träning',
      options: [
        'Proteinshake med banan',
        'Grekisk yoghurt med granola och bär',
        'Kycklingsmörgås med grönsaker'
      ]
    };
  };

  const generateSupplements = (data) => {
    const supplements = ['D-vitamin (speciellt vinterhalvåret)'];
    
    if (parseInt(data.trainingFrequency) >= 4) {
      supplements.push('Magnesium för muskelåterhämtning');
      supplements.push('B-vitaminer för energiproduktion');
    }
    
    if (data.healthConcerns?.includes('joint')) {
      supplements.push('Omega-3 för ledhälsa');
    }
    
    return supplements;
  };

  const generateSleepRecommendation = (data) => {
    return {
      hours: '7-9 timmar per natt',
      tips: [
        'Gå och lägg dig samma tid varje kväll',
        'Undvik skärmar 1 timme före sömn',
        'Håll sovrummet svalt (16-18°C)'
      ]
    };
  };

  const generateStressManagement = (data) => {
    const methods = ['Djupandning 5 min dagligen'];
    
    if (data.motivationFactors?.includes('stress')) {
      methods.push('Meditation eller mindfulness 10-15 min');
      methods.push('Yoga 1-2 ggr/vecka');
    }
    
    return methods;
  };

  const generateCrossTraining = (data) => {
    const activities = [];
    
    if (data.environment === 'gym' || data.environment === 'both') {
      activities.push('Styrketräning 1-2 ggr/vecka');
    }
    
    activities.push('Cykling eller simning för variation');
    activities.push('Core-träning 2-3 ggr/vecka');
    
    return activities;
  };

  const generateInjuryPrevention = (data) => {
    const tips = ['Värm alltid upp 5-10 min före löpning'];
    
    if (data.healthConcerns?.includes('knee')) {
      tips.push('Stärk quadriceps och hamstrings');
      tips.push('Undvik branta nedförsbackar');
    }
    
    if (data.healthConcerns?.includes('back')) {
      tips.push('Core-stärkande övningar dagligen');
      tips.push('Fokus på löpteknik och hållning');
    }
    
    tips.push('Lyssna på kroppen - vila vid smärta');
    
    return tips;
  };

  const generateTopMatches = (data) => {
    return [
      {
        name: 'Emma Johansson',
        matchScore: 95,
        reason: 'Samma träningsmål och tempo',
        distance: '2.3 km bort'
      },
      {
        name: 'Marcus Lindberg',
        matchScore: 92,
        reason: 'Tränar samma tider och miljö',
        distance: '3.1 km bort'
      },
      {
        name: 'Sofia Andersson',
        matchScore: 88,
        reason: 'Liknande träningsfrekvens',
        distance: '1.8 km bort'
      }
    ];
  };

  // Render different question types
  const renderQuestion = () => {
    const question = questions[currentStep];
    
    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col"
      >
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
            {question.question}
          </h2>

          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm"
            >
              {validationError}
            </motion.div>
          )}

          {question.type === 'single' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {question.options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setAnswers({ ...answers, [question.id]: option.value });
                    setValidationError('');
                    handleNext();
                  }}
                  className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    answers[question.id] === option.value
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{option.icon}</span>
                    <span className="font-medium text-gray-900 text-left text-sm">{option.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {question.type === 'multiple' && (
            <div>
              <p className="text-sm text-gray-600 mb-3 text-center">Välj alla som passar</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                {question.options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      const current = answers[question.id] || [];
                      const newValue = current.includes(option.value)
                        ? current.filter(v => v !== option.value)
                        : [...current, option.value];
                      setAnswers({ ...answers, [question.id]: newValue });
                      setValidationError('');
                    }}
                    className={`p-3 rounded-xl border-2 transition-all transform ${
                      (answers[question.id] || []).includes(option.value)
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-medium text-gray-900 text-left text-sm">{option.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {question.type === 'text' && (
            <div className="max-w-md mx-auto">
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => {
                  setAnswers({ ...answers, [question.id]: e.target.value });
                  setValidationError('');
                }}
                placeholder={question.placeholder}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-gray-900"
                rows={3}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
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
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header with better design */}
                <div className="relative bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <motion.div
                      className="h-full bg-white shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base md:text-lg font-bold text-white">
                          AI Träningsanalys
                        </h2>
                        <p className="text-white/80 text-xs md:text-sm">
                          Fråga {currentStep} av {questions.length} • {Math.round(progress)}% klart
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="p-1.5 md:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors ml-2"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content - No scrolling */}
                <div className="flex-1 flex flex-col p-4 md:p-6">
                  <AnimatePresence mode="wait">
                    {renderQuestion()}
                  </AnimatePresence>
                </div>

                {/* Footer - Navigation buttons */}
                <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {currentStep > 0 && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={handleBack}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="font-medium text-sm">Tillbaka</span>
                        </motion.button>
                      )}
                      
                      {/* Skip button for text questions */}
                      {questions[currentStep].type === 'text' && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => {
                            setAnswers({ ...answers, [questions[currentStep].id]: 'Inget att rapportera' });
                            handleNext();
                          }}
                          className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
                        >
                          Hoppa över
                        </motion.button>
                      )}

                      {/* Demo button - always visible on first step */}
                      {currentStep === 0 && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={async () => {
                            console.log('Demo button clicked');
                            // Set loading state
                            setIsLoading(true);
                            
                            // Show loading messages
                            const messages = [
                              'Läser in svar...',
                              'Analyserar svar...',
                              'Planerar träningsschema...',
                              'Planerar kostschema...',
                              'Skapar översikt...'
                            ];
                            
                            let messageIndex = 0;
                            setLoadingMessage(messages[0]);
                            
                            const messageInterval = setInterval(() => {
                              messageIndex++;
                              if (messageIndex < messages.length) {
                                setLoadingMessage(messages[messageIndex]);
                              }
                            }, 1500);
                            
                            try {
                              // Generate comprehensive plan with demo data
                              const response = await api.post('/aicoach/comprehensive-plan', {
                                // Basic profile
                                age: 35,
                                gender: 'male',
                                weight: 75,
                                height: 180,
                                
                                // Goals and level
                                primaryGoal: 'fitness',
                                weightGoal: 'maintain',
                                targetRace: '10k',
                                currentLevel: 'regular',
                                
                                // Training status
                                weeklyRuns: 3,
                                weeklyHours: 4,
                                longestRun: 10,
                                
                                // Health
                                injuries: false,
                                injuryDetails: '',
                                
                                // Lifestyle
                                dietStyle: 'balanced',
                                sleepHours: 7,
                                
                                // Technology
                                currentDevices: ['smartphone', 'smartwatch'],
                                
                                // Motivation
                                motivationFactors: ['health', 'challenge', 'social'],
                                biggestChallenges: 'Hitta tid för träning med jobb och familj'
                              });

                              console.log('API Response:', response.data);

                              if (response.data && response.data.plan) {
                                clearInterval(messageInterval);
                                
                                // Save the plan to user's dashboard
                                await api.post('/dashboard', {
                                  hasCompletedAIAnalysis: true,
                                  aiAnalysisDate: new Date(),
                                  currentPlan: response.data.plan
                                });

                                // Navigate to results page
                                setTimeout(() => {
                                  navigate('/app/ai-coach-results', { 
                                    state: { plan: response.data.plan },
                                    replace: true 
                                  });
                                  onClose();
                                }, 500);
                              } else {
                                console.error('No plan in response:', response.data);
                                toast.error('Kunde inte generera träningsplan');
                                setIsLoading(false);
                              }
                            } catch (error) {
                              console.error('Error generating demo plan:', error);
                              clearInterval(messageInterval);
                              
                              // Generate demo plan
                              const demoData = {
                                age_group: '26-35',
                                primaryGoal: 'fitness',
                                currentLevel: 'regular',
                                trainingFrequency: '3',
                                weeklyHours: '3-5',
                                distancePreference: '5-10',
                                pacePreference: '5:30-6:00',
                                environment: 'both',
                                preferredTime: 'morning'
                              };
                              
                              const demoPlan = {
                                summary: {
                                  name: 'Din Personliga Löparplan',
                                  level: 'regular',
                                  goal: 'fitness',
                                  duration: '12 veckor',
                                  startDate: new Date().toLocaleDateString('sv-SE')
                                },
                                training: {
                                  weeklySchedule: generateWeeklySchedule(demoData),
                                  phases: [
                                    {
                                      name: 'Grundfas (Vecka 1-4)',
                                      focus: 'Bygga uthållighet och vana',
                                      weeklyDistance: calculateWeeklyDistance(demoData, 1),
                                      keyWorkouts: generateKeyWorkouts(demoData, 'base')
                                    },
                                    {
                                      name: 'Uppbyggnadsfas (Vecka 5-8)',
                                      focus: 'Öka distans och tempo',
                                      weeklyDistance: calculateWeeklyDistance(demoData, 2),
                                      keyWorkouts: generateKeyWorkouts(demoData, 'build')
                                    },
                                    {
                                      name: 'Toppfas (Vecka 9-12)',
                                      focus: 'Maximera prestation',
                                      weeklyDistance: calculateWeeklyDistance(demoData, 3),
                                      keyWorkouts: generateKeyWorkouts(demoData, 'peak')
                                    }
                                  ],
                                  progressionPlan: generateProgressionPlan(demoData),
                                  recoveryProtocol: generateRecoveryProtocol(demoData)
                                },
                                nutrition: {
                                  dailyCalories: calculateDailyCalories(demoData),
                                  macros: {
                                    carbs: '50-60%',
                                    protein: '20-25%',
                                    fat: '20-25%'
                                  },
                                  hydration: calculateHydration(demoData),
                                  preworkout: generatePreWorkoutMeal(demoData),
                                  postworkout: generatePostWorkoutMeal(demoData),
                                  supplements: generateSupplements(demoData)
                                },
                                lifestyle: {
                                  sleep: generateSleepRecommendation(demoData),
                                  stressManagement: generateStressManagement(demoData),
                                  crossTraining: generateCrossTraining(demoData),
                                  injuryPrevention: generateInjuryPrevention(demoData)
                                },
                                matches: {
                                  score: 95,
                                  topMatches: generateTopMatches(demoData)
                                }
                              };
                              
                              // Navigate to results page with demo plan
                              setTimeout(() => {
                                navigate('/app/ai-coach-results', { 
                                  state: { plan: demoPlan },
                                  replace: true 
                                });
                                onClose();
                              }, 500);
                            }
                          }}
                          className="text-purple-600 hover:text-purple-700 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Sparkles className="w-4 h-4" />
                          Demo: Slutför snabbt
                        </motion.button>
                      )}
                    </div>

                    <motion.button
                      onClick={handleNext}
                      disabled={!isStepComplete() && questions[currentStep].type !== 'text'}
                      className={`px-6 md:px-8 py-2 md:py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm md:text-base ${
                        (isStepComplete() || questions[currentStep].type === 'text')
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={(isStepComplete() || questions[currentStep].type === 'text') ? { scale: 1.05 } : {}}
                      whileTap={(isStepComplete() || questions[currentStep].type === 'text') ? { scale: 0.95 } : {}}
                    >
                      {currentStep === questions.length - 1 ? (
                        <>
                          Slutför
                          <Sparkles className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Fortsätt
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Loading Screen */}
      <AILoadingScreen 
        isVisible={isLoading} 
        message={loadingMessage}
        onComplete={() => {
          // This will be called when loading animation completes
          // The actual navigation happens in handleSubmit
        }} 
      />


    </>
  );
};

export default AICoachOnboarding; 