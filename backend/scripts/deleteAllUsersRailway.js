const mongoose = require('mongoose');
const User = require('../models/User');

const deleteAllUsersRailway = async () => {
  try {
    // Railway MongoDB URI - använd din Railway MongoDB connection string här
    const RAILWAY_MONGODB_URI = process.env.RAILWAY_MONGODB_URI || process.env.MONGODB_URI;
    
    if (!RAILWAY_MONGODB_URI) {
      console.error('❌ RAILWAY_MONGODB_URI eller MONGODB_URI environment variable saknas!');
      console.log('🔧 För att få Railway MongoDB URI:');
      console.log('1. Gå till Railway Dashboard');
      console.log('2. Välj ditt projekt');
      console.log('3. Gå till Variables');
      console.log('4. Kopiera MONGODB_URI värdet');
      console.log('5. Kör: MONGODB_URI="din-uri-här" node scripts/deleteAllUsersRailway.js');
      process.exit(1);
    }
    
    console.log('🚨 DELETE ALL USERS FROM RAILWAY DATABASE');
    console.log('==========================================');
    console.log('🔄 Connecting to Railway MongoDB...');
    console.log('📡 URI:', RAILWAY_MONGODB_URI.substring(0, 50) + '...');
    
    await mongoose.connect(RAILWAY_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to Railway MongoDB!');
    console.log('⚠️  WARNING: This will delete ALL users from Railway database!');
    console.log('⏳ Starting deletion in 5 seconds...');
    
    // Wait 5 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Delete all users
    const result = await User.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} users from Railway`);
    console.log('🎉 Railway database is now clean and ready for new users!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('📤 Railway database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
deleteAllUsersRailway(); 