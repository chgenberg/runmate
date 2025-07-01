const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const deleteAllUsers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    console.log('⚠️  WARNING: This will delete ALL users from the database!');
    console.log('⏳ Starting deletion in 3 seconds...');
    
    // Wait 3 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete all users
    const result = await User.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} users`);
    console.log('🎉 Database is now clean and ready for new users!');
    
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
console.log('🚨 DELETE ALL USERS SCRIPT');
console.log('========================');
deleteAllUsers(); 