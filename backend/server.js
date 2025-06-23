const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const axios = require('axios');

// Import database connection
const connectDB = require('./config/database');

// Import models for scheduled tasks
const User = require('./models/User');
const Activity = require('./models/Activity');

// Import notification helpers
// const { sendNotificationToUser } = require('./routes/notifications'); // Temporarily disabled

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
// const matchingRoutes = require('./routes/matching'); // Temporarily disabled - causing crashes
const stravaRoutes = require('./routes/strava');
const challengeRoutes = require('./routes/challenges');
const activityRoutes = require('./routes/activities');
const chatRoutes = require('./routes/chat');
const runEventRoutes = require('./routes/runevents');
const dashboardRoutes = require('./routes/dashboard');
const ratingsRoutes = require('./routes/ratings');
const searchRoutes = require('./routes/search');
// const { router: notificationRoutes } = require('./routes/notifications'); // Temporarily disabled

// Import middleware
const { protect } = require('./middleware/auth');
const errorHandler = require('./middleware/error');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Trust proxy for rate limiting behind proxies (like frontend dev server)
app.set('trust proxy', 1);

// Socket.io setup for real-time features
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "https://happy-love-production.up.railway.app",
      "https://humble-radiance-production.up.railway.app",
      "https://fabulous-sparkle-production.up.railway.app",
      "https://staging-runmate-frontend-production.up.railway.app",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:3005",
      "http://localhost:3006"
    ],
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // increased to 1000 requests per windowMs for development
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for development
    return process.env.NODE_ENV === 'development';
  }
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Compression
app.use(compression());

// CORS - Temporarily allow all origins for debugging
app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RunMate API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/matching', matchingRoutes); // Temporarily disabled - causing crashes
app.use('/api/strava', stravaRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/runevents', runEventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/health', require('./routes/health'));
// app.use('/api/notifications', notificationRoutes); // Temporarily disabled

// Socket.io real-time functionality
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    socket.userId = userId;
    console.log(`User ${userId} joined their room`);
  });

  // Join chat room
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping: data.isTyping
    });
  });

  // Handle online status
  socket.on('user_online', (userId) => {
    socket.broadcast.emit('user_status_change', {
      userId,
      isOnline: true,
      lastSeen: new Date()
    });
  });

  // Handle new match notifications
  socket.on('new_match', (data) => {
    socket.to(`user_${data.recipientId}`).emit('match_notification', {
      type: 'new_match',
      matchId: data.matchId,
      user: data.user,
      timestamp: new Date()
    });
  });

  // Handle activity kudos
  socket.on('give_kudos', (data) => {
    socket.to(`user_${data.recipientId}`).emit('kudos_notification', {
      type: 'kudos',
      activityId: data.activityId,
      fromUser: data.fromUser,
      timestamp: new Date()
    });
  });

  // Handle challenge updates
  socket.on('challenge_update', (data) => {
    // Broadcast to all participants in the challenge
    data.participants.forEach(participantId => {
      socket.to(`user_${participantId}`).emit('challenge_notification', {
        type: 'challenge_update',
        challengeId: data.challengeId,
        message: data.message,
        timestamp: new Date()
      });
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.userId) {
      // Notify others that user went offline
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    }
  });
});

// Auto-sync Strava activities for all connected users every 30 minutes
const scheduleStravaSync = () => {
  setInterval(async () => {
    try {
      console.log('Running scheduled Strava sync for all users...');
      
      // Find all users with Strava connection
      const connectedUsers = await User.find({
        stravaId: { $exists: true, $ne: null },
        stravaAccessToken: { $exists: true, $ne: null }
      });
      
      console.log(`Found ${connectedUsers.length} users with Strava connection`);
      
      for (const user of connectedUsers) {
        try {
          // Check if token needs refresh
          const now = Math.floor(Date.now() / 1000);
          if (user.stravaTokenExpiresAt < now + 3600) {
            console.log(`Refreshing token for user ${user.id}`);
            const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
              client_id: process.env.STRAVA_CLIENT_ID || '165013',
              client_secret: process.env.STRAVA_CLIENT_SECRET || '1c663ec9225b652aa6dcb5d49c5c45c6aec2b80e',
              grant_type: 'refresh_token',
              refresh_token: user.stravaRefreshToken,
            });

            const { access_token, refresh_token, expires_at } = response.data;
            user.stravaAccessToken = access_token;
            user.stravaRefreshToken = refresh_token;
            user.stravaTokenExpiresAt = expires_at;
            await user.save();
          }
          
          // Fetch recent activities (last 2 hours to avoid duplicates)
          const stravaApi = axios.create({
            baseURL: 'https://www.strava.com/api/v3',
            headers: { Authorization: `Bearer ${user.stravaAccessToken}` },
          });
          
          const after = Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000); // Last 2 hours
          const response = await stravaApi.get(`/athlete/activities?after=${after}&per_page=10`);
          const activities = response.data;
          
          let syncedCount = 0;
          for (const activity of activities) {
            // Check if activity already exists
            const existingActivity = await Activity.findOne({ 
              user: user._id, 
              stravaActivityId: activity.id.toString() 
            });
            
            if (existingActivity) continue;
            
            // Map activity type
            const typeMap = {
              'Run': 'running', 'Ride': 'cycling', 'VirtualRun': 'running',
              'VirtualRide': 'cycling', 'Walk': 'running', 'Hike': 'running'
            };
            const sportType = typeMap[activity.type];
            if (!sportType) continue;
            
            // Calculate pace
            let pace = null;
            if (activity.distance > 0 && activity.moving_time > 0) {
              const speedKmh = (activity.distance / 1000) / (activity.moving_time / 3600);
              pace = speedKmh > 0 ? 60 / speedKmh : null;
            }
            
            // Create activity
            await Activity.create({
              user: user._id,
              stravaActivityId: activity.id.toString(),
              title: activity.name || `${activity.type} Activity`,
              sportType: sportType,
              distance: activity.distance / 1000,
              duration: activity.moving_time,
              date: new Date(activity.start_date),
              pace: pace,
              elevationGain: activity.total_elevation_gain || 0,
              averageHeartRate: activity.average_heartrate || null,
              maxHeartRate: activity.max_heartrate || null,
              calories: activity.calories || null,
              location: activity.location_city || activity.location_state || 'Unknown',
              map: activity.map ? { summary_polyline: activity.map.summary_polyline } : null,
              weather: { temperature: activity.average_temp || null }
            });
            syncedCount++;
          }
          
          if (syncedCount > 0) {
            console.log(`Auto-synced ${syncedCount} activities for user ${user.id}`);
          }
          
        } catch (error) {
          console.error(`Auto-sync failed for user ${user.id}:`, error.message);
        }
      }
      
      console.log('Scheduled Strava sync completed');
    } catch (error) {
      console.error('Scheduled Strava sync error:', error.message);
    }
  }, 30 * 60 * 1000); // Every 30 minutes
};

// Start scheduled sync
console.log('Starting scheduled Strava sync (every 30 minutes)...');
scheduleStravaSync();

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`RunMate server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Local network: http://192.168.1.74:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Promise Rejection: ${err.message}`);
  console.log('Stack:', err.stack);
  // Don't exit process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  console.log('Stack:', err.stack);
  // Don't exit process, just log the error
});

// Graceful shutdown - but don't automatically shut down
process.on('SIGTERM', () => {
  console.log('SIGTERM received - ignoring for now');
  // Don't shut down automatically
});

// Handle SIGINT (Ctrl+C) for manual shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received');
  console.log('Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  // ... existing code ...
}

module.exports = app; 