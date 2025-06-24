const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/runmate';
    console.log('DEBUG: MONGODB_URI environment variable:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('DEBUG: Using MongoDB URI:', mongoUri.substring(0, 50) + '...');
    
    // Railway-optimized connection options
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increase timeout for Railway
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionRetryDelay: 5000, // Keep trying to send operations for 5 seconds
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
      bufferMaxEntries: 0 // Disable mongoose buffering
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Set global flag for successful connection
    global.dbConnected = true;
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      global.dbConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      global.dbConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
      global.dbConnected = true;
    });

  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Full error:', error);
    global.dbConnected = false;
    
    throw error; // Re-throw to let caller handle
  }
};

module.exports = connectDB; 