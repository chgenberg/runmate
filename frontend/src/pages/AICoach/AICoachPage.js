import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send,
  Sparkles,
  Calendar,
  Activity,
  Target,
  TrendingUp,
  Heart,
  Award,
  Brain,
  Zap,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import AICoachOnboarding from '../../components/AICoach/AICoachOnboarding';

const AICoachPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPhase] = useState('chat');
  const [aiProfile, setAiProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const initMessages = [
      {
        type: 'ai',
        content: `Hej ${user?.firstName}! 👋\n\nJag heter ARIA - din personliga AI-löpcoach. Jag använder avancerad AI för att skapa skräddarsydda träningsplaner som anpassar sig efter din utveckling.\n\nVill du att jag skapar en personlig träningsplan för dig?`,
        timestamp: Date.now()
      }
    ];
    setMessages(initMessages);
  }, [user]);

  // Load existing AI profile
  useEffect(() => {
    const loadAIProfile = async () => {
      try {
        const response = await api.get('/aicoach/profile');
        if (response.data.profile) {
          setAiProfile(response.data.profile);
          setTrainingPlan(response.data.trainingPlan);
        }
      } catch (error) {
        console.log('No AI profile found');
      }
    };
    
    loadAIProfile();
  }, []);

  const formatAIMessage = (message) => {
    // Convert **text** to <strong>text</strong>
    let formatted = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks to <br/>
    formatted = formatted.replace(/\n/g, '<br/>');
    
    // Convert lists
    formatted = formatted.replace(/^- (.*?)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside mt-2 mb-2">$1</ul>');
    
    return formatted;
  };

  const addAIMessage = async (message) => {
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsTyping(false);
    setMessages(prev => [...prev, {
      type: 'ai',
      content: message,
      timestamp: Date.now()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: Date.now()
    }]);

    // Get AI response
    try {
      const response = await api.post('/aicoach/chat', {
        message: userMessage,
        context: {
          hasProfile: !!aiProfile,
          currentPhase,
          userName: user?.firstName
        }
      });

      if (response.data.message) {
        await addAIMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      await addAIMessage('Ursäkta, jag kunde inte bearbeta ditt meddelande just nu. Kan du försöka igen?');
    }
  };

  const quickActions = [
    { text: "Skapa träningsplan", icon: Calendar, color: 'from-sport-yellow-400 to-sport-yellow-500' },
    { text: "Analysera min löpning", icon: TrendingUp, color: 'from-sport-lime-400 to-sport-lime-500' },
    { text: "Tips för motivation", icon: Heart, color: 'from-red-400 to-red-500' },
    { text: "Förebygg skador", icon: Activity, color: 'from-blue-400 to-blue-500' }
  ];

  const handleQuickAction = (action) => {
    if (action.text === "Skapa träningsplan" && !aiProfile) {
      setShowOnboarding(true);
    } else {
      setInputValue(action.text);
      inputRef.current?.focus();
    }
  };

  const handleOnboardingComplete = (plan) => {
    setShowOnboarding(false);
    setTrainingPlan(plan);
    addAIMessage(`Fantastiskt! 🎉\n\nJag har skapat en personlig träningsplan baserat på dina svar. Här är en översikt:\n\n**Veckans träningspass:**\n${plan.weeklySchedule}\n\n**Fokusområden:**\n${plan.focusAreas}\n\nVill du att jag går igenom planen i detalj?`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sport-yellow-50 via-white to-sport-lime-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-sport-yellow-400 to-sport-lime-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ARIA</h1>
                <p className="text-sm text-gray-600">AI Running Intelligence Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-sport-yellow-500" />
              <span className="text-sm text-gray-600">Powered by GPT-4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto">
        <div className="h-[calc(100vh-280px)] overflow-y-auto px-4 py-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 ${message.type === 'user' ? 'flex justify-end' : ''}`}
              >
                {message.type === 'ai' ? (
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    <div className="w-10 h-10 bg-gradient-to-br from-sport-yellow-400 to-sport-lime-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
                      <div 
                        className="text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatAIMessage(message.content) }}
                      />
                      <p className="text-xs text-gray-400 mt-3">
                        {new Date(message.timestamp).toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[80%]">
                    <div className="bg-gradient-to-r from-sport-yellow-400 to-sport-yellow-500 text-gray-900 rounded-2xl px-5 py-4 shadow-sm">
                      <p className="leading-relaxed font-medium">{message.content}</p>
                      <p className="text-xs text-gray-700/70 mt-3">
                        {new Date(message.timestamp).toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-sport-yellow-400 to-sport-lime-400 rounded-2xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-sport-yellow-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-sport-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-sport-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action)}
                className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r ${action.color} text-white rounded-2xl whitespace-nowrap transition-all shadow-sm hover:shadow-md`}
              >
                <action.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{action.text}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Fråga ARIA om löpning, träning eller kost..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-sport-yellow-400 focus:border-transparent transition-all"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`p-3 rounded-2xl transition-all ${
                inputValue.trim() && !isTyping
                  ? 'bg-gradient-to-r from-sport-yellow-400 to-sport-yellow-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Training Stats - Optional Dashboard */}
      {trainingPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 pb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              icon={Target}
              label="Veckans mål"
              value={trainingPlan?.weeklyGoal || "42 km"}
              progress={75}
              color="from-sport-yellow-400 to-sport-yellow-500"
            />
            <StatsCard
              icon={Activity}
              label="Träningspass"
              value={trainingPlan?.completedSessions || "4/5"}
              progress={80}
              color="from-sport-lime-400 to-sport-lime-500"
            />
            <StatsCard
              icon={TrendingUp}
              label="Snittempo"
              value={trainingPlan?.averagePace || "5:15"}
              trend="+3%"
              color="from-blue-400 to-blue-500"
            />
            <StatsCard
              icon={Award}
              label="Streak"
              value={trainingPlan?.streak || "12 dagar"}
              highlight
              color="from-red-400 to-red-500"
            />
          </div>
        </motion.div>
      )}

      {/* Onboarding Modal */}
      <AICoachOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Floating Action Button for New Plan */}
      {!showOnboarding && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowOnboarding(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-sport-yellow-400 to-sport-yellow-500 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl transition-all"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, progress, trend, highlight, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-2xl border-2 bg-white ${
        highlight 
          ? 'border-sport-yellow-400' 
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 bg-gradient-to-r ${color} rounded-xl`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
      {progress !== undefined && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className={`h-1.5 rounded-full bg-gradient-to-r ${color}`}
          />
        </div>
      )}
    </motion.div>
  );
};

export default AICoachPage; 