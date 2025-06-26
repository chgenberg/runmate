const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect: auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Activity = require('../models/Activity');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/photos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('matches', 'firstName lastName profilePicture')
      .populate('blockedUsers', 'firstName lastName');
    
    if (!user) {
      return res.status(404).json({ message: 'Användare inte funnen' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Serverfel' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      location,
      email
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Användare inte funnen' });
    }

    // Update fields if provided
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.bio = bio ?? user.bio;
    user.location.city = location ?? user.location.city;
    
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'E-postadressen används redan' });
        }
        user.email = email;
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Serverfel' });
  }
});

// Upload profile photo
router.post('/profile/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Ingen fil uppladdad' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Användare inte funnen' });
    }

    // Create full URL for the photo
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://staging-runmate-backend-production.up.railway.app'
      : `http://localhost:${process.env.PORT || 8000}`;
    
    const photoUrl = `${baseUrl}/uploads/photos/${req.file.filename}`;
    
    user.photos = user.photos || [];
    user.photos.unshift(photoUrl);

    // Keep only 6 photos max
    if (user.photos.length > 6) {
      user.photos = user.photos.slice(0, 6);
    }

    // Set as profile picture if it's the first photo or update existing
    user.profilePicture = photoUrl;
    
    // Also set profilePhoto for backward compatibility
    user.profilePhoto = photoUrl;

    await user.save();

    res.json({
      message: 'Foto uppladdat',
      photo: photoUrl,
      photos: user.photos,
      profilePicture: photoUrl
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Serverfel vid uppladdning' });
  }
});

// Delete photo
router.delete('/profile/photo/:photoIndex', auth, async (req, res) => {
  try {
    const { photoIndex } = req.params;
    const index = parseInt(photoIndex);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Användare inte funnen' });
    }

    if (!user.photos || index < 0 || index >= user.photos.length) {
      return res.status(400).json({ message: 'Ogiltigt fotoindex' });
    }

    // Remove photo from array
    const removedPhoto = user.photos[index];
    user.photos.splice(index, 1);

    // Update profile picture if it was the deleted photo
    if (user.profilePicture === removedPhoto) {
      const newProfilePicture = user.photos.length > 0 ? user.photos[0] : null;
      user.profilePicture = newProfilePicture;
      user.profilePhoto = newProfilePicture; // For backward compatibility
    }

    await user.save();

    res.json({
      message: 'Foto borttaget',
      photos: user.photos,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Serverfel' });
  }
});

// Update search preferences
router.put('/search-preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Användare inte funnen' });
    }

    user.searchPreferences = { ...user.searchPreferences, ...req.body };
    await user.save();

    res.json({
      message: 'Sökpreferenser uppdaterade',
      searchPreferences: user.searchPreferences
    });
  } catch (error) {
    console.error('Error updating search preferences:', error);
    res.status(500).json({ message: 'Serverfel' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Användare inte funnen' });
    }

    // Basic stats without AI complexity
    const stats = {
      totalMatches: user.matches ? user.matches.length : 0,
      profileViews: user.profileViews || 0,
      likes: user.likes || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Serverfel' });
  }
});

// Block user
router.post('/block/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Användare inte funnen' });
    }

    if (!user.blockedUsers.includes(userId)) {
      user.blockedUsers.push(userId);
      await user.save();
    }

    res.json({ message: 'Användare blockerad' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Serverfel' });
  }
});

// Unblock user
router.delete('/block/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Användare inte funnen' });
    }

    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
    await user.save();

    res.json({ message: 'Användare avblockerad' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Serverfel' });
  }
});

// Report user
router.post('/report/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, description } = req.body;

    // In a real app, this would create a report record
    // For now, we'll just log it
    console.log(`User ${req.user.id} reported user ${userId}:`, {
      reason,
      description,
      timestamp: new Date()
    });

    res.json({ message: 'Rapport skickad' });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Serverfel' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Användare inte funnen' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Nuvarande lösenord är felaktigt' });
        }

        user.password = newPassword; // Pre-save hook will hash it
        await user.save();

        res.json({ success: true, message: 'Lösenord uppdaterat' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Serverfel' });
    }
});

