import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import CoachingResults from '../../components/AICoach/CoachingResults';

const AICoachPage = () => {
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [coachingPlan, setCoachingPlan] = useState(null);
  const [formData, setFormData] = useState({
    primaryGoal: '',
    specificSport: '',
    currentLevel: '',
    weeklyHours: '',
    flexibleSchedule: '',
    currentDiet: '',
    dietaryRestrictions: [],
    sleepHours: '',
    stressLevel: '',
    injuries: [],
    previousExperience: '',
    motivation: '',
    pastChallenges: '',
    equipment: [],
    gymAccess: '',
    lifestyle: '',
    workSchedule: '',
    specificTarget: '',
    deadline: '',
    previousResults: ''
  });

  const questions = [
    {
      id: 'primaryGoal',
      title: 'Vad är ditt huvudmål? 🎯',
      subtitle: 'Välj det som motiverar dig mest',
      type: 'single-choice',
      options: [
        { value: 'weight-loss', label: 'Gå ner i vikt', icon: '⚖️', description: 'Förbränna fett och forma kroppen' },
        { value: 'muscle-gain', label: 'Bygga muskler', icon: '💪', description: 'Öka muskelmassa och styrka' },
        { value: 'endurance', label: 'Förbättra uthållighet', icon: '🏃', description: 'Springa längre och starkare' },
        { value: 'strength', label: 'Bli starkare', icon: '🏋️', description: 'Öka maxstyrka och kraft' },
        { value: 'health', label: 'Allmän hälsa', icon: '❤️', description: 'Må bättre och leva hälsosamt' },
        { value: 'competition', label: 'Tävla', icon: '🏆', description: 'Prestera i tävling eller event' }
      ]
    },
    {
      id: 'currentLevel',
      title: 'Hur skulle du beskriva din nuvarande nivå? 📊',
      subtitle: 'Var ärlig - detta hjälper oss skapa rätt plan',
      type: 'single-choice',
      options: [
        { value: 'beginner', label: 'Nybörjare', icon: '🌱', description: 'Jag har precis börjat eller tränar sällan' },
        { value: 'intermediate', label: 'Medelnivå', icon: '🏃', description: 'Jag tränar regelbundet 2-4 gånger/vecka' },
        { value: 'advanced', label: 'Avancerad', icon: '🚀', description: 'Jag tränar 5+ gånger/vecka med struktur' },
        { value: 'elite', label: 'Elit', icon: '🏅', description: 'Jag tävlar eller tränar på mycket hög nivå' }
      ]
    },
    {
      id: 'weeklyHours',
      title: 'Hur många timmar kan du träna per vecka? ⏱️',
      subtitle: 'Räkna realistiskt med din nuvarande livssituation',
      type: 'slider',
      min: 1,
      max: 20,
      unit: 'timmar'
    },
    {
      id: 'currentDiet',
      title: 'Hur ser din nuvarande kost ut? 🍎',
      subtitle: 'Ingen dömer - vi vill bara förstå utgångspunkten',
      type: 'single-choice',
      options: [
        { value: 'very-healthy', label: 'Mycket hälsosam', icon: '🥗', description: 'Jag äter mestadels näringsrik mat' },
        { value: 'mostly-healthy', label: 'Mestadels hälsosam', icon: '🍎', description: 'Bra bas med några undantag' },
        { value: 'mixed', label: 'Blandat', icon: '🍕', description: 'Både hälsosamt och ohälsosamt' },
        { value: 'needs-improvement', label: 'Behöver förbättras', icon: '🍟', description: 'Mycket processad mat och snacks' }
      ]
    },
    {
      id: 'sleepHours',
      title: 'Hur många timmar sover du per natt? 😴',
      subtitle: 'Sömn är avgörande för återhämtning och resultat',
      type: 'slider',
      min: 4,
      max: 10,
      unit: 'timmar'
    },
    {
      id: 'injuries',
      title: 'Har du några skador eller begränsningar? 🩹',
      subtitle: 'Vi anpassar träningen för att hålla dig skadefri',
      type: 'multi-choice',
      options: [
        { value: 'none', label: 'Inga skador', icon: '✅' },
        { value: 'knee', label: 'Knäproblem', icon: '🦵' },
        { value: 'back', label: 'Ryggproblem', icon: '🔙' },
        { value: 'shoulder', label: 'Axelproblem', icon: '💪' },
        { value: 'ankle', label: 'Fotledsproblem', icon: '🦶' },
        { value: 'wrist', label: 'Handledsproblem', icon: '✋' },
        { value: 'other', label: 'Annat', icon: '🩹' }
      ]
    },
    {
      id: 'motivation',
      title: 'Vad motiverar dig mest att träna? 🔥',
      subtitle: 'Detta hjälper oss designa en plan som håller dig engagerad',
      type: 'single-choice',
      options: [
        { value: 'results', label: 'Se resultat', icon: '📈', description: 'Fysiska förändringar och framsteg' },
        { value: 'energy', label: 'Känna mig energisk', icon: '⚡', description: 'Må bättre i vardagen' },
        { value: 'challenge', label: 'Utmana mig själv', icon: '🎯', description: 'Sätta och nå nya mål' },
        { value: 'social', label: 'Träna med andra', icon: '👥', description: 'Gemenskap och stöd' },
        { value: 'stress-relief', label: 'Minska stress', icon: '🧘', description: 'Mental hälsa och avkoppling' },
        { value: 'routine', label: 'Ha en rutin', icon: '📅', description: 'Struktur i vardagen' }
      ]
    },
    {
      id: 'equipment',
      title: 'Vilken träningsutrustning har du tillgång till? 🏋️',
      subtitle: 'Vi anpassar övningarna efter vad du har',
      type: 'multi-choice',
      options: [
        { value: 'bodyweight', label: 'Kroppsvikt', icon: '🤸' },
        { value: 'dumbbells', label: 'Hantlar', icon: '🏋️' },
        { value: 'resistance-bands', label: 'Gummiband', icon: '🎯' },
        { value: 'kettlebells', label: 'Kettlebells', icon: '⚫' },
        { value: 'barbell', label: 'Skivstång', icon: '🏋️‍♂️' },
        { value: 'cardio-machine', label: 'Kardiomaskin', icon: '🏃‍♀️' },
        { value: 'full-gym', label: 'Komplett gym', icon: '🏢' }
      ]
    },
    {
      id: 'lifestyle',
      title: 'Hur ser din livsstil ut? 🏠',
      subtitle: 'Detta påverkar hur vi strukturerar din plan',
      type: 'single-choice',
      options: [
        { value: 'student', label: 'Student', icon: '🎓', description: 'Flexibel schema, begränsad budget' },
        { value: 'office-worker', label: 'Kontorsarbetare', icon: '💼', description: 'Sitter mycket, regelbundna tider' },
        { value: 'parent', label: 'Förälder', icon: '👨‍👩‍👧‍👦', description: 'Begränsad tid, familjeansvar' },
        { value: 'shift-worker', label: 'Skiftarbetare', icon: '🌙', description: 'Oregelbundna tider' },
        { value: 'entrepreneur', label: 'Företagare', icon: '🚀', description: 'Flexibel men opredictable' },
        { value: 'retired', label: 'Pensionär', icon: '🌅', description: 'Mycket tid, fokus på hälsa' }
      ]
    },
    {
      id: 'specificTarget',
      title: 'Har du ett specifikt mål eller event? 🎯',
      subtitle: 'T.ex. marathon, bröllop, semester, tävling',
      type: 'text',
      placeholder: 'Beskriv ditt specifika mål...'
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
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
      const response = await api.post('/aicoach/generate-structured-plan', formData);
      
      if (response.data.success) {
        setCoachingPlan(response.data.plan);
        setShowResults(true);
        toast.success('Din personliga tränings- och kostplan är klar! 🎉');
      }
    } catch (error) {
      console.error('Error creating coaching plan:', error);
      toast.error('Något gick fel. Försök igen!');
    } finally {
      setIsLoading(false);
    }
  };

  const isAnswered = () => {
    const value = formData[currentQuestion.id];
    if (currentQuestion.type === 'multi-choice') {
      return Array.isArray(value) && value.length > 0;
    }
    return value && value.toString().length > 0;
  };

  if (showResults && coachingPlan) {
    return <CoachingResults plan={coachingPlan} onBack={() => setShowResults(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sport-lime-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-sport-lime-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Coach 2.0</h1>
                <p className="text-sm text-gray-600">Personlig tränings- och kostcoach</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">Powered by GPT-4</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Fråga {currentStep + 1} av {questions.length}</span>
              <span>{Math.round(progress)}% klart</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-orange-500 to-sport-lime-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {currentQuestion.title}
              </h2>
              <p className="text-lg text-gray-600">
                {currentQuestion.subtitle}
              </p>
            </div>

            <QuestionRenderer 
              question={currentQuestion}
              value={formData[currentQuestion.id]}
              onChange={(value) => handleAnswer(currentQuestion.id, value)}
            />

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Tillbaka</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!isAnswered() || isLoading}
                className={`flex items-center space-x-2 px-8 py-3 rounded-2xl transition-all ${
                  isAnswered() && !isLoading
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Skapar din plan...</span>
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Question Renderer Component
const QuestionRenderer = ({ question, value, onChange }) => {
  switch (question.type) {
    case 'single-choice':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                value === option.value
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {option.label}
                  </h3>
                  {option.description && (
                    <p className="text-gray-600 text-sm">{option.description}</p>
                  )}
                </div>
                {value === option.value && (
                  <Check className="w-6 h-6 text-orange-500" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      );

    case 'multi-choice':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option) => {
            const isSelected = Array.isArray(value) && value.includes(option.value);
            return (
              <motion.button
                key={option.value}
                onClick={() => {
                  const currentArray = Array.isArray(value) ? value : [];
                  if (option.value === 'none') {
                    onChange(['none']);
                  } else {
                    const filtered = currentArray.filter(v => v !== 'none');
                    if (isSelected) {
                      onChange(filtered.filter(v => v !== option.value));
                    } else {
                      onChange([...filtered, option.value]);
                    }
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {option.icon && <span className="text-2xl">{option.icon}</span>}
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {isSelected && <Check className="w-5 h-5 text-orange-500 ml-auto" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      );

    case 'slider':
      return (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-orange-500 mb-2">
              {value || question.min}
            </div>
            <div className="text-xl text-gray-600">{question.unit}</div>
          </div>
          <input
            type="range"
            min={question.min}
            max={question.max}
            value={value || question.min}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${((value || question.min) - question.min) / (question.max - question.min) * 100}%, #e5e7eb ${((value || question.min) - question.min) / (question.max - question.min) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{question.min}</span>
            <span>{question.max}</span>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="max-w-2xl mx-auto">
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none resize-none text-lg"
            rows={4}
          />
        </div>
      );

    default:
      return null;
  }
};



export default AICoachPage; 