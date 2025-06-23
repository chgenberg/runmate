import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Zap, Heart, Star, MapPin, Users, Trophy } from 'lucide-react';

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
  const icons = [
    { Icon: Heart, delay: 0 },
    { Icon: Activity, delay: 100 },
    { Icon: MapPin, delay: 200 },
    { Icon: Users, delay: 300 },
    { Icon: Trophy, delay: 400 }
  ];

  const content = (
    <>
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-200 rounded-full filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary-200 rounded-full filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="mb-8 animate-slide-up">
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse-slow">
            <Heart className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Animated icons */}
        <div className="flex space-x-4 mb-8">
          {icons.map(({ Icon, delay }, index) => (
            <div
              key={index}
              className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center animate-bounce"
              style={{ animationDelay: `${delay}ms`, animationDuration: '2s' }}
            >
              <Icon className="w-5 h-5 text-primary-500" />
            </div>
          ))}
        </div>

        {/* Loading text */}
        <h2 className="text-2xl font-bold gradient-text mb-2 animate-slide-up animation-delay-200">
          {message}
        </h2>
        
        {/* Progress bar */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden animate-slide-up animation-delay-300">
          <div className="h-full bg-gradient-primary animate-shimmer-slow"></div>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {content}
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