// Get user settings
router.get('/settings', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('settings');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Användare inte funnen' });
        }
        res.json({ success: true, settings: user.settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Serverfel' });
    }
});

// Update user settings
router.put('/settings', auth, async (req, res) => {
    try {
        const { category, settings } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Användare inte funnen' });
        }

        if (!['privacy', 'notifications', 'app'].includes(category)) {
            return res.status(400).json({ success: false, message: 'Ogiltig inställningskategori' });
        }

        user.settings[category] = { ...user.settings[category], ...settings };
        user.markModified('settings');
        await user.save();

        res.json({ success: true, message: 'Inställningar sparade' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Serverfel' });
    }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        // Here you might want to do more cleanup, like deleting related data
        res.json({ success: true, message: 'Konto raderat' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ success: false, message: 'Serverfel' });
    }
});

// Simple user discovery without AI
router.get('/discover', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'Användare inte funnen' });
    }

    const { maxDistance = 50, ageRange = '18-99', activityLevel, sportTypes } = req.query;
    
    // Parse age range - handle both string and array formats
    let minAge, maxAge;
    if (Array.isArray(ageRange)) {
      [minAge, maxAge] = ageRange.map(Number);
    } else if (typeof ageRange === 'string') {
      [minAge, maxAge] = ageRange.split('-').map(Number);
    } else {
      [minAge, maxAge] = [18, 99];
    }
    const currentYear = new Date().getFullYear();
    const maxBirthYear = currentYear - minAge;
    const minBirthYear = currentYear - maxAge;

    // Build query
    let query = {
      _id: { $ne: req.user.id }, // Exclude current user
      isActive: true
    };

    // Age filter
    if (minAge && maxAge) {
      query.dateOfBirth = {
        $gte: new Date(minBirthYear, 0, 1),
        $lte: new Date(maxBirthYear, 11, 31)
      };
    }

    // Activity level filter
    if (activityLevel && activityLevel !== '') {
      query.activityLevel = activityLevel;
    }

    // Sport types filter
    if (sportTypes && sportTypes !== '') {
      query.sportTypes = { $in: sportTypes.split(',') };
    }

    // Exclude already swiped users
    if (currentUser.swipedUsers && currentUser.swipedUsers.length > 0) {
      query._id.$nin = currentUser.swipedUsers;
    }

    // Exclude blocked users
    if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0) {
      query._id.$nin = [...(query._id.$nin || []), ...currentUser.blockedUsers];
    }

    const users = await User.find(query)
      .select('firstName lastName dateOfBirth birthDate bio photos profilePicture activityLevel sportTypes sports preferredTrainingTimes avgPace weeklyDistance preferredRunTypes location trainingStats')
      .limit(20)
      .sort({ lastActive: -1 });

    // Add distance calculation if user has location
    const usersWithDistance = users.map(user => {
      let distance = null;
      if (currentUser.location && user.location && 
          currentUser.location.coordinates && user.location.coordinates) {
        // Simple distance calculation (Haversine formula)
        const lat1 = currentUser.location.coordinates[1];
        const lon1 = currentUser.location.coordinates[0];
        const lat2 = user.location.coordinates[1];
        const lon2 = user.location.coordinates[0];
        
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = R * c;
      }

      return {
        ...user.toObject(),
        distance
      };
    });

    // Filter by distance if specified
    const filteredUsers = maxDistance ? 
      usersWithDistance.filter(user => !user.distance || user.distance <= maxDistance) :
      usersWithDistance;

    res.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error discovering users:', error);
    res.status(500).json({ message: 'Serverfel' });
  }
});

