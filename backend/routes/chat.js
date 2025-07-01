const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect: auth } = require('../middleware/auth');

// Get all conversations for the current user (alias for compatibility)
router.get('/conversations', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const chats = await Chat.getUserChats(req.user._id, page, limit);
    
    // Add unread count for each chat
    const chatsWithUnread = chats.map(chat => ({
      ...chat.toObject(),
      unreadCount: chat.getUnreadCount(req.user._id)
    }));
    
    res.json({
      success: true,
      conversations: chatsWithUnread,
      page,
      hasMore: chats.length === limit
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching conversations' 
    });
  }
});

// Get all chats for the current user
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const chats = await Chat.getUserChats(req.user._id, page, limit);
    
    // Add unread count for each chat
    const chatsWithUnread = chats.map(chat => ({
      ...chat.toObject(),
      unreadCount: chat.getUnreadCount(req.user._id)
    }));
    
    res.json({
      success: true,
      chats: chatsWithUnread,
      page,
      hasMore: chats.length === limit
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching chats' 
    });
  }
});

// Create or find a chat and send initial message
router.post('/create', auth, async (req, res) => {
  try {
    const { participantId, initialMessage } = req.body;
    
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }
    
    if (!initialMessage || initialMessage.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Initial message cannot be empty'
      });
    }
    
    // Find or create direct chat
    const chat = await Chat.findOrCreateDirectChat(req.user._id, participantId);
    
    // Add the initial message
    await chat.addMessage(req.user._id, initialMessage.trim(), 'text');
    
    // Get the chat with populated data
    await chat.populate('participants', 'firstName lastName profilePhoto email');
    await chat.populate('messages.sender', 'firstName lastName profilePhoto');
    
    // Emit to WebSocket for real-time updates
    if (req.io) {
      req.io.to(`user_${participantId}`).emit('new_message', {
        chatId: chat._id,
        message: chat.messages[chat.messages.length - 1],
        chat: {
          _id: chat._id,
          lastMessage: chat.lastMessage,
          lastActivity: chat.lastActivity
        }
      });
    }
    
    res.json({
      success: true,
      chatId: chat._id,
      chat: {
        ...chat.toObject(),
        unreadCount: chat.getUnreadCount(req.user._id)
      }
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating chat' 
    });
  }
});

// Get or create a direct chat with another user
router.post('/direct/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    
    if (otherUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }
    
    const chat = await Chat.findOrCreateDirectChat(req.user._id, otherUserId);
    
    // Populate participants to get their info
    await chat.populate('participants', 'firstName lastName profilePhoto email');
    
    res.json({
      success: true,
      chat: {
        ...chat.toObject(),
        unreadCount: chat.getUnreadCount(req.user._id)
      }
    });
  } catch (error) {
    console.error('Error creating/finding direct chat:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating chat' 
    });
  }
});

