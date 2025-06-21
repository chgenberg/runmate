const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Activity = require('../models/Activity');
const RunEvent = require('../models/RunEvent');
const Challenge = require('../models/Challenge');
const moment = require('moment');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // Date ranges
        const startOfWeek = moment().startOf('isoWeek').toDate();
        const endOfWeek = moment().endOf('isoWeek').toDate();
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();

        // 1. Fetch user data (basic info, level, xp etc)
        const user = await User.findById(userId).select('firstName level points profilePhoto');

        // 2. Fetch recent activities (last 4)
        const recentActivities = await Activity.find({ userId })
            .sort({ startTime: -1 })
            .limit(4)
            .select('title distance averagePace duration startTime activityType elevationGain');

        // 3. Fetch upcoming run events (that user is part of)
        const upcomingRuns = await RunEvent.find({
            participants: userId,
            date: { $gte: new Date() }
        })
        .sort({ date: 1 })
        .limit(3)
        .populate('host', 'firstName lastName profilePhoto');

        // 4. Fetch active challenges
        const challenges = await Challenge.find({
            'participants.user': userId,
            status: 'active'
        }).limit(3);

        // 5. Aggregate weekly stats
        const weeklyActivities = await Activity.find({
            userId,
            startTime: { $gte: startOfWeek, $lte: endOfWeek }
        });

        const weeklyStats = weeklyActivities.reduce((acc, activity) => {
            acc.runs += 1;
            acc.distance += activity.distance;
            acc.time += activity.duration;
            acc.elevation += activity.elevationGain || 0;
            return acc;
        }, { runs: 0, distance: 0, time: 0, elevation: 0, pace: 0 });

        if (weeklyStats.runs > 0) {
            weeklyStats.pace = (weeklyStats.time / weeklyStats.distance); // seconds per km
        }

        // 6. Aggregate monthly stats
        const monthlyActivities = await Activity.find({
            userId,
            startTime: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const monthlyStats = monthlyActivities.reduce((acc, activity) => {
            acc.runs += 1;
            acc.distance += activity.distance;
            acc.time += activity.duration;
            acc.elevation += activity.elevationGain || 0;
            return acc;
        }, { runs: 0, distance: 0, time: 0, elevation: 0, pace: 0 });

        if (monthlyStats.runs > 0) {
            monthlyStats.pace = (monthlyStats.time / monthlyStats.distance);
        }

        // 7. Personal Bests (simplified for now)
        // This is complex. We'll return dummy data for now and can build this later.
        const personalBests = [
          { distance: '1k', time: 'N/A', date: null },
          { distance: '5k', time: 'N/A', date: null },
          { distance: '10k', time: 'N/A', date: null },
          { distance: 'Halvmaraton', time: 'N/A', date: null },
        ];


        res.json({
            success: true,
            data: {
                user,
                weeklyStats,
                monthlyStats,
                personalBests,
                recentActivities,
                upcomingRuns,
                challenges: challenges.map(ch => ({ // Reshape challenge data for frontend
                    id: ch._id,
                    title: ch.title,
                    progress: ch.participants.find(p => p.user.toString() === userId)?.progress.distance || 0, // Assuming distance challenge for now
                    goal: `${ch.goal.target}${ch.goal.unit}`
                }))
            }
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router; 