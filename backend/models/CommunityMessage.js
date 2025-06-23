const mongoose = require('mongoose');

const CommunityMessageSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityRoom',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'activity', 'system'],
    default: 'text'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'activity', 'route']
    },
    url: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityMessage'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexing för bättre prestanda
CommunityMessageSchema.index({ room: 1, createdAt: -1 });
CommunityMessageSchema.index({ sender: 1 });
CommunityMessageSchema.index({ mentions: 1 });

// Middleware för att uppdatera room stats
CommunityMessageSchema.post('save', async function() {
  if (!this.isDeleted) {
    await mongoose.model('CommunityRoom').findByIdAndUpdate(
      this.room,
      { 
        $inc: { 'stats.messageCount': 1 },
        $set: { 'stats.lastActivity': new Date() }
      }
    );
  }
});

module.exports = mongoose.model('CommunityMessage', CommunityMessageSchema); 