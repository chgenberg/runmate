const mongoose = require('mongoose');

const CommunityRoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['location', 'training', 'events', 'general', 'beginners', 'advanced'],
    default: 'general'
  },
  location: {
    city: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 500
    },
    allowMemberInvites: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    memberCount: {
      type: Number,
      default: 0
    },
    messageCount: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  tags: [String],
  image: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexing för bättre prestanda
CommunityRoomSchema.index({ category: 1, 'location.city': 1 });
CommunityRoomSchema.index({ creator: 1 });
CommunityRoomSchema.index({ 'members.user': 1 });
CommunityRoomSchema.index({ tags: 1 });
CommunityRoomSchema.index({ createdAt: -1 });

// Middleware för att uppdatera memberCount
CommunityRoomSchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.stats.memberCount = this.members.length;
  }
  next();
});

// Virtual för att kontrollera om användare är medlem
CommunityRoomSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Virtual för att kontrollera om användare är moderator
CommunityRoomSchema.methods.isModerator = function(userId) {
  return this.moderators.some(mod => mod.toString() === userId.toString()) || 
         this.creator.toString() === userId.toString();
};

module.exports = mongoose.model('CommunityRoom', CommunityRoomSchema); 