import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  MessageCircle,
  Send,
  Trophy,
  Target,
  Calendar,
  ChevronRight,
  CheckCircle,
  MapPin,
  Activity,
  Sparkles,
  Zap,
  Lightbulb,
  Moon,
  TrendingUp,
  Heart,
  Shield,
  RefreshCw,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AICoachPage = () => {
  const { user } = useAuth();
  const [currentPhase, setCurrentPhase] = useState('welcome');
  const [userData, setUserData] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiProfile, setAiProfile] = useState(null);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing AI profile if available
  useEffect(() => {
    const loadAIProfile = async () => {
      try {
        const response = await api.get('/aicoach/profile');
        if (response.data.profile) {
          setAiProfile(response.data.profile);
          setCurrentPhase('dashboard');
        }
      } catch (error) {
        // No profile exists yet, start fresh
        console.log('No AI profile found, starting fresh');
      }
    };
    
    loadAIProfile();
  }, []);

  // Simulera AI-respons med typing effect
  const addAIMessage = (message, delay = 1000) => {
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { type: 'ai', content: message, timestamp: Date.now() }]);
      }, 2000);
    }, delay);
  };

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, { type: 'user', content: message, timestamp: Date.now() }]);
    setInputValue('');
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    
    // Store user responses for profile creation
    const responses = {
      0: 'goals',
      1: 'currentLevel', 
      2: 'targetDistance',
      3: 'deadline',
      4: 'limitations',
      5: 'weeklyVolume',
      6: 'priorities'
    };
    
    if (responses[currentStep]) {
      setUserData(prev => ({
        ...prev,
        [responses[currentStep]]: inputValue
      }));
    }

    // Generate contextual AI responses
    const contextualResponses = {
      0: "Fantastisk målsättning! Jag kommer hjälpa dig nå dit. Berätta nu om din nuvarande löpnivå - hur ofta tränar du per vecka och vad är dina typiska distanser?",
      1: "Perfekt! Nu förstår jag din utgångspunkt. Vilken specifik distans vill du fokusera på? (5K, 10K, halvmaraton, maraton eller annan distans?)",
      2: "Utmärkt mål! När vill du uppnå detta? Ge mig ett ungefärligt datum så kan jag skapa en realistisk plan.",
      3: "Bra tidsram! Har du några skador, begränsningar eller hälsofaktorer jag bör känna till när jag skapar din plan?",
      4: "Tack för informationen - detta hjälper mig skapa en säker plan. Hur många timmar per vecka kan du dedikera till träning, inklusive löpning och återhämtning?",
      5: "Perfekt! Sista frågan: Vad är viktigast för dig - förbättra hastighet, bygga uthållighet, förlora vikt, eller något annat?",
      6: "Fantastiskt! Nu har jag all information jag behöver. Låt mig analysera din profil och skapa din personliga träningsplan..."
    };
    
    const response = contextualResponses[currentStep] || "Tack för ditt svar! Jag processerar din information...";
    addAIMessage(response);

    // If we've completed all questions, move to analysis
    if (currentStep >= 6) {
      setTimeout(() => {
        setCurrentPhase('analysis');
        createAIProfile();
      }, 3000);
    }
  };

  const createAIProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = {
        goals: userData.goals || "Förbättra löpning",
        currentLevel: userData.currentLevel || "Nybörjare", 
        targetDistance: userData.targetDistance || "10K",
        targetTime: 2700, // 45 minutes default
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        weeklyVolume: parseInt(userData.weeklyVolume) || 3,
        priorities: userData.priorities?.split(',').map(p => p.trim()) || ["uthållighet"]
      };

      const response = await api.post('/aicoach/profile', profileData);
      setAiProfile(response.data.profile);
      toast.success('AI-profil skapad!');
      
      // Generate training plan
      await generateTrainingPlan();
    } catch (error) {
      console.error('Error creating AI profile:', error);
      toast.error('Kunde inte skapa AI-profil');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrainingPlan = async () => {
    try {
      const response = await api.post('/aicoach/generate-plan');
      setTrainingPlan(response.data.trainingPlan);
      setCurrentPhase('plan');
    } catch (error) {
      console.error('Error generating training plan:', error);
      toast.error('Kunde inte generera träningsplan');
    }
  };

  const getAIAdvice = async (question) => {
    try {
      const response = await api.post('/aicoach/advice', {
        question,
        context: 'general_advice'
      });
      return response.data.advice;
    } catch (error) {
      console.error('Error getting AI advice:', error);
      return "Tyvärr kunde jag inte besvara din fråga just nu. Försök igen senare.";
    }
  };

  const phases = {
    welcome: {
      title: "Välkommen till din AI-träningscoach",
      subtitle: "Jag är din personliga träningspartner, driven av avancerad AI",
      content: (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                background: ["linear-gradient(45deg, #667eea 0%, #764ba2 100%)", 
                           "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
                           "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)"] 
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
              className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
            >
              <Brain className="w-16 h-16 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">Hej {user?.firstName}! Jag är din AI-coach</h3>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Jag använder avancerad maskininlärning och dina Apple Health-data för att skapa den perfekta träningsplanen för just dig. 
              Tillsammans kommer vi att nå dina mål snabbare och säkrare än någonsin tidigare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <FeatureCard 
              icon={Target} 
              title="Personlig" 
              description="Anpassad efter din unika profil och mål"
              color="blue"
            />
            <FeatureCard 
              icon={Zap} 
              title="Adaptiv" 
              description="Justerar sig kontinuerligt baserat på din progress"
              color="green"
            />
            <FeatureCard 
              icon={Trophy} 
              title="Resultat" 
              description="Bevisad framgång genom vetenskaplig metodik"
              color="purple"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPhase('onboarding')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Börja min träningsresa
            <ChevronRight className="w-5 h-5 ml-2 inline" />
          </motion.button>
        </motion.div>
      )
    },

    onboarding: {
      title: "Låt oss lära känna dig",
      subtitle: "Ju mer jag vet, desto bättre träningsplan kan jag skapa",
      content: <OnboardingChat 
        messages={messages}
        isTyping={isTyping}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        currentStep={currentStep}
        setCurrentPhase={setCurrentPhase}
        messagesEndRef={messagesEndRef}
      />
    },

    analysis: {
      title: "AI-analys pågår",
      subtitle: "Jag processar din information och skapar din personliga träningsplan",
      content: <AnalysisView isLoading={isLoading} />
    },

    plan: {
      title: "Din personliga träningsplan",
      subtitle: "Baserad på avancerad AI-analys och dina specifika mål",
      content: <TrainingPlanView trainingPlan={trainingPlan} />
    },

    dashboard: {
      title: "AI Coach Dashboard",
      subtitle: "Din personliga träningsassistent",
      content: <CoachDashboard 
        aiProfile={aiProfile} 
        trainingPlan={trainingPlan}
        generateTrainingPlan={generateTrainingPlan}
        getAIAdvice={getAIAdvice}
      />
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {phases[currentPhase].title}
          </h1>
          <p className="text-gray-600 text-lg">
            {phases[currentPhase].subtitle}
          </p>
        </motion.div>

        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {phases[currentPhase].content}
        </motion.div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    green: 'from-green-50 to-green-100 text-green-600',
    purple: 'from-purple-50 to-purple-100 text-purple-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-xl`}
    >
      <Icon className="w-8 h-8 mb-3" />
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );
};

const AnalysisCard = ({ icon: Icon, title, status, progress, color }) => {
  const colorClasses = {
    red: 'text-red-600 bg-red-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg p-6 shadow-md"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600">{status}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-2 rounded-full bg-${color}-500`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const TrainingPlanView = ({ trainingPlan }) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  return (
    <div className="space-y-8">
      {/* Plan Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Din 12-veckors plan</h3>
            <p className="text-gray-600">Progressiv träning mot ditt halvmaraton-mål</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">1:45:00</div>
            <div className="text-sm text-gray-600">Målzeit halvmaraton</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">4</div>
            <div className="text-sm text-gray-600">Pass/vecka</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">45 km</div>
            <div className="text-sm text-gray-600">Max vecka</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600">Vilodagar</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">5:00</div>
            <div className="text-sm text-gray-600">Tempo min/km</div>
          </div>
        </div>
      </div>

      {/* Week Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Välj vecka</h4>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
            <motion.button
              key={week}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedWeek(week)}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                selectedWeek === week
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              V{week}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Week Details */}
      <WeeklyPlan week={selectedWeek} />

      {/* AI Coach Tips */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-semibold">AI-coach tips för vecka {selectedWeek}</h4>
        </div>
        <div className="space-y-3">
          <p className="text-blue-100">
            🎯 <strong>Fokus denna vecka:</strong> Bygg aerob bas med långa, lugna löpningar
          </p>
          <p className="text-blue-100">
            ⚡ <strong>Intensitet:</strong> 80% av träningen ska kännas lätt och konversationsmässig
          </p>
          <p className="text-blue-100">
            🔄 <strong>Återhämtning:</strong> Prioritera 7-8h sömn och proper nutrition
          </p>
        </div>
      </div>
    </div>
  );
};

const WeeklyPlan = ({ week }) => {
  const workouts = [
    {
      day: 'Måndag',
      type: 'Vila',
      description: 'Fullständig vila eller lätt promenad',
      duration: '-',
      intensity: 'Vila',
      icon: Moon,
      color: 'gray'
    },
    {
      day: 'Tisdag',
      type: 'Intervalträning',
      description: '6x 800m i 5K-tempo med 2 min vila',
      duration: '45 min',
      intensity: 'Hög',
      icon: Zap,
      color: 'red'
    },
    {
      day: 'Onsdag',
      type: 'Easy Run',
      description: 'Lugn löpning i aerob zon',
      duration: '35 min',
      intensity: 'Låg',
      icon: Activity,
      color: 'green'
    },
    {
      day: 'Torsdag',
      type: 'Tempoträning',
      description: '20 min i halvmaraton-tempo',
      duration: '40 min',
      intensity: 'Medel',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      day: 'Fredag',
      type: 'Vila',
      description: 'Vila eller lätt cross-training',
      duration: '-',
      intensity: 'Vila',
      icon: Moon,
      color: 'gray'
    },
    {
      day: 'Lördag',
      type: 'Lång löpning',
      description: 'Stadigt tempo, bygg uthållighet',
      duration: '75 min',
      intensity: 'Låg-Medel',
      icon: MapPin,
      color: 'blue'
    },
    {
      day: 'Söndag',
      type: 'Recovery Run',
      description: 'Mycket lätt återhämtningslöpning',
      duration: '25 min',
      intensity: 'Mycket låg',
      icon: Heart,
      color: 'pink'
    }
  ];

  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    blue: 'bg-blue-50 border-blue-200',
    pink: 'bg-pink-50 border-pink-200'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-6">Vecka {week} - Träningsschema</h4>
      <div className="space-y-4">
        {workouts.map((workout, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 ${colorClasses[workout.color]}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-sm`}>
                  <workout.icon className={`w-6 h-6 text-${workout.color}-600`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-semibold text-gray-800">{workout.day}</h5>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm font-medium text-gray-700">{workout.type}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{workout.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{workout.duration}</div>
                <div className="text-sm text-gray-600">{workout.intensity}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const OnboardingChat = ({ 
  messages, 
  isTyping, 
  inputValue, 
  setInputValue, 
  handleSendMessage, 
  currentStep, 
  setCurrentPhase, 
  messagesEndRef 
}) => {
  const questions = [
    "Hej! Jag är din personliga AI-träningscoach. Låt oss börja med det viktigaste: Vad vill du uppnå med din löpning? Berätta om dina drömmar och mål! 🎯",
    "Fantastisk målsättning! Jag kommer hjälpa dig nå dit. Berätta nu om din nuvarande löpnivå - hur ofta tränar du per vecka och vad är dina typiska distanser?",
    "Perfekt! Nu förstår jag din utgångspunkt. Vilken specifik distans vill du fokusera på? (5K, 10K, halvmaraton, maraton eller annan distans?)",
    "Utmärkt mål! När vill du uppnå detta? Ge mig ett ungefärligt datum så kan jag skapa en realistisk plan.",
    "Bra tidsram! Har du några skador, begränsningar eller hälsofaktorer jag bör känna till när jag skapar din plan?",
    "Tack för informationen - detta hjälper mig skapa en säker plan. Hur många timmar per vecka kan du dedikera till träning, inklusive löpning och återhämtning?",
    "Perfekt! Sista frågan: Vad är viktigast för dig - förbättra hastighet, bygga uthållighet, förlora vikt, eller något annat?"
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
            Conversation med din AI-coach
          </h3>
          <div className="text-sm text-gray-500">
            Steg {currentStep + 1} av 7
          </div>
        </div>

        <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm max-w-lg">
                <p className="text-gray-800">{questions[0]}</p>
              </div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'items-start space-x-3'}`}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`rounded-lg p-4 shadow-sm max-w-lg ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white ml-auto' 
                  : 'bg-white text-gray-800'
              }`}>
                <p>{message.content}</p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Skriv ditt svar här..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentPhase('welcome')}
          className="text-gray-600 hover:text-gray-800 flex items-center"
        >
          ← Tillbaka
        </button>
        <div className="text-sm text-gray-500">
          {currentStep < 6 ? `${7 - currentStep} frågor kvar` : 'Snart klar!'}
        </div>
      </div>
    </div>
  );
};

const AnalysisView = ({ isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 mx-auto mb-6"
        >
          <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          {isLoading ? 'Genererar din plan...' : 'Analyserar dina data...'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalysisCard 
          icon={Heart} 
          title="Kardiovaskulär profil" 
          status="Analyserar puls och uthållighet"
          progress={85}
          color="red"
        />
        <AnalysisCard 
          icon={Activity} 
          title="Löpteknik & effektivitet" 
          status="Utvärderar din löpstil"
          progress={70}
          color="blue"
        />
        <AnalysisCard 
          icon={Target} 
          title="Målsättning & motivation" 
          status="Skapar personlig målplan"
          progress={95}
          color="green"
        />
        <AnalysisCard 
          icon={Shield} 
          title="Skaderiskanalys" 
          status="Identifierar riskfaktorer"
          progress={60}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">AI Processing Status</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Datainhämtning från Apple Health</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Analys av träningshistorik</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Generering av träningsplan</span>
            {isLoading ? (
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CoachDashboard = ({ aiProfile, trainingPlan, generateTrainingPlan, getAIAdvice }) => {
  const [activeQuestion, setActiveQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleAskAI = async () => {
    if (!activeQuestion.trim()) return;
    
    setIsAsking(true);
    try {
      const advice = await getAIAdvice(activeQuestion);
      setAiResponse(advice);
    } catch (error) {
      setAiResponse('Tyvärr kunde jag inte besvara din fråga just nu.');
    } finally {
      setIsAsking(false);
    }
  };

  const quickQuestions = [
    'Hur kan jag förbättra min tid?',
    'Vad ska jag äta före träning?',
    'Hur undviker jag skador?',
    'När ska jag vila?',
    'Hur tränar jag mentalt?'
  ];

  return (
    <div className="space-y-8">
      {/* Profile Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Din AI-profil</h3>
            <p className="text-blue-100">Skapad: {aiProfile ? new Date(aiProfile.createdAt).toLocaleDateString('sv-SE') : 'Idag'}</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <Brain className="w-8 h-8" />
          </motion.div>
        </div>
        
        {aiProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-sm text-blue-100">Mål</div>
              <div className="font-semibold">{aiProfile.goals}</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-sm text-blue-100">Fokus</div>
              <div className="font-semibold">{aiProfile.targetDistance}</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-sm text-blue-100">Veckovolym</div>
              <div className="font-semibold">{aiProfile.weeklyVolume}h/vecka</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg cursor-pointer"
          onClick={generateTrainingPlan}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Uppdatera Plan</h4>
          </div>
          <p className="text-gray-600 text-sm">Generera en ny träningsplan baserat på senaste data</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Analysera Progress</h4>
          </div>
          <p className="text-gray-600 text-sm">Se hur du utvecklas mot dina mål</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Justera Mål</h4>
          </div>
          <p className="text-gray-600 text-sm">Uppdatera dina träningspreferenser</p>
        </motion.div>
      </div>

      {/* AI Chat Interface */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-blue-600" />
          Fråga din AI-coach
        </h4>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveQuestion(question)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                {question}
              </motion.button>
            ))}
          </div>

          <div className="flex space-x-3">
            <input
              type="text"
              value={activeQuestion}
              onChange={(e) => setActiveQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder="Ställ din fråga till AI-coachen..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAskAI}
              disabled={!activeQuestion.trim() || isAsking}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAsking ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Fråga'}
            </motion.button>
          </div>

          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-500"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 mb-1">AI Coach svar:</div>
                  <p className="text-gray-700">{aiResponse}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Current Training Plan Preview */}
      {trainingPlan && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Aktuell Träningsplan</h4>
            <span className="text-sm text-gray-500">{trainingPlan.totalWeeks} veckor</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{trainingPlan.targetGoal}</div>
              <div className="text-sm text-gray-600">Målzeit</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{trainingPlan.currentFitness?.avgDistance} km</div>
              <div className="text-sm text-gray-600">Snitt-distans</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{trainingPlan.currentFitness?.avgPace}</div>
              <div className="text-sm text-gray-600">Snitt-tempo</div>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">Nyckelprinciper:</h5>
            {trainingPlan.keyPrinciples?.map((principle, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{principle}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoachPage; 