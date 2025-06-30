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
const path = require('path');
const fs = require('fs');

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

console.log('=== RunMate Backend Starting ===');
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Railway Environment:', process.env.RAILWAY_ENVIRONMENT || 'not detected');
console.log('Port:', process.env.PORT || 8000);

// Connect to database with retry logic
const connectWithRetry = async () => {
  try {
    await connectDB();
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    
    // Retry after 5 seconds in any environment
    console.log('Retrying database connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Start database connection
connectWithRetry();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://staging-rummate-frontend-production.up.railway.app',
      'https://staging-runmate-frontend-production.up.railway.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

console.log('✓ Security middleware loaded');

// Trust proxy for Railway
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://staging-rummate-frontend-production.up.railway.app',
    'https://staging-runmate-frontend-production.up.railway.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

console.log('✓ CORS configured');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

console.log('✓ Rate limiting configured');

// Compression middleware
app.use(compression());

console.log('✓ Compression enabled');

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log('✓ Body parsing configured');

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

console.log('✓ Logging configured');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const photosDir = path.join(uploadsDir, 'photos');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory');
}

if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
  console.log('✓ Created uploads/photos directory');
}

// Static files
app.use('/uploads', express.static('uploads'));

console.log('✓ Static files configured');

// Health check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    success: true,
    message: 'RunMate API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    railway: process.env.RAILWAY_ENVIRONMENT || 'not detected'
  });
});

console.log('✓ Health check endpoint configured');

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

console.log('✓ Socket.IO middleware configured');

// API Routes
console.log('Loading API routes...');
try {
  app.use('/api/auth', authRoutes);
  console.log('✓ Auth routes loaded');
  
  app.use('/api/users', userRoutes);
  console.log('✓ User routes loaded');
  
  // app.use('/api/matching', matchingRoutes); // Temporarily disabled - causing crashes
  
  app.use('/api/strava', stravaRoutes);
  console.log('✓ Strava routes loaded');
  
  app.use('/api/challenges', challengeRoutes);
  console.log('✓ Challenge routes loaded');
  
  app.use('/api/activities', activityRoutes);
  console.log('✓ Activity routes loaded');
  
  app.use('/api/chat', chatRoutes);
  console.log('✓ Chat routes loaded');
  
  app.use('/api/runevents', runEventRoutes);
  console.log('✓ Run event routes loaded');
  
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✓ Dashboard routes loaded');
  
  app.use('/api/ratings', ratingsRoutes);
  console.log('✓ Rating routes loaded');
  
  app.use('/api/search', searchRoutes);
  console.log('✓ Search routes loaded');
  
  app.use('/api/integrations', require('./routes/integrations'));
  console.log('✓ Integration routes loaded');
  
  app.use('/api/health', require('./routes/health'));
  console.log('✓ Health routes loaded');
  
  app.use('/api/community', require('./routes/community'));
  console.log('✓ Community routes loaded');
  
  app.use('/api/debug', require('./routes/debug'));
  console.log('✓ Debug routes loaded');
  
  app.use('/api/aicoach', require('./routes/aicoach'));
  console.log('✓ AI Coach routes loaded');
  
  app.use('/api/routes', require('./routes/routes'));
  console.log('✓ Routes API loaded');
  
  app.use('/api/races', require('./routes/races'));
  console.log('✓ Races API loaded');
  
  // app.use('/api/notifications', notificationRoutes); // Temporarily disabled
  
  console.log('✓ All API routes loaded successfully');
} catch (routeError) {
  console.error('✗ Error loading routes:', routeError.message);
  console.error('Route error stack:', routeError.stack);
  process.exit(1);
}

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

  // Join community room
  socket.on('join_room', (roomId) => {
    socket.join(`room_${roomId}`);
    console.log(`User ${socket.userId} joined community room ${roomId}`);
  });

  // Leave community room
  socket.on('leave_room', (roomId) => {
    socket.leave(`room_${roomId}`);
    console.log(`User ${socket.userId} left community room ${roomId}`);
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

console.log('Starting server...');
console.log('Port configuration:', PORT);
console.log('Environment:', process.env.NODE_ENV || 'development');

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 RunMate server successfully started!');
  console.log(`✓ Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`✓ API URL: http://localhost:${PORT}/api`);
  console.log(`✓ Local network: http://192.168.1.74:${PORT}/api`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log('✓ Railway deployment detected - server ready for health checks');
  }
}).on('error', (err) => {
  console.error('✗ Server startup error:', err.message);
  console.error('Full error:', err);
  process.exit(1);
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