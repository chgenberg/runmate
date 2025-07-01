const mongoose = require('mongoose');
const RunEvent = require('../models/RunEvent');
const connectDB = require('../config/database');

const deleteAllEvents = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    console.log('⚠️  WARNING: This will delete ALL events from the database!');
    console.log('⏳ Starting deletion in 3 seconds...');
    
    // Wait 3 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete all events
    const result = await RunEvent.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} events`);
    console.log('🎉 Database is now clean and ready for new events!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('📤 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
console.log('🚨 DELETE ALL EVENTS SCRIPT');
console.log('=========================');
deleteAllEvents(); 