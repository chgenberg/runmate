const express = require('express');
const router = express.Router();
const CommunityRoom = require('../models/CommunityRoom');
const CommunityMessage = require('../models/CommunityMessage');
const { protect } = require('../middleware/auth');

// GET /api/community/rooms - Hämta alla community-rum
router.get('/rooms', protect, async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    // Filtrera på kategori
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filtrera på stad
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    
    // Sök i titel och beskrivning
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }
    
    const rooms = await CommunityRoom.find(query)
      .populate('creator', 'name profilePicture')
      .populate('members.user', 'name profilePicture')
      .sort({ 'stats.lastActivity': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await CommunityRoom.countDocuments(query);
    
    res.json({
      rooms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/community/rooms - Skapa nytt community-rum
router.post('/rooms', protect, async (req, res) => {
  try {
    const { title, description, category, location, tags, isPrivate } = req.body;
    
    const room = new CommunityRoom({
      title,
      description,
      category,
      location,
      tags: tags || [],
      creator: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin',
        joinedAt: new Date()
      }],
      settings: {
        isPrivate: isPrivate || false
      }
    });
    
    await room.save();
    await room.populate('creator', 'name profilePicture');
    
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/community/rooms/:id - Hämta specifikt community-rum
router.get('/rooms/:id', protect, async (req, res) => {
  try {
    const room = await CommunityRoom.findById(req.params.id)
      .populate('creator', 'name profilePicture')
      .populate('members.user', 'name profilePicture')
      .populate('moderators', 'name profilePicture');
    
    if (!room) {
      return res.status(404).json({ error: 'Community-rum hittades inte' });
    }
    
    // Kontrollera om användaren har tillgång till privat rum
    if (room.settings.isPrivate && !room.isMember(req.user.id)) {
      return res.status(403).json({ error: 'Du har inte tillgång till detta rum' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/community/rooms/:id/join - Gå med i community-rum
router.post('/rooms/:id/join', protect, async (req, res) => {
  try {
    const room = await CommunityRoom.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Community-rum hittades inte' });
    }
    
    if (room.isMember(req.user.id)) {
      return res.status(400).json({ error: 'Du är redan medlem i detta rum' });
    }
    
    if (room.stats.memberCount >= room.settings.maxMembers) {
      return res.status(400).json({ error: 'Rummet är fullt' });
    }
    
    room.members.push({
      user: req.user.id,
      joinedAt: new Date()
    });
    
    await room.save();
    
    res.json({ message: 'Du har gått med i rummet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/community/rooms/:id/leave - Lämna community-rum
router.post('/rooms/:id/leave', protect, async (req, res) => {
  try {
    const room = await CommunityRoom.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Community-rum hittades inte' });
    }
    
    if (!room.isMember(req.user.id)) {
      return res.status(400).json({ error: 'Du är inte medlem i detta rum' });
    }
    
    if (room.creator.toString() === req.user.id) {
      return res.status(400).json({ error: 'Skaparen kan inte lämna rummet' });
    }
    
    room.members = room.members.filter(
      member => member.user.toString() !== req.user.id
    );
    
    await room.save();
    
    res.json({ message: 'Du har lämnat rummet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/community/rooms/:id/messages - Hämta meddelanden från rum
router.get('/rooms/:id/messages', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const room = await CommunityRoom.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Community-rum hittades inte' });
    }
    
    if (!room.isMember(req.user.id)) {
      return res.status(403).json({ error: 'Du har inte tillgång till detta rum' });
    }
    
    const messages = await CommunityMessage.find({ 
      room: req.params.id,
      isDeleted: false 
    })
      .populate('sender', 'name profilePicture')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/community/rooms/:id/messages - Skicka meddelande
router.post('/rooms/:id/messages', protect, async (req, res) => {
  try {
    const { content, type = 'text', replyTo } = req.body;
    
    const room = await CommunityRoom.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Community-rum hittades inte' });
    }
    
    if (!room.isMember(req.user.id)) {
      return res.status(403).json({ error: 'Du har inte tillgång till detta rum' });
    }
    
    const message = new CommunityMessage({
      room: req.params.id,
      sender: req.user.id,
      content,
      type,
      replyTo: replyTo || null
    });
    
    await message.save();
    await message.populate('sender', 'name profilePicture');
    
    // Skicka meddelande via Socket.IO
    req.io.to(`room_${req.params.id}`).emit('new_message', message);
    
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/community/my-rooms - Hämta användarens rum
router.get('/my-rooms', protect, async (req, res) => {
  try {
    const rooms = await CommunityRoom.find({
      $or: [
        { creator: req.user.id },
        { 'members.user': req.user.id }
      ],
      isActive: true
    })
      .populate('creator', 'name profilePicture')
      .sort({ 'stats.lastActivity': -1 });
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 