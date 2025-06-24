const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Auth Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Profile Info
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  additionalPhotos: [{
    type: String
  }],
  
  // Location
  location: {
    city: String,
    country: String,
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  },
  
  // Sport Preferences
  sportTypes: [{
    type: String,
    enum: ['running'],
    required: true
  }],
  activityLevel: {
    type: String,
    enum: ['beginner', 'recreational', 'serious', 'competitive', 'elite'],
    required: true
  },
  
  // Training Stats
  trainingStats: {
    // Running stats
    bestTimes: {
      fiveK: Number, // in seconds
      tenK: Number,
      halfMarathon: Number,
      marathon: Number
    },
    weeklyDistance: Number, // km per week
    weeklyWorkouts: Number,
    totalDistance: {
      type: Number,
      default: 0
    },
  },
  
  // Training Preferences
  trainingPreferences: {
    preferredTimes: [{
      type: String,
      enum: ['early-morning', 'morning', 'afternoon', 'evening', 'night']
    }],
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    trainingTypes: [{
      type: String,
      enum: ['easy-runs', 'intervals', 'long-runs', 'tempo', 'hill-training', 'track', 'trail', 'road']
    }],
    indoor: Boolean,
    outdoor: Boolean
  },
  
  // Matching Preferences
  matchingPreferences: {
    ageRange: {
      min: {
        type: Number,
        min: 18,
        max: 100
      },
      max: {
        type: Number,
        min: 18,
        max: 100
      }
    },
    genderPreference: [{
      type: String,
      enum: ['male', 'female', 'other', 'any']
    }],
    maxDistance: {
      type: Number, // km radius
      default: 50
    },
    levelRange: [{
      type: String,
      enum: ['beginner', 'recreational', 'serious', 'competitive', 'elite']
    }]
  },
  
  // Matches and Interactions
  matches: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    matchedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  
  swipes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['like', 'pass']
    },
    swipedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Simple swipe tracking for basic matching
  swipedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Additional fields needed for frontend compatibility
  birthDate: {
    type: Date,
    get: function() { return this.dateOfBirth; },
    set: function(v) { this.dateOfBirth = v; }
  },
  photos: [{
    type: String
  }],
  profilePicture: {
    type: String
  },
  sports: [{
    type: String
  }],
  preferredTrainingTimes: [{
    type: String
  }],
  avgPace: {
    type: Number // in seconds per km
  },
  weeklyDistance: {
    type: Number // km per week
  },
  preferredRunTypes: [{
    type: String
  }],
  profileViews: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  
  // Gamification
  points: {
    type: Number,
    default: 0
  },
  
  // Cached rating stats for performance
  ratingStats: {
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      default: 'Ny löpare'
    },
    badge: {
      type: String,
      enum: ['superstar', 'trusted', 'experienced', null],
      default: null
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    badgeId: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    name: String,
    description: String
  }],
  streaks: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  },
  
  // Settings
  settings: {
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
      showLocation: { type: Boolean, default: true },
      showActivities: { type: Boolean, default: true },
      showStats: { type: Boolean, default: true }
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      matchNotifications: { type: Boolean, default: true },
      activityNotifications: { type: Boolean, default: true },
      challengeNotifications: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true }
    },
    app: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: 'sv' },
      units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
      autoSync: { type: Boolean, default: true }
    }
  },
  
  // Strava Integration Fields
  stravaId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple documents to have no stravaId
  },
  stravaAccessToken: {
    type: String,
  },
  stravaRefreshToken: {
    type: String,
  },
  stravaTokenExpiresAt: {
    type: Number, // Store as a Unix timestamp (seconds)
  },

  // Apple Health Integration Fields
  appleHealthConnected: {
    type: Boolean,
    default: false
  },
  appleHealthLastSync: {
    type: Date,
    default: null
  },

  // Garmin Integration Fields
  garminAccessToken: {
    type: String,
  },
  garminAccessTokenSecret: {
    type: String,
  },
  garminConnected: {
    type: Boolean,
    default: false
  },
  garminLastSync: {
    type: Date,
    default: null
  },
  
  // Push Notification Fields
  pushSubscription: {
    type: Object, // Stores the complete push subscription object
    default: null
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  
  // Premium Features
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiry: Date,
  
  // AI Coach Profile
  aiCoachProfile: {
    goals: String,
    currentLevel: String,
    targetDistance: String,
    targetTime: Number, // in seconds
    deadline: Date,
    injuries: [String],
    limitations: [String],
    weeklyVolume: Number, // hours per week
    restDays: Number,
    workSchedule: String,
    equipment: [String],
    priorities: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // Account Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Privacy Settings
  privacySettings: {
    showDistance: {
      type: Boolean,
      default: true
    },
    showAge: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: true
    }
  },
  
  // App Usage
  lastActive: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ sportTypes: 1 });
userSchema.index({ activityLevel: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastActive: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate age from date of birth
userSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Get display name
userSchema.virtual('displayName').get(function() {
  return `${this.firstName} ${this.lastName.charAt(0)}.`;
});

module.exports = mongoose.model('User', userSchema); 