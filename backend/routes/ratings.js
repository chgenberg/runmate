const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Rating = require('../models/Rating');
const User = require('../models/User');
const RunEvent = require('../models/RunEvent');

// @desc    Ge betyg till en användare efter ett event
// @route   POST /api/ratings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { 
      rateeId, 
      eventId, 
      categories, 
      comment, 
      overallRating,
      reportToSupport 
    } = req.body;
    
    const raterId = req.user.id;
    
    // Validering
    if (raterId === rateeId) {
      return res.status(400).json({
        success: false,
        message: 'Du kan inte betygsätta dig själv'
      });
    }
    
    // Kontrollera att eventet existerar och att användaren deltog
    const event = await RunEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event hittades inte'
      });
    }
    
    // Kontrollera att båda användarna deltog i eventet
    const raterParticipated = event.participants.includes(raterId);
    const rateeParticipated = event.participants.includes(rateeId);
    
    if (!raterParticipated || !rateeParticipated) {
      return res.status(400).json({
        success: false,
        message: 'Båda användarna måste ha deltagit i eventet'
      });
    }
    
    // Kontrollera att eventet är avslutat (datum har passerat)
    if (new Date(event.date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Du kan endast betygsätta efter att eventet är avslutat'
      });
    }
    
    // Kontrollera om betyg redan existerar
    const existingRating = await Rating.findOne({
      rater: raterId,
      ratee: rateeId,
      relatedEvent: eventId
    });
    
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Du har redan betygsatt denna person för detta event'
      });
    }
    
    // Skapa nytt betyg
    const rating = await Rating.create({
      rater: raterId,
      ratee: rateeId,
      relatedEvent: eventId,
      categories: categories || {},
      comment: comment || '',
      overallRating,
      reportToSupport: reportToSupport || { hasReport: false }
    });
    
    await rating.populate('rater', 'firstName lastName');
    await rating.populate('ratee', 'firstName lastName');
    
    // Update the ratee's cached rating stats
    const updatedStats = await Rating.getUserRatingStats(rateeId);
    await User.findByIdAndUpdate(rateeId, {
      ratingStats: {
        ...updatedStats,
        lastUpdated: new Date()
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Betyg skapat!',
      data: rating
    });
    
  } catch (error) {
    console.error('Rating creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel'
    });
  }
});

// @desc    Hämta användarens rating-statistik
// @route   GET /api/ratings/user/:userId/stats
// @access  Private
router.get('/user/:userId/stats', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = await Rating.getUserRatingStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Rating stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel'
    });
  }
});

// @desc    Hämta ratings för en användare (publika)
// @route   GET /api/ratings/user/:userId
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const ratings = await Rating.find({
      ratee: userId,
      isApproved: true
    })
    .populate('rater', 'firstName lastName profilePhoto')
    .populate('relatedEvent', 'title date')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await Rating.countDocuments({
      ratee: userId,
      isApproved: true
    });
    
    res.json({
      success: true,
      data: {
        ratings,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
    
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel'
    });
  }
});

// @desc    Hämta events som användaren kan betygsätta
// @route   GET /api/ratings/pending
// @access  Private
router.get('/pending', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Hitta events som användaren deltog i som är avslutade
    const completedEvents = await RunEvent.find({
      participants: userId,
      date: { $lt: new Date() }
    }).populate('participants', 'firstName lastName profilePhoto');
    
    // För varje event, kolla vilka deltagare som användaren inte har betygsatt än
    const pendingRatings = [];
    
    for (const event of completedEvents) {
      const otherParticipants = event.participants.filter(p => 
        p._id.toString() !== userId
      );
      
      for (const participant of otherParticipants) {
        // Kolla om betyg redan existerar
        const existingRating = await Rating.findOne({
          rater: userId,
          ratee: participant._id,
          relatedEvent: event._id
        });
        
        if (!existingRating) {
          pendingRatings.push({
            event: {
              _id: event._id,
              title: event.title,
              date: event.date
            },
            participant: {
              _id: participant._id,
              firstName: participant.firstName,
              lastName: participant.lastName,
              profilePhoto: participant.profilePhoto
            }
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: pendingRatings
    });
    
  } catch (error) {
    console.error('Pending ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel'
    });
  }
});

// @desc    Rapportera problem till support
// @route   POST /api/ratings/report
// @access  Private
router.post('/report', protect, async (req, res) => {
  try {
    const { 
      reportedUserId, 
      eventId, 
      reason, 
      details 
    } = req.body;
    
    const reporterId = req.user.id;
    
    // Skapa en "dold" rating med endast support-rapport
    const report = await Rating.create({
      rater: reporterId,
      ratee: reportedUserId,
      relatedEvent: eventId,
      overallRating: 1, // Dummy-värde
      isApproved: false, // Inte synlig för användare
      reportToSupport: {
        hasReport: true,
        reportReason: reason,
        reportDetails: details,
        isHandled: false
      }
    });
    
    res.json({
      success: true,
      message: 'Rapport skickad till support'
    });
    
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel'
    });
  }
});

module.exports = router; 