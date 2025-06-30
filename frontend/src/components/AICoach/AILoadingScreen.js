import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Activity, Target } from 'lucide-react';

const AILoadingScreen = ({ isVisible, onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const messages = [
    { id: 1, text: "Analyserar din träningsprofil...", icon: "🏃‍♂️", duration: 2000 },
    { id: 2, text: "Skapar personlig träningsplan...", icon: "📋", duration: 2500 },
    { id: 3, text: "Optimerar nutritionsråd...", icon: "🥗", duration: 2000 },
    { id: 4, text: "Föreslår livsstilsförändringar...", icon: "💪", duration: 2000 },
    { id: 5, text: "Matchar med träningspartners...", icon: "👥", duration: 1500 },
    { id: 6, text: "Finsliper din plan...", icon: "✨", duration: 1500 }
  ];

  useEffect(() => {
    if (currentMessageIndex < messages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
        setProgress(prev => Math.min(prev + (100 / messages.length), 100));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentMessageIndex === messages.length - 1) {
      // Last message reached, complete after a short delay
      const timer = setTimeout(() => {
        setProgress(100);
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, messages.length, onComplete]);

  useEffect(() => {
    if (isVisible) {
      setCurrentMessageIndex(0);
      setProgress(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              y: [null, -100, Math.random() * window.innerHeight],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Main AI Brain Icon */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
          className="mb-8 relative"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <Brain className="w-12 h-12 text-white" />
          </div>
          
          {/* Sparkles around brain */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0'
              }}
              animate={{
                rotate: [0, 360],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300 -translate-x-2 -translate-y-2" style={{
                transform: `translate(-50%, -50%) translateX(${40 + i * 10}px)`
              }} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-white mb-2"
        >
          AI Coach Arbetar
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-blue-200 mb-8"
        >
          Skapar din personliga träningsplan
        </motion.p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-blue-200 mb-2">
            <span>Framsteg</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Current Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl">
                {messages[currentMessageIndex]?.icon}
              </span>
              <div className="text-left">
                <p className="text-white font-medium text-lg">
                  {messages[currentMessageIndex]?.text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-blue-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-pink-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="bg-white/5 rounded-lg p-3">
            <Activity className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-blue-200">Dataanalys</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-blue-200">Målsättning</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-1" />
            <p className="text-xs text-blue-200">Optimering</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AILoadingScreen; 