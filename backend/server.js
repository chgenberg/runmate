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

// Import database connection
const connectDB = require('./config/database');

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
      "https://fabulous-sparkle-production.up.railway.app",
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