// Handle swipe action
router.post('/swipe', auth, async (req, res) => {
  try {
    const { swipedUserId, action } = req.body;
    
    if (!swipedUserId || !action || !['like', 'pass'].includes(action)) {
      return res.status(400).json({ message: 'Ogiltiga parametrar' });
    }

    const currentUser = await User.findById(req.user.id);
    const swipedUser = await User.findById(swipedUserId);

    if (!currentUser || !swipedUser) {
      return res.status(404).json({ message: 'Användare inte funnen' });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.swipedUsers) currentUser.swipedUsers = [];
    if (!currentUser.likedUsers) currentUser.likedUsers = [];
    if (!swipedUser.likedBy) swipedUser.likedBy = [];

    // Record the swipe
    if (!currentUser.swipedUsers.includes(swipedUserId)) {
      currentUser.swipedUsers.push(swipedUserId);
    }

    let isMatch = false;
    
    if (action === 'like') {
      // Add to liked users
      if (!currentUser.likedUsers.includes(swipedUserId)) {
        currentUser.likedUsers.push(swipedUserId);
      }
      
      // Add to swipedUser's likedBy
      if (!swipedUser.likedBy.includes(req.user.id)) {
        swipedUser.likedBy.push(req.user.id);
      }

      // Check if it's a match (both users liked each other)
      if (swipedUser.likedUsers && swipedUser.likedUsers.includes(req.user.id)) {
        isMatch = true;
        
        // Add to matches for both users
        if (!currentUser.matches) currentUser.matches = [];
        if (!swipedUser.matches) swipedUser.matches = [];
        
        if (!currentUser.matches.includes(swipedUserId)) {
          currentUser.matches.push(swipedUserId);
        }
        if (!swipedUser.matches.includes(req.user.id)) {
          swipedUser.matches.push(req.user.id);
        }
      }
    }

    await currentUser.save();
    await swipedUser.save();

    const response = { success: true, action };
    if (isMatch) {
      response.match = {
        _id: `${req.user.id}_${swipedUserId}`,
        user: swipedUser.firstName,
        timestamp: new Date()
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error handling swipe:', error);
    res.status(500).json({ message: 'Serverfel' });
  }
});

// @route   GET api/users/leaderboard
// @desc    Get leaderboard (national and local rankings)
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { type = 'points', timeframe = 'all', location } = req.query;
    const currentUser = await User.findById(req.user.id);
    
    let matchCondition = { isActive: true };
    let sortField = {};
    
    // Set up sort criteria based on type
    switch (type) {
      case 'points':
        sortField = { points: -1, level: -1 };
        break;
      case 'level':
        sortField = { level: -1, points: -1 };
        break;
      case 'activities':
        // We'll need to aggregate activity count
        break;
      default:
        sortField = { points: -1 };
    }
    
    // For local rankings, filter by city/region
    if (location && currentUser.location) {
      matchCondition['location.city'] = currentUser.location.city;
    }
    
    let leaderboard;
    
    if (type === 'activities') {
      // Aggregate users with their activity count
      const pipeline = [
        { $match: matchCondition },
        {
          $lookup: {
            from: 'activities',
            localField: '_id',
            foreignField: 'userId',
            as: 'activities'
          }
        },
        {
          $addFields: {
            activityCount: { $size: '$activities' },
            totalDistance: { $sum: '$activities.distance' },
            totalTime: { $sum: '$activities.duration' }
          }
        },
        {
          $sort: { activityCount: -1, totalDistance: -1, points: -1 }
        },
        {
          $limit: 100
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            profilePhoto: 1,
            points: 1,
            level: 1,
            location: 1,
            activityCount: 1,
            totalDistance: 1,
            totalTime: 1
          }
        }
      ];
      
      if (timeframe !== 'all') {
        const timeFilter = getTimeFilter(timeframe);
        pipeline[1].$lookup.pipeline = [{ $match: { startTime: timeFilter } }];
      }
      
      leaderboard = await User.aggregate(pipeline);
    } else {
      // Simple points/level leaderboard
      leaderboard = await User.find(matchCondition)
        .select('firstName lastName profilePhoto points level location')
        .sort(sortField)
        .limit(100);
    }
    
    // Add rank and find current user position
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user.toObject ? user.toObject() : user,
      rank: index + 1,
      isCurrentUser: user._id.toString() === req.user.id.toString()
    }));
    
    // Get current user's rank if not in top 100
    let currentUserRank = rankedLeaderboard.find(user => user.isCurrentUser);
    if (!currentUserRank && type !== 'activities') {
      const usersAbove = await User.countDocuments({
        ...matchCondition,
        $or: [
          { [type]: { $gt: currentUser[type] } },
          { 
            [type]: currentUser[type], 
            _id: { $lt: req.user.id } 
          }
        ]
      });
      currentUserRank = {
        ...currentUser.toObject(),
        rank: usersAbove + 1,
        isCurrentUser: true
      };
    }
    
    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        currentUserRank,
        type,
        timeframe,
        isLocal: !!location,
        totalUsers: rankedLeaderboard.length
      }
    });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard'
    });
  }
});

