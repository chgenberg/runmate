const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/runmate';
    console.log('DEBUG: MONGODB_URI environment variable:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('DEBUG: Using MongoDB URI:', mongoUri.substring(0, 50) + '...');
    
    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 