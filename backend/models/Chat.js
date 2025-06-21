const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
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
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  chatType: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  avatar: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    messageType: {
      type: String,
      default: 'text'
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For run events
  runEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RunEvent'
  }
}, {
  timestamps: true
});

// Indexes for performance
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ runEventId: 1 });
chatSchema.index({ 'messages.createdAt': -1 });

// Static method to find or create direct chat
chatSchema.statics.findOrCreateDirectChat = async function(userId1, userId2) {
  // Look for existing direct chat between these two users
  let chat = await this.findOne({
    chatType: 'direct',
    participants: { $all: [userId1, userId2], $size: 2 }
  }).populate('participants', 'firstName lastName email profile');

  if (!chat) {
    // Create new direct chat
    chat = await this.create({
      participants: [userId1, userId2],
      chatType: 'direct',
      createdBy: userId1
    });
    
    await chat.populate('participants', 'firstName lastName email profile');
  }

  return chat;
};

// Static method to create group chat
chatSchema.statics.createGroupChat = async function(creatorId, participantIds, name, description = '') {
  const allParticipants = [creatorId, ...participantIds.filter(id => id !== creatorId.toString())];
  
  const chat = await this.create({
    participants: allParticipants,
    chatType: 'group',
    name,
    description,
    createdBy: creatorId,
    admins: [creatorId]
  });

  await chat.populate('participants', 'firstName lastName email profile');
  return chat;
};

// Static method to get user's chats
chatSchema.statics.getUserChats = async function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return await this.find({
    participants: userId,
    isActive: true
  })
  .populate('participants', 'firstName lastName email profile')
  .populate('lastMessage.sender', 'firstName lastName')
  .sort({ lastActivity: -1 })
  .skip(skip)
  .limit(limit);
};

// Instance method to add message
chatSchema.methods.addMessage = async function(senderId, content, messageType = 'text', replyTo = null) {
  const message = {
    sender: senderId,
    content,
    messageType,
    replyTo,
    readBy: [{ user: senderId }]
  };

  this.messages.push(message);
  this.lastMessage = {
    content,
    sender: senderId,
    timestamp: new Date(),
    messageType
  };
  this.lastActivity = new Date();

  await this.save();
  return message;
};

// Instance method to add participant
chatSchema.methods.addParticipant = async function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.lastActivity = new Date();
    await this.save();
  }
  return this;
};

// Instance method to remove participant
chatSchema.methods.removeParticipant = async function(userId) {
  this.participants = this.participants.filter(p => !p.equals(userId));
  this.admins = this.admins.filter(a => !a.equals(userId));
  this.lastActivity = new Date();
  await this.save();
  return this;
};

// Instance method to mark messages as read
chatSchema.methods.markAsRead = async function(userId, messageIds = null) {
  const messagesToUpdate = messageIds 
    ? this.messages.filter(m => messageIds.includes(m._id.toString()))
    : this.messages.filter(m => !m.readBy.some(r => r.user.equals(userId)));

  messagesToUpdate.forEach(message => {
    if (!message.readBy.some(r => r.user.equals(userId))) {
      message.readBy.push({ user: userId });
    }
  });

  if (messagesToUpdate.length > 0) {
    await this.save();
  }

  return messagesToUpdate.length;
};

// Instance method to get unread count for user
chatSchema.methods.getUnreadCount = function(userId) {
  return this.messages.filter(m => 
    !m.isDeleted && 
    !m.sender.equals(userId) && 
    !m.readBy.some(r => r.user.equals(userId))
  ).length;
};

// Virtual for formatted name
chatSchema.virtual('displayName').get(function() {
  if (this.chatType === 'group') {
    return this.name || `Grupp (${this.participants.length} deltagare)`;
  } else if (this.participants.length === 2) {
    // For direct chats, this would need context of current user
    return 'Direktchatt';
  }
  return 'Okänd chatt';
});

// Transform output
chatSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 