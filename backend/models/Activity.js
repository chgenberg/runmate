const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Activity Type
  sportType: {
    type: String,
    enum: ['running'],
    required: true
  },
  activityType: {
    type: String,
    enum: ['easy', 'tempo', 'interval', 'long', 'recovery', 'race', 'hill', 'track'],
    required: true
  },
  
  // Basic Info
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // Performance Data
  distance: {
    type: Number, // km
    required: true
  },
  duration: {
    type: Number, // seconds
    required: true
  },
  averagePace: Number, // seconds per km
  averageSpeed: Number, // km/h
  
  // Additional Metrics
  elevationGain: Number, // meters
  maxSpeed: Number, // km/h
  calories: Number,
  averageHeartRate: Number,
  maxHeartRate: Number,
  
  // Location & Route
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    name: String // e.g., "Central Park, NYC"
  },
  route: [{
    timestamp: Date,
    coordinates: [Number], // [longitude, latitude]
    elevation: Number,
    heartRate: Number,
    pace: Number,
    speed: Number
  }],
  
  // Weather
  weather: {
    temperature: Number, // celsius
    humidity: Number, // percentage
    windSpeed: Number, // km/h
    conditions: String // sunny, cloudy, rainy, etc.
  },
  
  // Equipment
  equipment: {
    shoes: String,
    gear: [String]
  },
  
  // Social Features
  isPublic: {
    type: Boolean,
    default: true
  },
  kudos: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    givenAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Photos
  photos: [String],
  
  // Training Analysis
  splits: [{
    distance: Number, // km
    time: Number, // seconds
    pace: Number, // seconds per km
    elevation: Number
  }],
  
  // Gamification
  pointsEarned: {
    type: Number,
    default: 0
  },
  badgesEarned: [{
    badgeId: String,
    name: String,
    description: String
  }],
  
  // Challenge Progress
  challengeContributions: [{
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    contribution: Number, // how much this activity contributed to the challenge
    contributionType: String // distance, time, elevation, etc.
  }],
  
  // Personal Records
  personalRecords: [{
    type: String, // "5K", "10K", "Half Marathon", "Marathon", "Longest Run", etc.
    value: Number,
    unit: String, // "seconds", "km", "meters"
    isNewPR: Boolean
  }],
  
  // Data Source
  source: {
    type: String,
    enum: ['manual', 'strava', 'garmin', 'polar', 'fitbit', 'app', 'apple_health'],
    default: 'manual'
  },
  sourceId: String, // ID from external service
  
  // Activity DateTime
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  
  // Activity Status
  status: {
    type: String,
    enum: ['draft', 'completed', 'paused'],
    default: 'completed'
  },

  stravaActivityId: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true
});

// Indexes for efficient queries
activitySchema.index({ userId: 1, startTime: -1 });
activitySchema.index({ sportType: 1 });
activitySchema.index({ startTime: -1 });
activitySchema.index({ 'startLocation.coordinates': '2dsphere' });
activitySchema.index({ 'challengeContributions.challengeId': 1 });

// Calculate average pace from distance and duration
activitySchema.pre('save', function(next) {
  if (this.distance && this.duration) {
    this.averagePace = this.duration / this.distance; // seconds per km
    this.averageSpeed = (this.distance / this.duration) * 3600; // km/h
  }
  
  // Calculate points based on activity
  this.pointsEarned = this.calculatePoints();
  
  next();
});

// Methods
activitySchema.methods.calculatePoints = function() {
  let points = 0;
  
  // Base points for distance
  points += Math.round(this.distance * 10); // 10 points per km
  
  // Bonus points for longer activities
  if (this.distance >= 10) points += 50; // 10K bonus
  if (this.distance >= 21.1) points += 100; // Half marathon bonus
  if (this.distance >= 42.2) points += 200; // Marathon bonus
  
  // Time-based bonus
  if (this.duration >= 3600) points += 30; // 1 hour+ bonus
  
  // Activity type multipliers
  const multipliers = {
    'interval': 1.5,
    'tempo': 1.3,
    'hill': 1.4,
    'race': 2.0
  };
  
  if (multipliers[this.activityType]) {
    points = Math.round(points * multipliers[this.activityType]);
  }
  
  return points;
};

activitySchema.methods.addKudos = function(userId) {
  const existingKudos = this.kudos.find(k => k.userId.toString() === userId.toString());
  if (existingKudos) {
    throw new Error('User already gave kudos to this activity');
  }
  
  this.kudos.push({ userId });
  return this.save();
};

activitySchema.methods.addComment = function(userId, text) {
  this.comments.push({ userId, text });
  return this.save();
};

// Static methods
activitySchema.statics.getWeeklyStats = function(userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        startTime: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: '$sportType',
        totalDistance: { $sum: '$distance' },
        totalTime: { $sum: '$duration' },
        totalActivities: { $sum: 1 },
        totalElevation: { $sum: '$elevationGain' },
        avgPace: { $avg: '$averagePace' }
      }
    }
  ]);
};

activitySchema.statics.getPersonalRecords = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $unwind: '$personalRecords' },
    {
      $group: {
        _id: '$personalRecords.type',
        bestValue: { $min: '$personalRecords.value' },
        date: { $first: '$startTime' }
      }
    }
  ]);
};

module.exports = mongoose.model('Activity', activitySchema); 