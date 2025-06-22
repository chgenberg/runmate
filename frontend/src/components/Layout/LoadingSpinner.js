import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Zap, Heart, Star } from 'lucide-react';

const LoadingSpinner = ({ 
  variant = 'default', 
  size = 'md', 
  text = 'Laddar...', 
  showText = true,
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-4 h-4';
      case 'sm': return 'w-6 h-6';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
      case 'xl': return 'w-24 h-24';
      default: return 'w-12 h-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'xs': return 'text-xs';
      case 'sm': return 'text-sm';
      case 'md': return 'text-lg';
      case 'lg': return 'text-xl';
      case 'xl': return 'text-2xl';
      default: return 'text-lg';
    }
  };

  const renderVariant = () => {
    const sizeClasses = getSizeClasses();
    
    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`${sizeClasses} rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg`}
          />
        );

      case 'bounce':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
              />
            ))}
          </div>
        );

      case 'orbit':
        return (
          <div className={`relative ${sizeClasses}`}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="w-full h-full border-4 border-transparent border-t-red-500 border-r-pink-500 rounded-full"></div>
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2"
            >
              <div className="w-full h-full border-2 border-transparent border-b-purple-500 border-l-blue-500 rounded-full"></div>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-1/2 h-1/2 text-red-500" />
            </div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  backgroundColor: ['#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444']
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
            ))}
          </div>
        );

      case 'heart':
        return (
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <Heart className={`${sizeClasses} text-red-500 fill-current`} />
            <motion.div
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full bg-red-200"
            />
          </motion.div>
        );

      case 'activity':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Activity className={`${sizeClasses} text-blue-500`} />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-blue-200"
            />
          </motion.div>
        );

      case 'gradient':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses} rounded-full`}
            style={{
              background: 'conic-gradient(from 0deg, #ef4444, #ec4899, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444)',
              padding: '3px'
            }}
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Zap className="w-1/2 h-1/2 text-purple-500" />
            </div>
          </motion.div>
        );

      case 'stars':
        return (
          <div className="relative">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{
                  rotate: 360,
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, delay: i * 0.2 }
                }}
                className="absolute"
                style={{
                  left: `${Math.cos((i * 72) * Math.PI / 180) * 20 + 20}px`,
                  top: `${Math.sin((i * 72) * Math.PI / 180) * 20 + 20}px`
                }}
              >
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </motion.div>
            ))}
            <div className="w-12 h-12 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        );

      default: // 'default' variant
        return (
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className={`${sizeClasses} border-4 border-gray-200 border-t-red-500 border-r-pink-500 rounded-full shadow-lg`}
            />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-red-100 to-pink-100"
            />
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="mb-4">
        {renderVariant()}
      </div>
      {showText && (
        <motion.p 
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`${getTextSize()} font-semibold text-gray-600 text-center`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Specific loading components for different contexts
export const DashboardLoader = ({ className = '' }) => (
  <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
    <div className="text-center">
      <LoadingSpinner 
        variant="gradient" 
        size="xl" 
        text="Laddar din löpardashboard..." 
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center justify-center gap-4"
      >
        <div className="px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100">
          <span className="text-sm font-medium text-gray-600">Hämtar statistik</span>
        </div>
        <div className="px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100">
          <span className="text-sm font-medium text-gray-600">Laddar aktiviteter</span>
        </div>
      </motion.div>
    </div>
  </div>
);

export const ChatLoader = ({ className = '' }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <LoadingSpinner 
      variant="heart" 
      size="lg" 
      text="Laddar dina konversationer..." 
    />
  </div>
);

export const EventLoader = ({ className = '' }) => (
  <div className={`flex items-center justify-center p-12 ${className}`}>
    <LoadingSpinner 
      variant="activity" 
      size="xl" 
      text="Laddar event..." 
    />
  </div>
);

export const ActivitiesLoader = ({ className = '' }) => (
  <div className={`flex items-center justify-center p-24 bg-white rounded-2xl shadow-sm ${className}`}>
    <LoadingSpinner 
      variant="orbit" 
      size="xl" 
      text="Laddar dina aktiviteter..." 
    />
  </div>
);

export const ChallengesLoader = ({ className = '' }) => (
  <div className={`flex items-center justify-center h-96 ${className}`}>
    <LoadingSpinner 
      variant="stars" 
      size="xl" 
      text="Laddar utmaningar..." 
    />
  </div>
);

export const PageLoader = ({ text = "Laddar...", className = '' }) => (
  <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
    <LoadingSpinner 
      variant="gradient" 
      size="xl" 
      text={text} 
    />
  </div>
);

export default LoadingSpinner; 