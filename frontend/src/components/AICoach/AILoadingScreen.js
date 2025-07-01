import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Utensils, Heart, Calendar, Sparkles, Trophy, MapPin, Clock, TrendingUp } from 'lucide-react';

const AILoadingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [funFact, setFunFact] = useState(0);

  const loadingSteps = [
    {
      icon: Brain,
      title: "Analyserar dina svar",
      description: "AI:n går igenom din träningshistorik och mål...",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MapPin,
      title: "Studerar loppet",
      description: "Analyserar banprofil, väder och utmaningar...",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Activity,
      title: "Skapar träningsschema",
      description: "Bygger ett personligt veckoschema anpassat för dig...",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Utensils,
      title: "Planerar nutrition",
      description: "Beräknar kaloribehov och måltidsförslag...",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Heart,
      title: "Optimerar återhämtning",
      description: "Lägger in vilodagar och återhämtningsstrategier...",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Calendar,
      title: "Färdigställer kalendern",
      description: "Sätter ihop allt till en komplett träningsplan...",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const funFacts = [
    "Visste du att Eliud Kipchoge springer marathon på under 2:02?",
    "En marathonlöpare tar i snitt 40,000 steg under loppet!",
    "Boston Marathon är världens äldsta årliga marathon sedan 1897.",
    "Kroppen kan lagra cirka 2000 kalorier kolhydrater för löpning.",
    "Kenyanska löpare dominerar långdistanslöpning med över 80% av toppresultaten!",
    "Ultra-löpare kan förbruka upp till 10,000 kalorier under ett 100-miles lopp.",
    "Den första olympiska marathonvinnaren 1896 sprang på 2:58:50.",
    "Löpning frigör endorfiner som ger 'runner's high' känslan!"
  ];

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 0.5;
      });
    }, 30);

    // Step animation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    // Fun fact rotation
    const factInterval = setInterval(() => {
      setFunFact(prev => (prev + 1) % funFacts.length);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(factInterval);
    };
  }, [onComplete]);

  const CurrentIcon = loadingSteps[currentStep].icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full">
        {/* Main loading animation */}
        <div className="text-center mb-12">
          <motion.div
            className="relative inline-block"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${loadingSteps[currentStep].color} p-1`}>
              <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                <CurrentIcon className="w-16 h-16 text-white" />
              </div>
            </div>
            
            {/* Orbiting dots */}
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="absolute w-3 h-3 bg-white rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                }}
                animate={{
                  x: [0, 60 * Math.cos(index * Math.PI / 2), 0],
                  y: [0, 60 * Math.sin(index * Math.PI / 2), 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Current step info */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            {loadingSteps[currentStep].title}
          </h2>
          <p className="text-gray-400 text-lg">
            {loadingSteps[currentStep].description}
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Framsteg</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-between mb-12">
          {loadingSteps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'opacity-100' : 'opacity-30'
              } transition-opacity`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  index <= currentStep
                    ? `bg-gradient-to-br ${step.color}`
                    : 'bg-gray-700'
                }`}
              >
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <div className="w-1 h-8 bg-gray-700 rounded-full overflow-hidden">
                {index < currentStep && (
                  <motion.div
                    className={`w-full h-full bg-gradient-to-b ${step.color}`}
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Fun fact */}
        <AnimatePresence mode="wait">
          <motion.div
            key={funFact}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
              <p className="text-gray-300">
                <span className="font-semibold text-yellow-500">Löparfakta:</span> {funFacts[funFact]}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Motivational message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 mt-8 text-sm"
        >
          Din personliga AI-coach förbereder en plan som kommer ta dig hela vägen till mållinjen! 🏃‍♂️✨
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AILoadingScreen; 