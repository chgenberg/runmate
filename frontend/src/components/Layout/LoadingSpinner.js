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

// Main loading screen with beautiful design
export const LoadingSpinnerFullScreen = ({ message = "Laddar RunMate..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Animated background orbs */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-48 -left-48 w-96 h-96 bg-gradient-to-r from-orange-300/30 to-red-300/30 rounded-full filter blur-3xl"
      />
      <motion.div 
        animate={{ 
          x: [0, -100, 0],
          y: [0, 50, 0],
          rotate: [360, 180, 0]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-48 -right-48 w-96 h-96 bg-gradient-to-r from-pink-300/30 to-purple-300/30 rounded-full filter blur-3xl"
      />
      <motion.div 
        animate={{ 
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.2, 0.8, 1]
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-green-300/20 rounded-full filter blur-3xl"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-md mx-auto">
        {/* Logo with enhanced animation */}
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            duration: 1
          }}
          className="mb-8"
        >
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            {/* Main logo container */}
            <motion.div 
              animate={{ 
                boxShadow: [
                  "0 20px 40px rgba(255, 107, 53, 0.3)",
                  "0 25px 50px rgba(255, 107, 53, 0.4)",
                  "0 20px 40px rgba(255, 107, 53, 0.3)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-[30px] flex items-center justify-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1, 1.05, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-16 h-16 text-white fill-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced loading text */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-extrabold mb-2 text-center"
        >
          <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
            RunMate
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-600 text-center mb-8"
        >
          {message === "Laddar RunMate..." ? "Förbereder din löparupplevelse" : message}
        </motion.p>
        
        {/* Enhanced progress bar */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-72 h-1.5 bg-white/50 rounded-full overflow-hidden shadow-inner mb-6"
        >
          <motion.div 
            className="h-full w-full bg-gradient-to-r from-orange-500 via-red-500 via-pink-500 via-purple-500 to-blue-500 rounded-full"
            animate={{ 
              x: ["-100%", "100%"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              backgroundSize: "200% 100%",
            }}
          />
        </motion.div>
        
        {/* Animated loading dots */}
        <div className="flex space-x-2">
          {[
            { color: "bg-orange-500", delay: 0 },
            { color: "bg-red-500", delay: 0.2 },
            { color: "bg-pink-500", delay: 0.4 }
          ].map((dot, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: dot.delay,
                ease: "easeInOut"
              }}
              className={`w-2 h-2 ${dot.color} rounded-full`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Smaller inline loading spinner
export const InlineLoader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`absolute inset-0 bg-gradient-primary rounded-full animate-ping opacity-75`}></div>
      <div className={`relative ${sizeClasses[size]} bg-gradient-primary rounded-full animate-pulse`}></div>
    </div>
  );
};

// Activity card skeleton loader
export const ActivityCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div>
          <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Challenge card skeleton loader
export const ChallengeCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-6 space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

// User card skeleton loader
export const UserCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    <div className="mt-4 flex gap-2">
      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

// Page-specific loaders
export const DashboardLoader = () => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 w-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map(i => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(j => (
              <ActivityCardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ActivitiesLoader = () => (
  <div className="space-y-4 p-6">
    {[1, 2, 3, 4].map(i => (
      <ActivityCardSkeleton key={i} />
    ))}
  </div>
);

export const ChallengesLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <ChallengeCardSkeleton key={i} />
    ))}
  </div>
);

export const ChatLoader = () => (
  <div className="flex h-full">
    <div className="w-full md:w-80 border-r border-gray-200 p-4">
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    </div>
    <div className="flex-1 p-6">
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
);

export const EventLoader = () => (
  <div className="max-w-4xl mx-auto p-6">
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="h-64 bg-gray-200 animate-pulse"></div>
      <div className="p-8 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export default LoadingSpinner; 