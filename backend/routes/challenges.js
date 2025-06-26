const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Helper function to update challenge status based on dates
const updateChallengeStatus = async (challenge) => {
  const now = new Date();
  let newStatus = challenge.status;
  
  if (challenge.status === 'upcoming' && now >= challenge.startDate) {
    newStatus = 'active';
  } else if (challenge.status === 'active' && now > challenge.endDate) {
    newStatus = 'completed';
  }
  
  if (newStatus !== challenge.status) {
    challenge.status = newStatus;
    await challenge.save();
  }
  
  return challenge;
};

// Get all public challenges + user's private challenges
router.get('/', protect, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    
    const query = {
      $or: [
        { visibility: 'public' },
        { creator: req.user._id },
        { 'participants.user': req.user._id }
      ]
    };
    
    if (status) query.status = status;
    if (type) query.type = type;
    
    const challenges = await Challenge.find(query)
      .populate('creator', 'firstName lastName profileImage username')
      .populate('participants.user', 'firstName lastName profileImage username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Add calculated fields for each challenge
    const enrichedChallenges = challenges.map(challenge => {
      const challengeObj = challenge.toObject({ virtuals: true });
      
      // Calculate additional fields
      challengeObj.daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
      challengeObj.participantCount = challenge.participants.filter(p => p.isActive !== false).length;
      challengeObj.isJoined = challenge.participants.some(p => p.user._id.toString() === req.user._id.toString() && p.isActive !== false);
      
      // Calculate progress percentage for individual or collective goals
      if (challenge.goal.isCollective) {
        const metric = challenge.goal.unit.replace('km', 'distance').replace('meters', 'elevation').replace('hours', 'time');
        const totalProgress = challenge.totalProgress[metric] || 0;
        challengeObj.progressPercentage = Math.min((totalProgress / challenge.goal.target) * 100, 100);
      } else if (challengeObj.isJoined) {
        const participant = challenge.participants.find(p => p.user._id.toString() === req.user._id.toString());
        if (participant) {
          const metric = challenge.goal.unit.replace('km', 'distance').replace('meters', 'elevation').replace('hours', 'time');
          const userProgress = participant.progress[metric] || 0;
          challengeObj.progressPercentage = Math.min((userProgress / challenge.goal.target) * 100, 100);
        } else {
          challengeObj.progressPercentage = 0;
        }
      } else {
        challengeObj.progressPercentage = 0;
      }
      
      return challengeObj;
    });
    
    res.json(enrichedChallenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trending/featured challenges
router.get('/trending', protect, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      visibility: 'public'
    })
    .populate('creator', 'firstName lastName profileImage username')
    .sort({ createdAt: -1 })
    .limit(12);
    
    // Add calculated fields for each challenge
    const enrichedChallenges = challenges.map(challenge => {
      const challengeObj = challenge.toObject({ virtuals: true });
      
      // Calculate additional fields safely
      challengeObj.daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
      challengeObj.participantCount = (challenge.participants || []).length;
      challengeObj.isJoined = false; // Simplified for now
      challengeObj.progressPercentage = 0; // Simplified for now
      
      return challengeObj;
    });
    
    res.json(enrichedChallenges);
  } catch (error) {
    console.error('Trending challenges error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's active challenges
router.get('/my-challenges', protect, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      'participants.user': req.user._id,
      'participants.isActive': { $ne: false }
    })
    .populate('creator', 'firstName lastName profileImage username')
    .populate('participants.user', 'firstName lastName profileImage username')
    .sort({ createdAt: -1 });
    
    // Add calculated fields for each challenge
    const enrichedChallenges = challenges.map(challenge => {
      const challengeObj = challenge.toObject({ virtuals: true });
      
      // Calculate additional fields
      challengeObj.daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
      challengeObj.participantCount = challenge.participants.filter(p => p.isActive !== false).length;
      challengeObj.isJoined = true; // Always true for my challenges
      
      // Calculate user's progress percentage
      const participant = challenge.participants.find(p => p.user._id.toString() === req.user._id.toString());
      if (participant) {
        const metric = challenge.goal.unit.replace('km', 'distance').replace('meters', 'elevation').replace('hours', 'time');
        const userProgress = participant.progress[metric] || 0;
        challengeObj.progressPercentage = Math.min((userProgress / challenge.goal.target) * 100, 100);
        challengeObj.myProgress = {
          value: userProgress,
          percentage: challengeObj.progressPercentage
        };
      } else {
        challengeObj.progressPercentage = 0;
        challengeObj.myProgress = { value: 0, percentage: 0 };
      }
      
      return challengeObj;
    });
    
    res.json(enrichedChallenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new challenge
router.post('/', protect, [
  body('title').trim().isLength({ min: 2, max: 100 }),
  body('description').trim().isLength({ min: 2, max: 500 }),
  body('type').isIn(['distance', 'time', 'activities', 'elevation', 'custom']),
  body('goal.target').isNumeric().isFloat({ min: 0.1 }),
  body('goal.unit').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    console.log('Received challenge data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      description,
      type,
      goal,
      startDate,
      endDate,
      visibility = 'public',
      maxParticipants = 50,
      allowedActivityTypes = ['running'],
      rewards
    } = req.body;
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    if (start < new Date(Date.now() - 24 * 60 * 60 * 1000)) { // Allow start date within the last 24 hours
      return res.status(400).json({ message: 'Start date cannot be more than 24 hours in the past' });
    }
    
    // Generate join code for private challenges
    let joinCode;
    if (visibility === 'private') {
      joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    const challenge = new Challenge({
      title,
      description,
      type,
      goal,
      startDate: start,
      endDate: end,
      duration: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
      creator: req.user._id,
      visibility,
      joinCode,
      maxParticipants,
      allowedActivityTypes,
      rewards,
      participants: [{ user: req.user._id }] // Creator auto-joins
    });
    
    await challenge.save();
    
    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('creator', 'firstName lastName profileImage')
      .populate('participants.user', 'firstName lastName profileImage');
    
    res.status(201).json(populatedChallenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific challenge
router.get('/:id', protect, async (req, res) => {
  try {
    let challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'firstName lastName profileImage username')
      .populate('participants.user', 'firstName lastName profileImage username');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Update status based on current date
    challenge = await updateChallengeStatus(challenge);
    
    // Check if user can view this challenge
    const canView = challenge.visibility === 'public' || 
                   challenge.creator.toString() === req.user._id.toString() ||
                   challenge.participants.some(p => p.user._id.toString() === req.user._id.toString());
    
    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Enrich challenge with calculated fields
    const challengeObj = challenge.toObject({ virtuals: true });
    
    // Calculate additional fields
    challengeObj.daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
    challengeObj.participantCount = challenge.participants.filter(p => p.isActive !== false).length;
    challengeObj.isJoined = challenge.participants.some(p => p.user._id.toString() === req.user._id.toString() && p.isActive !== false);
    
    // Calculate progress for each participant
    const metric = challenge.goal.unit.replace('km', 'distance').replace('meters', 'elevation').replace('hours', 'time');
    challengeObj.participants = challengeObj.participants.map(participant => {
      const progress = participant.progress[metric] || 0;
      const percentage = Math.min((progress / challenge.goal.target) * 100, 100);
      
      return {
        ...participant,
        progressValue: progress,
        progressPercentage: percentage
      };
    });
    
    // Determine winner if challenge is completed
    if (challenge.status === 'completed') {
      const activeParticipants = challengeObj.participants.filter(p => p.isActive);
      let winner = null;

      if (challenge.goal.winCondition === 'highest_individual' && activeParticipants.length > 0) {
        winner = activeParticipants.sort((a, b) => b.progressValue - a.progressValue)[0];
      }
      // Note: 'first_to_complete' would require timestamping completion, 
      // for now, we'll treat it as 'highest_individual' post-challenge.
      else if (challenge.goal.winCondition === 'first_to_complete' && activeParticipants.length > 0) {
        winner = activeParticipants.sort((a, b) => b.progressValue - a.progressValue)[0];
      }
      
      if (winner) {
        challengeObj.winner = winner.user;
      }
    }
    
    // Calculate overall progress
    if (challenge.goal.isCollective) {
      const totalProgress = challenge.totalProgress[metric] || 0;
      challengeObj.progressPercentage = Math.min((totalProgress / challenge.goal.target) * 100, 100);
    } else if (challengeObj.isJoined) {
      const participant = challenge.participants.find(p => p.user._id.toString() === req.user._id.toString());
      if (participant) {
        const metric = challenge.goal.unit.replace('km', 'distance').replace('meters', 'elevation').replace('hours', 'time');
        const userProgress = participant.progress[metric] || 0;
        challengeObj.progressPercentage = Math.min((userProgress / challenge.goal.target) * 100, 100);
        challengeObj.myProgress = {
          value: userProgress,
          percentage: challengeObj.progressPercentage
        };
      }
    }
    
    res.json(challengeObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join challenge
router.post('/:id/join', protect, async (req, res) => {
  try {
    const { joinCode } = req.body;
    let challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Update status based on current date before checking joinability
    challenge = await updateChallengeStatus(challenge);
    
    // Check if challenge is joinable
    if (challenge.status !== 'upcoming' && challenge.status !== 'active') {
      return res.status(400).json({ message: 'Cannot join completed or cancelled challenge' });
    }
    
    // Check visibility and join code
    if (challenge.visibility === 'private' && challenge.joinCode !== joinCode) {
      return res.status(403).json({ message: 'Invalid join code' });
    }
    
    await challenge.addParticipant(req.user._id);
    
    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('creator', 'firstName lastName profileImage username')
      .populate('participants.user', 'firstName lastName profileImage username');
    
    // Enrich with calculated fields
    const challengeObj = updatedChallenge.toObject({ virtuals: true });
    challengeObj.daysRemaining = Math.max(0, Math.ceil((new Date(updatedChallenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
    challengeObj.participantCount = updatedChallenge.participants.filter(p => p.isActive !== false).length;
    challengeObj.isJoined = true;
    
    res.json(challengeObj);
  } catch (error) {
    if (error.message === 'Challenge is full' || error.message === 'User already participating') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Leave challenge
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Don't allow creator to leave
    if (challenge.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave challenge' });
    }
    
    const participant = challenge.participants.find(p => p.user.toString() === req.user._id.toString());
    if (!participant) {
      return res.status(400).json({ message: 'Not participating in this challenge' });
    }
    
    participant.isActive = false;
    await challenge.save();
    
    res.json({ message: 'Successfully left challenge' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get challenge leaderboard
router.get('/:id/leaderboard', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants.user', 'firstName lastName profileImage username');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Calculate leaderboard with enhanced data
    const metric = challenge.goal.unit.replace('km', 'distance').replace('meters', 'elevation').replace('hours', 'time');
    
    const leaderboard = challenge.participants
      .filter(p => p.isActive !== false && p.user)
      .map(p => ({
        user: p.user,
        progress: p.progress[metric] || 0,
        progressPercentage: Math.min(((p.progress[metric] || 0) / challenge.goal.target) * 100, 100),
        rank: 0,
        achievements: p.achievements || [],
        joinedAt: p.joinedAt
      }));
      
    // Sort leaderboard based on win condition
    if (challenge.goal.winCondition === 'first_to_complete' || challenge.goal.winCondition === 'highest_individual') {
      leaderboard.sort((a, b) => b.progress - a.progress);
    }
    // For collective goals, we can still sort by contribution
    else if (challenge.goal.winCondition === 'collective_goal') {
      leaderboard.sort((a, b) => b.progress - a.progress);
    }
    
    const rankedLeaderboard = leaderboard.map((p, index) => ({ ...p, rank: index + 1 }));
    
    res.json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update challenge progress (called when activity is synced)
router.post('/:id/progress', protect, async (req, res) => {
  try {
    const { activityData } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    await challenge.updateProgress(req.user._id, activityData);
    
    // Check for achievements and milestones
    const participant = challenge.participants.find(p => p.user.toString() === req.user._id.toString());
    const progressMetric = challenge.goal.unit.replace('km', 'distance');
    const currentProgress = participant.progress[progressMetric];
    
    // Check milestones
    const newAchievements = [];
    for (const milestone of challenge.rewards.milestones || []) {
      const hasAchievement = participant.achievements.some(a => a.type === 'milestone' && a.value === milestone.at);
      
      if (!hasAchievement && currentProgress >= milestone.at) {
        participant.achievements.push({
          type: 'milestone',
          value: milestone.at,
          earnedAt: new Date()
        });
        newAchievements.push(milestone);
      }
    }
    
    await challenge.save();
    
    res.json({ 
      message: 'Progress updated',
      achievements: newAchievements,
      currentProgress,
      participant
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get challenge statistics
router.get('/:id/stats', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants.user', 'firstName lastName profileImage username');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Calculate enhanced statistics
    const metric = challenge.goal.unit.replace('km', 'distance').replace('meters', 'elevation').replace('hours', 'time');
    const activeParticipants = challenge.participants.filter(p => p.isActive !== false);
    const totalParticipants = activeParticipants.length;
    const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
    
    // Calculate total and average progress
    const totalProgress = challenge.goal.isCollective 
      ? challenge.totalProgress[metric] || 0
      : activeParticipants.reduce((sum, p) => sum + (p.progress[metric] || 0), 0);
    
    const averageProgress = totalParticipants > 0 ? totalProgress / totalParticipants : 0;
    
    // Calculate progress percentage
    const progressPercentage = challenge.goal.isCollective
      ? Math.min((totalProgress / challenge.goal.target) * 100, 100)
      : Math.min((averageProgress / challenge.goal.target) * 100, 100);
    
    // Get top performers
    const topPerformers = activeParticipants
      .map(p => ({
        user: p.user,
        progress: p.progress[metric] || 0,
        progressPercentage: Math.min(((p.progress[metric] || 0) / challenge.goal.target) * 100, 100)
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
    
    const stats = {
      totalParticipants,
      activeParticipants: totalParticipants,
      totalProgress: {
        [metric]: totalProgress,
        ...challenge.totalProgress
      },
      averageProgress,
      progressPercentage,
      daysRemaining,
      daysSinceStart: Math.ceil((new Date() - new Date(challenge.startDate)) / (1000 * 60 * 60 * 24)),
      totalDuration: Math.ceil((new Date(challenge.endDate) - new Date(challenge.startDate)) / (1000 * 60 * 60 * 24)),
      topPerformers,
      goalInfo: {
        target: challenge.goal.target,
        unit: challenge.goal.unit,
        isCollective: challenge.goal.isCollective,
        type: challenge.type
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update challenge
router.put('/:id', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Only creator can update
    if (challenge.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can update challenge' });
    }
    
    // Only allow certain fields to be updated
    const allowedUpdates = ['title', 'description', 'endDate', 'maxParticipants', 'rewards'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    Object.assign(challenge, updates);
    await challenge.save();
    
    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('creator', 'firstName lastName profileImage')
      .populate('participants.user', 'firstName lastName profileImage');
    
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete challenge
router.delete('/:id', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Only creator can delete
    if (challenge.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete challenge' });
    }
    
    // Can only delete if not started or no participants (except creator)
    if (challenge.status === 'active' && challenge.participantCount > 1) {
      return res.status(400).json({ message: 'Cannot delete active challenge with participants' });
    }
    
    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public endpoint to get challenges
router.get('/public', async (req, res) => {
  try {
    const challenges = await Challenge.find({ 
      isActive: true,
      endDate: { $gt: new Date() }
    })
    .select('title description participants endDate reward')
    .limit(10)
    .lean();

    const formattedChallenges = challenges.map(challenge => ({
      _id: challenge._id,
      title: challenge.title,
      participants: challenge.participants?.length || Math.floor(Math.random() * 200) + 50,
      daysLeft: Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
      reward: challenge.reward || `${Math.floor(Math.random() * 2000) + 300} poäng`
    }));

    res.json({
      success: true,
      challenges: formattedChallenges
    });
  } catch (error) {
    console.error('Error fetching public challenges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch challenges' 
    });
  }
});

module.exports = router; 