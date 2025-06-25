import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Activity,
  Target,
  Clock,
  Zap,
  Brain,
  Apple
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import AppleHealthSyncModal from '../Layout/AppleHealthSyncModal';

const AICoachOnboarding = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAppleHealthModal, setShowAppleHealthModal] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState([]);
  const [formData, setFormData] = useState({
    primaryGoal: '',
    currentLevel: '',
    weeklyTrainingTime: '',
    currentRunningFrequency: '',
    longestRecentRun: '',
    personalBest: '',
    injuryHistory: '',
    currentMotivation: '',
    preferredTrainingTime: '',
    trainingEnvironment: '',
    dietaryStyle: '',
    sleepQuality: '',
    stressLevel: '',
    socialPreference: '',
    specificChallenges: ''
  });

  const questions = [
    {
      id: 'primaryGoal',
      title: 'Vad är ditt huvudmål med löpningen?',
      subtitle: 'Välj det som bäst beskriver vad du vill uppnå',
      type: 'single',
      options: [
        { value: 'lose_weight', label: 'Gå ner i vikt', icon: '⚖️' },
        { value: 'improve_fitness', label: 'Förbättra kondition', icon: '💪' },
        { value: 'run_race', label: 'Springa ett lopp (5K, 10K, halvmara)', icon: '🏃‍♂️' },
        { value: 'stress_relief', label: 'Minska stress & må bättre', icon: '🧘‍♀️' },
        { value: 'social', label: 'Träffa nya löparvänner', icon: '👥' },
        { value: 'challenge', label: 'Utmana mig själv', icon: '🎯' }
      ]
    },
    {
      id: 'currentLevel',
      title: 'Hur skulle du beskriva din nuvarande löpnivå?',
      subtitle: 'Var ärlig - detta hjälper oss skapa rätt plan för dig',
      type: 'single',
      options: [
        { value: 'beginner', label: 'Nybörjare', description: 'Har knappt sprungit eller inte på flera år', icon: '🌱' },
        { value: 'casual', label: 'Motionär', description: 'Springer då och då, 1-2 gånger/vecka', icon: '🚶‍♂️' },
        { value: 'regular', label: 'Regelbunden', description: 'Springer 3-4 gånger/vecka konsekvent', icon: '🏃‍♂️' },
        { value: 'experienced', label: 'Erfaren', description: 'Springer regelbundet, deltagit i lopp', icon: '🏆' },
        { value: 'competitive', label: 'Tävlingsinriktad', description: 'Tränar strukturerat, fokus på prestationer', icon: '🥇' }
      ]
    },
    {
      id: 'weeklyTrainingTime',
      title: 'Hur mycket tid kan du avsätta för träning per vecka?',
      subtitle: 'Räkna med alla typer av träning, inte bara löpning',
      type: 'single',
      options: [
        { value: '1-2', label: '1-2 timmar', icon: '⏱️' },
        { value: '3-4', label: '3-4 timmar', icon: '⏰' },
        { value: '5-6', label: '5-6 timmar', icon: '🕐' },
        { value: '7-8', label: '7-8 timmar', icon: '🕑' },
        { value: '9+', label: '9+ timmar', icon: '🕒' }
      ]
    },
    {
      id: 'currentRunningFrequency',
      title: 'Hur ofta springer du för närvarande?',
      subtitle: 'Under de senaste 2 månaderna',
      type: 'single',
      options: [
        { value: 'never', label: 'Aldrig eller mycket sällan', icon: '😴' },
        { value: 'monthly', label: 'Någon gång i månaden', icon: '📅' },
        { value: 'weekly', label: '1 gång i veckan', icon: '📆' },
        { value: 'biweekly', label: '2-3 gånger i veckan', icon: '🗓️' },
        { value: 'frequent', label: '4+ gånger i veckan', icon: '📊' }
      ]
    },
    {
      id: 'longestRecentRun',
      title: 'Vad är det längsta du sprungit på sistone?',
      subtitle: 'Utan stopp, under de senaste 3 månaderna',
      type: 'single',
      options: [
        { value: '0-1km', label: 'Mindre än 1 km', icon: '🐣' },
        { value: '1-3km', label: '1-3 km', icon: '🚶‍♂️' },
        { value: '3-5km', label: '3-5 km', icon: '🏃‍♂️' },
        { value: '5-10km', label: '5-10 km', icon: '💪' },
        { value: '10km+', label: 'Mer än 10 km', icon: '🏆' }
      ]
    },
    {
      id: 'personalBest',
      title: 'Har du någon personlig rekordtid du är stolt över?',
      subtitle: 'På vilken distans som helst - detta hjälper oss förstå din potential',
      type: 'single',
      options: [
        { value: 'none', label: 'Nej, har inga tider att jämföra med', icon: '🤷‍♂️' },
        { value: '5k_slow', label: '5K på över 30 min', icon: '🐌' },
        { value: '5k_moderate', label: '5K på 25-30 min', icon: '🚶‍♂️' },
        { value: '5k_good', label: '5K på 20-25 min', icon: '🏃‍♂️' },
        { value: '5k_fast', label: '5K under 20 min', icon: '⚡' },
        { value: 'longer', label: 'Bäst på längre distanser (10K+)', icon: '🏆' }
      ]
    },
    {
      id: 'injuryHistory',
      title: 'Har du några skador eller fysiska begränsningar?',
      subtitle: 'Detta hjälper oss anpassa träningen för att undvika problem',
      type: 'single',
      options: [
        { value: 'none', label: 'Inga kända problem', icon: '✅' },
        { value: 'knee', label: 'Knäproblem', icon: '🦵' },
        { value: 'back', label: 'Ryggproblem', icon: '🏥' },
        { value: 'ankle', label: 'Ankel/fot-problem', icon: '🦶' },
        { value: 'other', label: 'Andra begränsningar', icon: '⚠️' },
        { value: 'recovering', label: 'Återhämtar mig från skada', icon: '🩹' }
      ]
    },
    {
      id: 'currentMotivation',
      title: 'Vad motiverar dig mest att träna?',
      subtitle: 'Välj det som verkligen får dig att vilja komma ut och springa',
      type: 'single',
      options: [
        { value: 'health', label: 'Hälsa och välbefinnande', icon: '❤️' },
        { value: 'appearance', label: 'Se bra ut och känna mig stark', icon: '💪' },
        { value: 'competition', label: 'Tävla och förbättra tider', icon: '🏁' },
        { value: 'social', label: 'Träffa människor och ha kul', icon: '👫' },
        { value: 'mental', label: 'Mental hälsa och stressreducering', icon: '🧠' },
        { value: 'challenge', label: 'Personliga utmaningar och mål', icon: '🎯' }
      ]
    },
    {
      id: 'preferredTrainingTime',
      title: 'När föredrar du att träna?',
      subtitle: 'Vi anpassar träningsplanen efter din livsstil',
      type: 'single',
      options: [
        { value: 'early_morning', label: 'Tidigt på morgonen (05:00-07:00)', icon: '🌅' },
        { value: 'morning', label: 'På morgonen (07:00-10:00)', icon: '☀️' },
        { value: 'lunch', label: 'Lunch (11:00-14:00)', icon: '🥪' },
        { value: 'afternoon', label: 'Eftermiddag (14:00-17:00)', icon: '🌤️' },
        { value: 'evening', label: 'Kväll (17:00-20:00)', icon: '🌆' },
        { value: 'flexible', label: 'Flexibelt, beror på dagen', icon: '🔄' }
      ]
    },
    {
      id: 'trainingEnvironment',
      title: 'Var föredrar du att springa?',
      subtitle: 'Vi kan anpassa träningen efter din miljö',
      type: 'single',
      options: [
        { value: 'outdoor_nature', label: 'Utomhus i naturen', icon: '🌲' },
        { value: 'outdoor_city', label: 'Utomhus i staden', icon: '🏙️' },
        { value: 'treadmill', label: 'På löpband hemma/gym', icon: '🏃‍♀️' },
        { value: 'track', label: 'På löpbana', icon: '🏃‍♂️' },
        { value: 'mixed', label: 'Blandat, beror på väder/tid', icon: '🌦️' }
      ]
    },
    {
      id: 'dietaryStyle',
      title: 'Hur skulle du beskriva dina matvanor?',
      subtitle: 'Kost är en viktig del av träningsresultatet',
      type: 'single',
      options: [
        { value: 'balanced', label: 'Balanserad blandkost', icon: '🥗' },
        { value: 'vegetarian', label: 'Vegetarisk', icon: '🥬' },
        { value: 'vegan', label: 'Vegansk', icon: '🌱' },
        { value: 'low_carb', label: 'Låg kolhydrater/LCHF', icon: '🥩' },
        { value: 'irregular', label: 'Oregelbunden, äter vad som finns', icon: '🤷‍♂️' },
        { value: 'weight_focused', label: 'Fokuserar på viktminskning', icon: '⚖️' }
      ]
    },
    {
      id: 'sleepQuality',
      title: 'Hur är din sömnkvalitet?',
      subtitle: 'Sömn är avgörande för återhämtning och prestationer',
      type: 'single',
      options: [
        { value: 'excellent', label: 'Utmärkt (7-9h, vaknar pigg)', icon: '😴' },
        { value: 'good', label: 'Bra (6-8h, mestadels utvilad)', icon: '😊' },
        { value: 'average', label: 'Okej (varierar, ibland trött)', icon: '😐' },
        { value: 'poor', label: 'Dålig (under 6h eller dålig kvalitet)', icon: '😵' },
        { value: 'irregular', label: 'Mycket oregelbunden', icon: '🌙' }
      ]
    },
    {
      id: 'stressLevel',
      title: 'Hur är din stressnivå i vardagen?',
      subtitle: 'Stress påverkar både träning och återhämtning',
      type: 'single',
      options: [
        { value: 'low', label: 'Låg - känner mig avslappnad', icon: '😌' },
        { value: 'moderate', label: 'Måttlig - normal vardagsstress', icon: '😐' },
        { value: 'high', label: 'Hög - känner mig ofta stressad', icon: '😰' },
        { value: 'very_high', label: 'Mycket hög - konstant stressad', icon: '🤯' },
        { value: 'variable', label: 'Varierar mycket från dag till dag', icon: '🎢' }
      ]
    },
    {
      id: 'socialPreference',
      title: 'Föredrar du att träna ensam eller med andra?',
      subtitle: 'Vi kan anpassa rekommendationerna efter din personlighet',
      type: 'single',
      options: [
        { value: 'alone', label: 'Ensam - min egen tid och tempo', icon: '🧘‍♂️' },
        { value: 'small_group', label: 'Liten grupp (2-4 personer)', icon: '👥' },
        { value: 'large_group', label: 'Större grupp eller klubb', icon: '👨‍👩‍👧‍👦' },
        { value: 'partner', label: 'Med en träningspartner', icon: '👫' },
        { value: 'flexible', label: 'Blandat - beror på humör', icon: '🔄' }
      ]
    },
    {
      id: 'specificChallenges',
      title: 'Vad är din största utmaning med träning?',
      subtitle: 'Sista frågan - vi hjälper dig övervinna det som hindrar dig',
      type: 'single',
      options: [
        { value: 'time', label: 'Hitta tid i vardagen', icon: '⏰' },
        { value: 'motivation', label: 'Hålla motivationen uppe', icon: '💪' },
        { value: 'consistency', label: 'Vara konsekvent', icon: '📅' },
        { value: 'weather', label: 'Väder och årstider', icon: '🌦️' },
        { value: 'technique', label: 'Rätt teknik och form', icon: '🎯' },
        { value: 'injury_fear', label: 'Rädsla för skador', icon: '⚠️' }
      ]
    }
  ];

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (value) => {
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last question - show Apple Health integration
      setShowAppleHealthModal(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAppleHealthComplete = () => {
    setShowAppleHealthModal(false);
    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Show loading messages sequence
    const messages = [
      'Analyserar dina svar...',
      'Beräknar förbättringsmöjligheter...',
      'Skapar träningsschema...',
      'Ställer in kostplan...',
      'Optimerar för dina mål...',
      'Slutför din personliga plan...'
    ];
    
    let messageIndex = 0;
    setLoadingMessages([messages[messageIndex]]);
    
    const messageInterval = setInterval(() => {
      messageIndex++;
      if (messageIndex < messages.length) {
        setLoadingMessages(prev => [...prev, messages[messageIndex]]);
      } else {
        clearInterval(messageInterval);
      }
    }, 1500);

    try {
      // Call comprehensive plan endpoint
      const response = await api.post('/aicoach/comprehensive-plan', {
        primaryGoal: formData.primaryGoal,
        currentLevel: formData.currentLevel,
        weeklyHours: formData.weeklyTrainingTime,
        currentDiet: formData.dietaryStyle,
        sleepHours: formData.sleepQuality,
        injuries: formData.injuryHistory,
        motivation: formData.currentMotivation,
        equipment: formData.trainingEnvironment,
        lifestyle: `${formData.preferredTrainingTime}, ${formData.stressLevel} stress, ${formData.socialPreference} training preference`,
        specificTarget: `Current frequency: ${formData.currentRunningFrequency}, Longest run: ${formData.longestRecentRun}, PB: ${formData.personalBest}, Main challenge: ${formData.specificChallenges}`
      });

      if (response.data.success) {
        clearInterval(messageInterval);
        setTimeout(() => {
          setIsLoading(false);
          toast.success('🎉 Din kompletta tränings- och kostplan är klar!', {
            duration: 4000
          });
          onComplete(response.data.plan);
          onClose();
        }, 2000);
      }
    } catch (error) {
      clearInterval(messageInterval);
      console.error('Error creating comprehensive plan:', error);
      setIsLoading(false);
      toast.error('Något gick fel. Försök igen!');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Loading Screen */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-gradient-to-br from-orange-500 to-sport-lime-400 z-[60] flex items-center justify-center"
        >
          <div className="text-center text-white max-w-md mx-auto px-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-8"
            >
              <Brain className="w-full h-full" />
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-6">AI Coach arbetar...</h2>
            
            <div className="space-y-3">
              {loadingMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-center space-x-3"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-lg">{message}</span>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-8"
            >
              <Sparkles className="w-8 h-8 mx-auto text-yellow-300" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Main Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-500 to-sport-lime-400 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Gratis AI-träningsanalys</h2>
                <p className="text-white/80">15 frågor • 5 minuter • Livslång plan</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Fråga {currentStep + 1} av {questions.length}</span>
              <span>{Math.round(progress)}% klart</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {currentQuestion.title}
              </h3>
              <p className="text-gray-600 mb-8">
                {currentQuestion.subtitle}
              </p>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      formData[currentQuestion.id] === option.value
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                        )}
                      </div>
                      {formData[currentQuestion.id] === option.value && (
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Tillbaka</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!formData[currentQuestion.id]}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-sport-lime-400 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>{currentStep === questions.length - 1 ? 'Slutför analys' : 'Nästa'}</span>
                {currentStep === questions.length - 1 ? (
                  <Apple className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Apple Health Modal */}
      <AppleHealthSyncModal 
        isOpen={showAppleHealthModal}
        onClose={() => {
          setShowAppleHealthModal(false);
          handleSubmit(); // Continue even if they skip Apple Health
        }}
        onComplete={handleAppleHealthComplete}
      />
    </AnimatePresence>
  );
};

export default AICoachOnboarding; 