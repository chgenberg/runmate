import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Brain,
  Apple,
  Heart,
  Activity,
  User,
  Clock,
  Target,
  Utensils,
  Smartphone,
  Users,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import AppleHealthSyncModal from '../Layout/AppleHealthSyncModal';

const AICoachOnboarding = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [showAppleHealth, setShowAppleHealth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState([]);

  // Dynamic questions based on previous answers
  const getQuestions = () => {
    const baseQuestions = [
      // STEG 1: Grundläggande profil
      {
        id: 'basicProfile',
        title: 'Låt oss börja med grunderna',
        subtitle: 'Detta hjälper oss skapa en helt personlig plan för dig',
        type: 'profile',
        icon: User,
        fields: [
          { id: 'age', label: 'Ålder', type: 'number', placeholder: 'År', required: true },
          { 
            id: 'gender', 
            label: 'Kön', 
            type: 'select', 
            options: [
              { value: 'male', label: 'Man' },
              { value: 'female', label: 'Kvinna' },
              { value: 'other', label: 'Annat/vill ej ange' }
            ], 
            required: true 
          },
          { id: 'weight', label: 'Vikt (kg)', type: 'number', placeholder: 'kg', required: false },
          { id: 'height', label: 'Längd (cm)', type: 'number', placeholder: 'cm', required: false }
        ]
      },

      // STEG 2: Primärt mål
      {
        id: 'primaryGoal',
        title: 'Vad är ditt huvudmål med löpning?',
        subtitle: 'Välj det som bäst beskriver vad du vill uppnå',
        type: 'single',
        icon: Target,
        options: [
          { value: 'weight_loss', label: 'Gå ner i vikt', description: 'Förbränna kalorier och minska kroppsvikt', icon: '⚖️' },
          { value: 'fitness', label: 'Förbättra konditionen', description: 'Bli starkare och mer uthållig', icon: '💪' },
          { value: 'race_prep', label: 'Träna för lopp', description: 'Förbereda för specifik tävling eller distans', icon: '🏁' },
          { value: 'health', label: 'Allmän hälsa', description: 'Må bättre och leva hälsosammare', icon: '❤️' },
          { value: 'mental', label: 'Mental hälsa', description: 'Minska stress och förbättra välbefinnande', icon: '🧠' },
          { value: 'social', label: 'Träffa människor', description: 'Hitta träningspartners och gemenskap', icon: '👥' },
          { value: 'challenge', label: 'Utmana mig själv', description: 'Sätta och uppnå personliga mål', icon: '🎯' }
        ]
      },

      // STEG 3: Nuvarande nivå
      {
        id: 'currentLevel',
        title: 'Hur skulle du beskriva din nuvarande löpnivå?',
        subtitle: 'Var ärlig - detta hjälper oss skapa rätt plan för dig',
        type: 'single',
        icon: Activity,
        options: [
          { value: 'beginner', label: 'Nybörjare', description: 'Har knappt sprungit eller inte på flera år', icon: '🌱' },
          { value: 'casual', label: 'Motionär', description: 'Springer då och då, 1-2 gånger/vecka', icon: '🚶‍♂️' },
          { value: 'regular', label: 'Regelbunden', description: 'Springer 3-4 gånger/vecka konsekvent', icon: '🏃‍♂️' },
          { value: 'experienced', label: 'Erfaren', description: 'Springer regelbundet, deltagit i lopp', icon: '🏆' },
          { value: 'competitive', label: 'Tävlingsinriktad', description: 'Tränar strukturerat, fokus på prestationer', icon: '🥇' }
        ]
      }
    ];

    // Add follow-up questions based on answers
    const followUpQuestions = [];

    // FÖLJDFRÅGOR BASERAT PÅ PRIMÄRT MÅL
    if (formData.primaryGoal === 'weight_loss') {
      followUpQuestions.push({
        id: 'weightGoal',
        title: 'Hur mycket vikt vill du gå ner?',
        subtitle: 'Detta hjälper oss sätta realistiska mål och tidsramar',
        type: 'single',
        icon: Target,
        options: [
          { value: '1-5kg', label: '1-5 kg', description: 'Mindre justering', icon: '📉' },
          { value: '5-10kg', label: '5-10 kg', description: 'Måttlig viktminskning', icon: '📊' },
          { value: '10-20kg', label: '10-20 kg', description: 'Betydande förändring', icon: '📈' },
          { value: '20kg+', label: 'Mer än 20 kg', description: 'Stor livsstilsförändring', icon: '🎯' }
        ]
      });
    }

    if (formData.primaryGoal === 'race_prep') {
      followUpQuestions.push({
        id: 'targetRace',
        title: 'Vilken distans tränar du för?',
        subtitle: 'Vi anpassar träningsplanen efter din måldistans',
        type: 'single',
        icon: Target,
        options: [
          { value: '5k', label: '5K', description: 'Perfekt för nybörjare', icon: '🏃‍♂️' },
          { value: '10k', label: '10K', description: 'Populär utmaning', icon: '🏃‍♀️' },
          { value: 'half_marathon', label: 'Halvmaraton (21K)', description: 'Stor utmaning', icon: '🏅' },
          { value: 'marathon', label: 'Marathon (42K)', description: 'Ultimata utmaningen', icon: '🏆' },
          { value: 'ultra', label: 'Ultra (50K+)', description: 'Extremutmaning', icon: '🚀' }
        ]
      });
    }

    // ALLTID: Träningsfrekvens och tid
    followUpQuestions.push(
      {
        id: 'currentTraining',
        title: 'Hur tränar du för närvarande?',
        subtitle: 'Berätta om dina nuvarande träningsvanor',
        type: 'multiple_fields',
        icon: Clock,
        fields: [
          { 
            id: 'weekly_runs', 
            label: 'Antal löprundor per vecka', 
            type: 'select', 
            options: [
              { value: '0', label: '0 - springer inte alls' },
              { value: '1', label: '1 gång per vecka' },
              { value: '2', label: '2 gånger per vecka' },
              { value: '3', label: '3 gånger per vecka' },
              { value: '4', label: '4 gånger per vecka' },
              { value: '5+', label: '5+ gånger per vecka' }
            ],
            required: true 
          },
          { 
            id: 'weekly_hours', 
            label: 'Total träningstid per vecka', 
            type: 'select', 
            options: [
              { value: '0-1', label: '0-1 timmar' },
              { value: '1-3', label: '1-3 timmar' },
              { value: '3-5', label: '3-5 timmar' },
              { value: '5-8', label: '5-8 timmar' },
              { value: '8+', label: '8+ timmar' }
            ],
            required: true 
          },
          { id: 'longest_run', label: 'Längsta löprunda senaste månaden', type: 'text', placeholder: 'km (t.ex. 8)', required: false }
        ]
      },

      // HÄLSA OCH BEGRÄNSNINGAR
      {
        id: 'healthProfile',
        title: 'Hälsa och fysiska förutsättningar',
        subtitle: 'Detta hjälper oss skapa en säker träningsplan',
        type: 'health_profile',
        icon: Heart,
        sections: [
          {
            title: 'Skador och begränsningar',
            fields: [
              { 
                id: 'injuries', 
                label: 'Nuvarande eller tidigare skador', 
                type: 'checkboxes', 
                options: [
                  { value: 'none', label: 'Inga kända problem' },
                  { value: 'knee', label: 'Knäproblem' },
                  { value: 'back', label: 'Ryggproblem' },
                  { value: 'ankle', label: 'Ankel/fot-problem' },
                  { value: 'hip', label: 'Höftproblem' },
                  { value: 'shin', label: 'Skenben' },
                  { value: 'other', label: 'Annat (specificera nedan)' }
                ]
              },
              { id: 'injury_details', label: 'Detaljer om skador/begränsningar', type: 'textarea', placeholder: 'Beskriv eventuella skador eller begränsningar...', required: false }
            ]
          }
        ]
      },

      // LIVSSTIL OCH PREFERENSER  
      {
        id: 'lifestyleProfile',
        title: 'Din livsstil och preferenser',
        subtitle: 'Vi anpassar planen efter ditt liv',
        type: 'lifestyle_profile',
        icon: Utensils,
        sections: [
          {
            title: 'Kost och återhämtning',
            fields: [
              { 
                id: 'diet_style', 
                label: 'Kostpreferenser', 
                type: 'select',
                options: [
                  { value: 'omnivore', label: 'Blandat (allt)' },
                  { value: 'vegetarian', label: 'Vegetarisk' },
                  { value: 'vegan', label: 'Vegansk' },
                  { value: 'pescatarian', label: 'Pescatarian (fisk ok)' },
                  { value: 'low_carb', label: 'Låg kolhydrater/LCHF' },
                  { value: 'mediterranean', label: 'Medelhavskost' }
                ],
                required: true
              },
              { 
                id: 'sleep_hours', 
                label: 'Genomsnittlig sömn per natt', 
                type: 'select',
                options: [
                  { value: '<5', label: 'Mindre än 5 timmar' },
                  { value: '5-6', label: '5-6 timmar' },
                  { value: '6-7', label: '6-7 timmar' },
                  { value: '7-8', label: '7-8 timmar' },
                  { value: '8-9', label: '8-9 timmar' },
                  { value: '9+', label: 'Mer än 9 timmar' }
                ],
                required: true
              }
            ]
          }
        ]
      },

      // TEKNOLOGI OCH VERKTYG
      {
        id: 'technologyProfile',
        title: 'Teknologi och verktyg',
        subtitle: 'Vilka verktyg använder du redan?',
        type: 'technology_profile',
        icon: Smartphone,
        sections: [
          {
            title: 'Enheter och appar',
            fields: [
              { 
                id: 'current_devices', 
                label: 'Vilka enheter använder du?', 
                type: 'checkboxes',
                options: [
                  { value: 'none', label: 'Inga särskilda enheter' },
                  { value: 'smartphone', label: 'Smartphone (iPhone/Android)' },
                  { value: 'apple_watch', label: 'Apple Watch' },
                  { value: 'garmin', label: 'Garmin klocka' },
                  { value: 'fitbit', label: 'Fitbit' },
                  { value: 'polar', label: 'Polar klocka' },
                  { value: 'chest_strap', label: 'Pulsbälte' }
                ]
              }
            ]
          }
        ]
      },

      // MOTIVATION OCH MÅL
      {
        id: 'motivationProfile',
        title: 'Motivation och utmaningar',
        subtitle: 'Sista steget - hjälp oss förstå vad som driver dig',
        type: 'motivation_profile',
        icon: Users,
        sections: [
          {
            title: 'Drivkrafter och utmaningar',
            fields: [
              { 
                id: 'motivation_factors', 
                label: 'Vad motiverar dig mest? (välj upp till 3)', 
                type: 'checkboxes',
                maxSelections: 3,
                options: [
                  { value: 'health', label: 'Förbättra hälsan' },
                  { value: 'appearance', label: 'Se bättre ut' },
                  { value: 'performance', label: 'Bli snabbare/starkare' },
                  { value: 'mental_health', label: 'Mental hälsa och välbefinnande' },
                  { value: 'social', label: 'Träffa människor' },
                  { value: 'competition', label: 'Tävla och vinna' },
                  { value: 'personal_challenge', label: 'Personliga utmaningar' },
                  { value: 'routine', label: 'Skapa bra rutiner' },
                  { value: 'energy', label: 'Få mer energi' },
                  { value: 'longevity', label: 'Leva längre och bättre' }
                ]
              },
              { 
                id: 'biggest_challenges', 
                label: 'Vilka är dina största utmaningar? (välj alla som stämmer)', 
                type: 'checkboxes',
                options: [
                  { value: 'time', label: 'Hitta tid att träna' },
                  { value: 'motivation', label: 'Hålla motivationen uppe' },
                  { value: 'consistency', label: 'Vara konsekvent' },
                  { value: 'weather', label: 'Väder och årstider' },
                  { value: 'injury_fear', label: 'Rädsla för skador' },
                  { value: 'technique', label: 'Osäker på rätt teknik' },
                  { value: 'energy', label: 'Känner mig för trött' },
                  { value: 'boredom', label: 'Träningen blir tråkig' },
                  { value: 'progress', label: 'Ser ingen framsteg' }
                ]
              }
            ]
          }
        ]
      }
    );

    return [...baseQuestions, ...followUpQuestions];
  };

  const questions = getQuestions();
  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (value) => {
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCheckboxChange = (fieldId, value, maxSelections = null) => {
    setFormData(prev => {
      const currentValues = prev[fieldId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : maxSelections && currentValues.length >= maxSelections
        ? currentValues
        : [...currentValues, value];
      
      return {
        ...prev,
        [fieldId]: newValues
      };
    });
  };

  const isStepComplete = () => {
    const question = currentQuestion;
    
    if (question.type === 'single') {
      return formData[question.id];
    }
    
    if (question.type === 'profile') {
      return question.fields.filter(f => f.required).every(field => 
        formData[field.id] && formData[field.id].toString().trim() !== ''
      );
    }
    
    if (question.type === 'multiple_fields') {
      return question.fields.filter(f => f.required).every(field => 
        formData[field.id] && formData[field.id].toString().trim() !== ''
      );
    }
    
    if (question.type === 'health_profile' || question.type === 'lifestyle_profile' || 
        question.type === 'technology_profile' || question.type === 'motivation_profile') {
      const requiredFields = question.sections.flatMap(section => 
        section.fields.filter(f => f.required)
      );
      return requiredFields.every(field => 
        formData[field.id] && (
          Array.isArray(formData[field.id]) ? formData[field.id].length > 0 : 
          formData[field.id].toString().trim() !== ''
        )
      );
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last question - show Apple Health integration
      setShowAppleHealth(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAppleHealthComplete = () => {
    setShowAppleHealth(false);
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
      // Call comprehensive plan endpoint with all collected data
      const response = await api.post('/aicoach/comprehensive-plan', {
        // Basic profile
        age: formData.age,
        gender: formData.gender,
        weight: formData.weight,
        height: formData.height,
        
        // Goals and level
        primaryGoal: formData.primaryGoal,
        weightGoal: formData.weightGoal,
        targetRace: formData.targetRace,
        currentLevel: formData.currentLevel,
        
        // Training status
        weeklyRuns: formData.weekly_runs,
        weeklyHours: formData.weekly_hours,
        longestRun: formData.longest_run,
        
        // Health
        injuries: formData.injuries,
        injuryDetails: formData.injury_details,
        
        // Lifestyle
        dietStyle: formData.diet_style,
        sleepHours: formData.sleep_hours,
        
        // Technology
        currentDevices: formData.current_devices,
        
        // Motivation
        motivationFactors: formData.motivation_factors,
        biggestChallenges: formData.biggest_challenges
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

  // Render different question types
  const renderQuestionContent = () => {
    const question = currentQuestion;

    if (question.type === 'single') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
          {question.options.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                formData[question.id] === option.value
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl flex-shrink-0">{option.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500 mt-1 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>{option.description}</div>
                  )}
                </div>
                {formData[question.id] === option.value && (
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    if (question.type === 'profile' || question.type === 'multiple_fields') {
      return (
        <div className="space-y-4 pb-4">
          {question.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required={field.required}
                >
                  <option value="">Välj...</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    if (question.type === 'health_profile' || question.type === 'lifestyle_profile' || 
        question.type === 'technology_profile' || question.type === 'motivation_profile') {
      return (
        <div className="space-y-6 pb-4">
          {question.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">
                {section.title}
              </h4>
              
              {section.fields.map((field) => (
                <div key={field.id} className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                    {field.maxSelections && (
                      <span className="text-xs text-gray-500 ml-1">
                        (max {field.maxSelections})
                      </span>
                    )}
                  </label>
                  
                  {field.type === 'checkboxes' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {field.options.map((option) => {
                        const isSelected = (formData[field.id] || []).includes(option.value);
                        const currentSelections = (formData[field.id] || []).length;
                        const canSelect = !field.maxSelections || currentSelections < field.maxSelections || isSelected;
                        
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleCheckboxChange(field.id, option.value, field.maxSelections)}
                            disabled={!canSelect}
                            className={`p-2 rounded-lg border text-left text-sm transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50 text-orange-900'
                                : canSelect
                                ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required={field.required}
                    >
                      <option value="">Välj...</option>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Loading Screen */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-gradient-to-br from-orange-500 to-lime-500 z-[60] flex items-center justify-center"
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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-500 to-lime-500 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                {currentQuestion.icon ? (
                  <currentQuestion.icon className="w-8 h-8" />
                ) : (
                  <Sparkles className="w-8 h-8" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Gratis AI-träningsanalys</h2>
                <p className="text-white/80">{questions.length} frågor • 5-10 minuter • Livslång plan</p>
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
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-8 pt-6 pb-4">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {currentQuestion.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {currentQuestion.subtitle}
                </p>
                
                {!isStepComplete() && (
                  <div className="mb-4 p-2 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                    <p className="text-sm text-orange-700">
                      👆 Fyll i alla obligatoriska fält för att fortsätta
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 px-8 overflow-y-auto">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderQuestionContent()}
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Tillbaka</span>
              </button>

              <div className="flex items-center space-x-3">
                {/* Progress dots */}
                <div className="hidden md:flex space-x-1">
                  {Array.from({ length: questions.length }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i <= currentStep ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={!isStepComplete()}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    isStepComplete()
                      ? 'bg-gradient-to-r from-orange-500 to-lime-500 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
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
          </div>
        </motion.div>
      </motion.div>

      {/* Apple Health Modal */}
      <AppleHealthSyncModal 
        isOpen={showAppleHealth}
        onClose={() => {
          setShowAppleHealth(false);
          handleSubmit(); // Continue even if they skip Apple Health
        }}
        onComplete={handleAppleHealthComplete}
      />
    </AnimatePresence>
  );
};

export default AICoachOnboarding; 