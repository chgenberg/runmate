const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/runmate';
    console.log('DEBUG: MONGODB_URI environment variable:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('DEBUG: Using MongoDB URI:', mongoUri.substring(0, 50) + '...');
    
    // Stable connection options that work with Railway
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds - back to more generous timeout
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000
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