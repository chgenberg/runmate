import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Target,
  Activity,
  Calendar,
  Heart,
  TrendingUp,
  Award,
  Sparkles,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AICoachOnboarding = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal: '',
    currentLevel: '',
    weeklyRuns: '',
    personalBest: '',
    injuries: '',
    timeCommitment: ''
  });

  const questions = [
    {
      id: 'goal',
      title: 'Vad är ditt huvudmål? 🎯',
      subtitle: 'Berätta vad du vill uppnå med din löpning',
      icon: Target,
      options: [
        { value: 'speed', label: 'Springa snabbare', emoji: '⚡' },
        { value: 'distance', label: 'Springa längre', emoji: '🏃' },
        { value: 'weight', label: 'Gå ner i vikt', emoji: '💪' },
        { value: 'health', label: 'Förbättra hälsan', emoji: '❤️' },
        { value: 'race', label: 'Förbereda för lopp', emoji: '🏆' },
        { value: 'fun', label: 'Ha kul och må bra', emoji: '😊' }
      ]
    },
    {
      id: 'currentLevel',
      title: 'Hur skulle du beskriva din nuvarande nivå? 📊',
      subtitle: 'Detta hjälper oss anpassa träningen efter dig',
      icon: Activity,
      options: [
        { value: 'beginner', label: 'Nybörjare', emoji: '🌱', description: 'Jag har precis börjat eller springer sällan' },
        { value: 'intermediate', label: 'Medel', emoji: '🏃', description: 'Jag springer 2-3 gånger i veckan' },
        { value: 'advanced', label: 'Avancerad', emoji: '🚀', description: 'Jag springer 4+ gånger i veckan' },
        { value: 'elite', label: 'Elit', emoji: '🏅', description: 'Jag tävlar regelbundet' }
      ]
    },
    {
      id: 'weeklyRuns',
      title: 'Hur många gånger springer du per vecka? 📅',
      subtitle: 'Just nu, inte vad du siktar på',
      icon: Calendar,
      options: [
        { value: '0-1', label: '0-1 gånger', emoji: '🚶' },
        { value: '2-3', label: '2-3 gånger', emoji: '🏃' },
        { value: '4-5', label: '4-5 gånger', emoji: '🏃‍♂️' },
        { value: '6+', label: '6+ gånger', emoji: '🔥' }
      ]
    },
    {
      id: 'personalBest',
      title: 'Vad är ditt personbästa på 5km? ⏱️',
      subtitle: 'Om du inte vet, gissa ungefär',
      icon: TrendingUp,
      options: [
        { value: 'sub20', label: 'Under 20 min', emoji: '🚀' },
        { value: '20-25', label: '20-25 min', emoji: '⚡' },
        { value: '25-30', label: '25-30 min', emoji: '🏃' },
        { value: '30-35', label: '30-35 min', emoji: '👟' },
        { value: '35+', label: 'Över 35 min', emoji: '🌟' },
        { value: 'unknown', label: 'Vet inte', emoji: '❓' }
      ]
    },
    {
      id: 'injuries',
      title: 'Har du några skador eller begränsningar? 🩹',
      subtitle: 'Vi anpassar träningen för att hålla dig skadefri',
      icon: Heart,
      options: [
        { value: 'none', label: 'Inga skador', emoji: '💪' },
        { value: 'knee', label: 'Knäproblem', emoji: '🦵' },
        { value: 'ankle', label: 'Fotledsproblem', emoji: '🦶' },
        { value: 'back', label: 'Ryggproblem', emoji: '🔙' },
        { value: 'other', label: 'Annat', emoji: '🤕' }
      ]
    },
    {
      id: 'timeCommitment',
      title: 'Hur mycket tid kan du lägga på träning? ⏰',
      subtitle: 'Per vecka totalt',
      icon: Award,
      options: [
        { value: '1-2h', label: '1-2 timmar', emoji: '⏱️' },
        { value: '3-4h', label: '3-4 timmar', emoji: '⏰' },
        { value: '5-6h', label: '5-6 timmar', emoji: '📅' },
        { value: '7h+', label: '7+ timmar', emoji: '🎯' }
      ]
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

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
      const response = await api.post('/aicoach/onboarding', formData);
      
      if (response.data.success) {
        toast.success('Din AI-träningsplan är klar! 🎉');
        onComplete(response.data.plan);
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast.error('Något gick fel. Försök igen!');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
                <h2 className="text-2xl font-bold">AI Coach Setup</h2>
                <p className="text-white/80">Låt oss skapa din personliga träningsplan</p>
              </div>
            </div>

            {/* Progress bar */}
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
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-sport-yellow-100 rounded-full mb-4">
                    <currentQuestion.icon className="w-8 h-8 text-sport-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentQuestion.title}
                  </h3>
                  <p className="text-gray-600">
                    {currentQuestion.subtitle}
                  </p>
                </div>

                <div className="grid gap-3">
                  {currentQuestion.options.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionSelect(option.value)}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        formData[currentQuestion.id] === option.value
                          ? 'border-sport-yellow-500 bg-sport-yellow-50'
                          : 'border-gray-200 hover:border-sport-yellow-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.emoji}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{option.label}</p>
                            {option.description && (
                              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                            )}
                          </div>
                        </div>
                        {formData[currentQuestion.id] === option.value && (
                          <div className="w-6 h-6 bg-sport-yellow-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Tillbaka</span>
              </button>

              <div className="flex items-center space-x-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-sport-yellow-500'
                        : index < currentStep
                        ? 'bg-sport-yellow-300'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!formData[currentQuestion.id] || isLoading}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  formData[currentQuestion.id] && !isLoading
                    ? 'bg-sport-yellow-500 text-gray-900 hover:bg-sport-yellow-400 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 border-t-transparent" />
                    <span>Analyserar...</span>
                  </>
                ) : currentStep === questions.length - 1 ? (
                  <>
                    <span>Skapa min plan</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>Nästa</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AICoachOnboarding; 