// Helper function for time filtering
const getTimeFilter = (timeframe) => {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      return {}; // No filter for 'all'
  }
  
  return { $gte: startDate };
};

// @route   GET api/users/stats/summary
// @desc    Get user statistics summary for leaderboard context
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if this is the test account
    if (user.email === 'test@runmate.se') {
      // Return comprehensive dummy data for test account
      const dummyStats = {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          points: 15420,
          level: 12,
          profilePhoto: user.profilePhoto
        },
        stats: {
          // Basic metrics
          totalActivities: 287,
          totalDistance: 1842.7,
          totalTime: 432000, // 120 hours in seconds
          avgPace: 330, // 5:30 per km
          
          // Distance achievements
          longestRun: 42.2,
          avgRunDistance: 6.4,
          
          // Pace achievements
          bestPace: 270, // 4:30 per km
          avgPaceFormatted: '5:30',
          bestPaceFormatted: '4:30',
          
          // Health metrics from Apple Health
          totalCalories: 178500,
          avgHeartRate: 152,
          maxHeartRate: 189,
          
          // Elevation
          totalElevation: 12450,
          biggestClimb: 385,
          
          // Consistency metrics
          weeklyConsistency: 4, // Active all 4 weeks
          activeDays: 24, // Last 30 days
          
          // Monthly progress
          thisMonth: {
            distance: 185.3,
            activities: 22,
            time: 39600, // 11 hours
            bestPace: 285,
            bestPaceFormatted: '4:45'
          },
          
          // Training insights
          totalHours: 120.0,
          avgRunTime: 42, // minutes
          
          // Additional Apple Health metrics
          vo2Max: 52.3,
          restingHeartRate: 48,
          heartRateVariability: 65,
          stepCount: 892340,
          activeCalories: 142300,
          standHours: 14,
          exerciseMinutes: 7200,
          
          // Personal records
          records: {
            '5k': { time: '22:30', date: '2024-03-15', pace: '4:30' },
            '10k': { time: '47:15', date: '2024-02-28', pace: '4:43' },
            'halfMarathon': { time: '1:45:30', date: '2024-01-20', pace: '5:00' },
            'marathon': { time: '3:52:45', date: '2023-10-15', pace: '5:30' }
          },
          
          // Training zones distribution
          trainingZones: {
            recovery: 35, // percentage
            aerobic: 40,
            threshold: 20,
            vo2max: 5
          },
          
          // Weekly pattern
          weeklyPattern: {
            monday: { runs: 41, avgDistance: 5.2 },
            tuesday: { runs: 45, avgDistance: 8.1 },
            wednesday: { runs: 38, avgDistance: 6.5 },
            thursday: { runs: 42, avgDistance: 10.2 },
            friday: { runs: 35, avgDistance: 4.8 },
            saturday: { runs: 48, avgDistance: 15.3 },
            sunday: { runs: 38, avgDistance: 12.1 }
          },
          
          // Seasonal performance
          seasonalPerformance: {
            spring: { distance: 485.2, avgPace: '5:25' },
            summer: { distance: 523.8, avgPace: '5:20' },
            autumn: { distance: 467.3, avgPace: '5:28' },
            winter: { distance: 366.4, avgPace: '5:35' }
          }
        },
        rankings: {
          national: 342,
          local: 28,
          ageGroup: 45,
          gender: 189
        }
      };
      
      return res.json({
        success: true,
        data: dummyStats
      });
    }
    
    // Get activity statistics with enhanced metrics
    const activityStats = await Activity.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalTime: { $sum: '$duration' },
          totalElevation: { $sum: '$elevationGain' },
          totalPoints: { $sum: '$pointsEarned' },
          totalCalories: { $sum: '$calories' },
          avgDistance: { $avg: '$distance' },
          avgPace: { $avg: '$averagePace' },
          avgHeartRate: { $avg: '$averageHeartRate' },
          maxDistance: { $max: '$distance' },
          fastestPace: { $min: '$averagePace' },
          maxElevation: { $max: '$elevationGain' },
          maxHeartRate: { $max: '$maxHeartRate' }
        }
      }
    ]);
    
    // Get running consistency (weekly activity)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentActivities = await Activity.find({
      userId: new mongoose.Types.ObjectId(req.user.id),
      startTime: { $gte: last30Days }
    }).sort({ startTime: -1 });
    
    // Calculate weekly consistency
    const weeksWithRuns = new Set();
    recentActivities.forEach(activity => {
      const week = Math.floor((new Date() - new Date(activity.startTime)) / (7 * 24 * 60 * 60 * 1000));
      weeksWithRuns.add(week);
    });
    
    // Get personal records (this month vs all time)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyStats = await Activity.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(req.user.id),
          startTime: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          monthlyDistance: { $sum: '$distance' },
          monthlyActivities: { $sum: 1 },
          monthlyTime: { $sum: '$duration' },
          bestMonthlyPace: { $min: '$averagePace' }
        }
      }
    ]);
    
    const stats = activityStats[0] || {
      totalActivities: 0,
      totalDistance: 0,
      totalTime: 0,
      totalElevation: 0,
      totalPoints: 0,
      totalCalories: 0,
      avgDistance: 0,
      avgPace: 0,
      avgHeartRate: 0,
      maxDistance: 0,
      fastestPace: 0,
      maxElevation: 0,
      maxHeartRate: 0
    };
    
    const monthly = monthlyStats[0] || {
      monthlyDistance: 0,
      monthlyActivities: 0,
      monthlyTime: 0,
      bestMonthlyPace: 0
    };
    
    // Calculate enhanced metrics
    const enhancedStats = {
      ...stats,
      // Basic metrics
      totalActivities: stats.totalActivities,
      totalDistance: Math.round(stats.totalDistance * 10) / 10,
      totalTime: stats.totalTime,
      avgPace: Math.round(stats.avgPace),
      
      // Distance achievements
      longestRun: Math.round(stats.maxDistance * 10) / 10,
      avgRunDistance: Math.round(stats.avgDistance * 10) / 10,
      
      // Pace achievements
      bestPace: Math.round(stats.fastestPace),
      avgPaceFormatted: formatPaceFromSeconds(stats.avgPace),
      bestPaceFormatted: formatPaceFromSeconds(stats.fastestPace),
      
      // Health metrics
      totalCalories: Math.round(stats.totalCalories),
      avgHeartRate: Math.round(stats.avgHeartRate),
      maxHeartRate: Math.round(stats.maxHeartRate),
      
      // Elevation
      totalElevation: Math.round(stats.totalElevation),
      biggestClimb: Math.round(stats.maxElevation),
      
      // Consistency metrics
      weeklyConsistency: Math.min(weeksWithRuns.size, 4), // Last 4 weeks
      activeDays: recentActivities.length,
      
      // Monthly progress
      thisMonth: {
        distance: Math.round(monthly.monthlyDistance * 10) / 10,
        activities: monthly.monthlyActivities,
        time: monthly.monthlyTime,
        bestPace: Math.round(monthly.bestMonthlyPace),
        bestPaceFormatted: formatPaceFromSeconds(monthly.bestMonthlyPace)
      },
      
      // Training insights
      totalHours: Math.round(stats.totalTime / 3600 * 10) / 10,
      avgRunTime: stats.totalActivities > 0 ? Math.round(stats.totalTime / stats.totalActivities / 60) : 0
    };
    
    // Calculate national and local rankings
    const nationalRank = await User.countDocuments({
      points: { $gt: user.points },
      isActive: true
    }) + 1;
    
    let localRank = null;
    if (user.location && user.location.city) {
      localRank = await User.countDocuments({
        points: { $gt: user.points },
        'location.city': user.location.city,
        isActive: true
      }) + 1;
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          points: user.points,
          level: user.level,
          profilePhoto: user.profilePhoto
        },
        stats: enhancedStats,
        rankings: {
          national: nationalRank,
          local: localRank
        }
      }
    });
    
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user stats'
    });
  }
});

