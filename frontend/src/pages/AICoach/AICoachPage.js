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
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const AICoachPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPhase] = useState('chat');
  const [aiProfile, setAiProfile] = useState(null);
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
        content: `Hej ${user?.firstName}! 👋\n\nJag heter ARIA - din personliga AI-löpcoach. Jag är här för att hjälpa dig nå dina löpmål, oavsett om du vill springa snabbare, längre eller bara må bättre.\n\nVad vill du uppnå med din löpning?`,
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
    { text: "Skapa träningsplan", icon: Calendar },
    { text: "Analysera min löpning", icon: TrendingUp },
    { text: "Tips för motivation", icon: Heart },
    { text: "Förebygg skador", icon: Activity }
  ];

  const handleQuickAction = (action) => {
    setInputValue(action.text);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src="/avatar2.png" 
                  alt="ARIA" 
                  className="w-12 h-12 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=ARIA&background=e5754d&color=fff`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ARIA</h1>
                <p className="text-sm text-gray-500">AI Running Intelligence Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#e5754d]" />
              <span className="text-sm text-gray-500">Driven av GPT-4</span>
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
                    <img 
                      src="/avatar2.png" 
                      alt="ARIA" 
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=ARIA&background=e5754d&color=fff`;
                      }}
                    />
                    <div className="bg-gray-50 rounded-2xl px-4 py-3">
                      <div 
                        className="text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatAIMessage(message.content) }}
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[80%]">
                    <div className="bg-[#e5754d] text-white rounded-2xl px-4 py-3">
                      <p className="leading-relaxed">{message.content}</p>
                      <p className="text-xs text-white/70 mt-2">
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
              <img 
                src="/avatar2.png" 
                alt="ARIA" 
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=ARIA&background=e5754d&color=fff`;
                }}
              />
              <div className="bg-gray-50 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full whitespace-nowrap transition-colors"
              >
                <action.icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{action.text}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
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
                placeholder="Fråga ARIA om löpning..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#e5754d] focus:border-transparent transition-all"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`p-3 rounded-full transition-all ${
                inputValue.trim() && !isTyping
                  ? 'bg-[#e5754d] text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Training Stats - Optional Dashboard */}
      {aiProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 pb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              icon={Target}
              label="Veckans mål"
              value="42 km"
              progress={75}
            />
            <StatsCard
              icon={Activity}
              label="Träningspass"
              value="4/5"
              progress={80}
            />
            <StatsCard
              icon={TrendingUp}
              label="Snittempo"
              value="5:15"
              trend="+3%"
            />
            <StatsCard
              icon={Award}
              label="Streak"
              value="12 dagar"
              highlight
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, progress, trend, highlight }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-2xl border ${
        highlight 
          ? 'border-[#e5754d] bg-[#e5754d]/5' 
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${highlight ? 'text-[#e5754d]' : 'text-gray-400'}`} />
        {trend && (
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {progress !== undefined && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className="h-1.5 rounded-full bg-[#e5754d]"
          />
        </div>
      )}
    </motion.div>
  );
};

export default AICoachPage; 