const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const connectDB = require('../config/database');

const deleteAllChallenges = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    console.log('⚠️  WARNING: This will delete ALL challenges from the database!');
    console.log('⏳ Starting deletion in 3 seconds...');
    
    // Wait 3 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete all challenges
    const result = await Challenge.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} challenges`);
    console.log('🎉 Database is now clean and ready for new challenges!');
    
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
console.log('🚨 DELETE ALL CHALLENGES SCRIPT');
console.log('==============================');
deleteAllChallenges(); 