// Helper function to format pace from seconds to MM:SS
function formatPaceFromSeconds(seconds) {
  if (!seconds || seconds === 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Public endpoint to get a specific user's profile
router.get('/public/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('firstName lastName profilePicture location pace bio rating totalRuns weeklyGoal totalDistance favoriteActivities achievements stats')
      .lean();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        ...user,
        rating: user.rating || 4.5,
        totalRuns: user.totalRuns || Math.floor(Math.random() * 200) + 50,
        weeklyGoal: user.weeklyGoal || Math.floor(Math.random() * 50) + 20,
        totalDistance: user.totalDistance || Math.floor(Math.random() * 1500) + 500,
        favoriteActivities: user.favoriteActivities || ['Löpning'],
        achievements: user.achievements || [],
        stats: user.stats || {
          avgPace: user.pace || '5:30',
          longestRun: '21.1 km',
          weeklyAvg: '25 km',
          totalTime: '156 timmar'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user profile' 
    });
  }
});

// Public endpoint to get users for landing page
router.get('/public', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Get users with basic public info only
    const users = await User.find({ isActive: { $ne: false } })
      .select('firstName lastName profilePicture location pace bio rating totalRuns weeklyGoal favoriteActivities personalBests motivation weeklyKm')
      .limit(limit)
      .lean();

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        location: user.location,
        pace: user.pace,
        bio: user.bio,
        rating: user.rating || 4.5,
        totalRuns: user.totalRuns || Math.floor(Math.random() * 200) + 50,
        weeklyGoal: user.weeklyGoal || Math.floor(Math.random() * 50) + 20,
        favoriteActivities: user.favoriteActivities || ['Löpning']
      }))
    });
  } catch (error) {
    console.error('Error fetching public users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// Public endpoint to get leaderboard
router.get('/leaderboard/public', async (req, res) => {
  try {
    const topUsers = await User.find({ isActive: { $ne: false } })
      .select('firstName lastName location profilePicture weeklyKm')
      .sort({ weeklyKm: -1 })
      .limit(5)
      .lean();

    const leaderboard = topUsers.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      location: user.location || 'Sverige',
      weeklyKm: user.weeklyKm || Math.floor(Math.random() * 80) + 20,
      avatar: user.firstName.charAt(0) + user.lastName.charAt(0)
    }));

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching public leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leaderboard' 
    });
  }
});

module.exports = router; 