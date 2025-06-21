const mongoose = require('mongoose');

const challengeParticipantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt: { type: Date, default: Date.now },
  progress: {
    distance: { type: Number, default: 0 }, // km
    activities: { type: Number, default: 0 },
    elevation: { type: Number, default: 0 }, // meters
    time: { type: Number, default: 0 }, // seconds
    calories: { type: Number, default: 0 }
  },
  rank: { type: Number, default: 0 },
  achievements: [{
    type: { type: String }, // 'milestone', 'fastest', 'consistent', etc.
    earnedAt: { type: Date, default: Date.now },
    value: mongoose.Schema.Types.Mixed
  }],
  isActive: { type: Boolean, default: true }
});

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  // Challenge type and rules
  type: { 
    type: String, 
    required: true,
    enum: ['distance', 'time', 'activities', 'elevation', 'custom']
  },
  
  goal: {
    target: { type: Number, required: true }, // Main target (100 miles, 50 hours, etc.)
    unit: { type: String, required: true }, // 'km', 'hours', 'activities', 'meters'
    isCollective: { type: Boolean, default: false }, // Group goal vs individual
    winCondition: { 
      type: String, 
      enum: ['first_to_complete', 'highest_individual', 'collective_goal'],
      default: 'first_to_complete'
    }
  },
  
  // Time constraints
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number }, // days
  
  // Creator and participants
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [challengeParticipantSchema],
  maxParticipants: { type: Number, default: 50 },
  
  // Privacy and access
  visibility: { 
    type: String, 
    enum: ['public', 'private', 'friends_only'],
    default: 'public'
  },
  joinCode: { type: String, unique: true, sparse: true },
  requiresApproval: { type: Boolean, default: false },
  
  // Progress tracking
  totalProgress: {
    distance: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    elevation: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
    calories: { type: Number, default: 0 }
  },
  
  // Status and metadata
  status: { 
    type: String, 
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  // Gamification elements
  rewards: {
    winner: {
      badge: { type: String },
      points: { type: Number, default: 100 },
      title: { type: String }
    },
    milestones: [{
      at: { type: Number }, // percentage or absolute value
      badge: { type: String },
      points: { type: Number },
      title: { type: String }
    }]
  },
  
  // Activity integration
  allowedActivityTypes: [{ 
    type: String, 
    enum: ['running', 'cycling', 'walking', 'swimming', 'other']
  }],
  
  // Social features
  enableComments: { type: Boolean, default: true },
  enableLeaderboard: { type: Boolean, default: true },
  enableNotifications: { type: Boolean, default: true },
  
  // Analytics
  analytics: {
    totalActivities: { type: Number, default: 0 },
    avgActivityDistance: { type: Number, default: 0 },
    mostActiveDay: { type: String },
    participantGrowth: [{ date: Date, count: Number }]
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
challengeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
});

challengeSchema.virtual('progressPercentage').get(function() {
  if (this.goal.isCollective) {
    return Math.min((this.totalProgress[this.goal.unit.replace('km', 'distance')] / this.goal.target) * 100, 100);
  }
  return 0; // Individual progress calculated separately
});

challengeSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

challengeSchema.virtual('participantCount').get(function() {
  return this.participants.filter(p => p.isActive).length;
});

// Indexes
challengeSchema.index({ status: 1, startDate: 1 });
challengeSchema.index({ creator: 1 });
challengeSchema.index({ 'participants.user': 1 });
challengeSchema.index({ visibility: 1, status: 1 });
challengeSchema.index({ joinCode: 1 });

// Methods
challengeSchema.methods.addParticipant = function(userId) {
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Challenge is full');
  }
  
  if (this.participants.some(p => p.user.toString() === userId.toString())) {
    throw new Error('User already participating');
  }
  
  this.participants.push({ user: userId });
  return this.save();
};

challengeSchema.methods.updateProgress = function(userId, activityData) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User not participating in challenge');
  }
  
  // Update individual progress
  participant.progress.distance += activityData.distance || 0;
  participant.progress.activities += 1;
  participant.progress.elevation += activityData.elevation || 0;
  participant.progress.time += activityData.duration || 0;
  participant.progress.calories += activityData.calories || 0;
  
  // Update total progress for collective challenges
  if (this.goal.isCollective) {
    this.totalProgress.distance += activityData.distance || 0;
    this.totalProgress.activities += 1;
    this.totalProgress.elevation += activityData.elevation || 0;
    this.totalProgress.time += activityData.duration || 0;
    this.totalProgress.calories += activityData.calories || 0;
  }
  
  // Update analytics
  this.analytics.totalActivities += 1;
  
  return this.save();
};

challengeSchema.methods.calculateLeaderboard = function() {
  const metric = this.goal.unit.replace('km', 'distance');
  
  return this.participants
    .filter(p => p.isActive)
    .map(p => ({
      user: p.user,
      progress: p.progress[metric] || 0,
      rank: 0
    }))
    .sort((a, b) => b.progress - a.progress)
    .map((p, index) => ({ ...p, rank: index + 1 }));
};

challengeSchema.statics.findActiveForUser = function(userId) {
  return this.find({
    'participants.user': userId,
    'participants.isActive': true,
    status: 'active'
  }).populate('creator', 'firstName lastName profileImage');
};

module.exports = mongoose.model('Challenge', challengeSchema); 