// Get conversation info
router.get('/conversations/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate('participants', 'firstName lastName profilePhoto email');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Check if user is participant
    if (!chat.participants.some(p => p._id.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('Chat participants debug:');
    console.log('Current user ID:', req.user._id);
    chat.participants.forEach((p, i) => {
      console.log(`Participant ${i}:`, {
        _id: p._id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email
      });
    });

    res.json({
      success: true,
      conversation: {
        _id: chat._id,
        type: chat.chatType === 'direct' ? 'match' : 'challenge',
        name: chat.name,
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        lastActivity: chat.lastActivity
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching conversation' 
    });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const chat = await Chat.findById(chatId)
      .populate('participants', 'firstName lastName profilePhoto email')
      .populate('messages.sender', 'firstName lastName profilePhoto');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is participant
    if (!chat.participants.some(p => p._id.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get messages with pagination (newest first, then reverse for display)
    const totalMessages = chat.messages.filter(m => !m.isDeleted).length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = totalMessages - ((page - 1) * limit);
    
    const messages = chat.messages
      .filter(m => !m.isDeleted)
      .slice(startIndex, endIndex)
      .reverse();
    
    res.json({
      success: true,
      messages,
      pagination: {
        page,
        hasMore: startIndex > 0,
        totalMessages
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching messages' 
    });
  }
});

// Get messages for a specific chat
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const chat = await Chat.findById(chatId)
      .populate('participants', 'firstName lastName profilePhoto email')
      .populate('messages.sender', 'firstName lastName profilePhoto');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is participant
    if (!chat.participants.some(p => p._id.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get messages with pagination (newest first, then reverse for display)
    const totalMessages = chat.messages.filter(m => !m.isDeleted).length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = totalMessages - ((page - 1) * limit);
    
    const messages = chat.messages
      .filter(m => !m.isDeleted)
      .slice(startIndex, endIndex)
      .reverse();
    
    res.json({
      success: true,
      chat: {
        _id: chat._id,
        participants: chat.participants,
        chatType: chat.chatType,
        name: chat.name
      },
      messages,
      pagination: {
        page,
        hasMore: startIndex > 0,
        totalMessages
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching messages' 
    });
  }
});

// Send a message to conversation
router.post('/conversations/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text' } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is participant
    if (!chat.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await chat.addMessage(req.user._id, content.trim(), messageType);
    
    // Get the newly added message with populated sender
    await chat.populate('messages.sender', 'firstName lastName profilePhoto');
    const newMessage = chat.messages[chat.messages.length - 1];
    
    // Emit to WebSocket for real-time updates
    if (req.io) {
      // Emit to all participants except sender
      chat.participants.forEach(participantId => {
        if (!participantId.equals(req.user._id)) {
          req.io.to(`user_${participantId}`).emit('new_message', {
            chatId: chat._id,
            message: newMessage,
            chat: {
              _id: chat._id,
              lastMessage: chat.lastMessage,
              lastActivity: chat.lastActivity
            }
          });
        }
      });
    }
    
    res.json({
      success: true,
      message: newMessage,
      chat: {
        _id: chat._id,
        lastMessage: chat.lastMessage,
        lastActivity: chat.lastActivity
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending message' 
    });
  }
});

// Send a message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text' } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is participant
    if (!chat.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await chat.addMessage(req.user._id, content.trim(), messageType);
    
    // Get the newly added message with populated sender
    await chat.populate('messages.sender', 'firstName lastName profilePhoto');
    const newMessage = chat.messages[chat.messages.length - 1];
    
    // Emit to WebSocket for real-time updates
    if (req.io) {
      // Emit to all participants except sender
      chat.participants.forEach(participantId => {
        if (!participantId.equals(req.user._id)) {
          req.io.to(`user_${participantId}`).emit('new_message', {
            chatId: chat._id,
            message: newMessage,
            chat: {
              _id: chat._id,
              lastMessage: chat.lastMessage,
              lastActivity: chat.lastActivity
            }
          });
        }
      });
    }
    
    res.json({
      success: true,
      message: newMessage,
      chat: {
        _id: chat._id,
        lastMessage: chat.lastMessage,
        lastActivity: chat.lastActivity
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending message' 
    });
  }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageId } = req.body; // Optional: specific message ID
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is participant
    if (!chat.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await chat.markAsRead(req.user._id, messageId);
    
    // Emit read receipt to other participants
    if (req.io) {
      chat.participants.forEach(participantId => {
        if (!participantId.equals(req.user._id)) {
          req.io.to(`user_${participantId}`).emit('message_read', {
            chatId: chat._id,
            userId: req.user._id,
            messageId: messageId || 'all'
          });
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while marking messages as read' 
    });
  }
});

// Delete a message
router.delete('/:chatId/messages/:messageId', auth, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    const message = chat.messages.id(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if user is the sender
    if (!message.sender.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Can only delete your own messages'
      });
    }
    
    message.isDeleted = true;
    await chat.save();
    
    // Emit deletion to other participants
    if (req.io) {
      chat.participants.forEach(participantId => {
        if (!participantId.equals(req.user._id)) {
          req.io.to(`user_${participantId}`).emit('message_deleted', {
            chatId: chat._id,
            messageId: message._id
          });
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting message' 
    });
  }
});

module.exports = router; 