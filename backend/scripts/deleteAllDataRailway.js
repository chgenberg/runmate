const mongoose = require('mongoose');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const RunEvent = require('../models/RunEvent');
const Activity = require('../models/Activity');
const Chat = require('../models/Chat');

const deleteAllDataRailway = async () => {
  try {
    // Railway MongoDB URI
    const RAILWAY_MONGODB_URI = process.env.RAILWAY_MONGODB_URI || process.env.MONGODB_URI;
    
    if (!RAILWAY_MONGODB_URI) {
      console.error('❌ RAILWAY_MONGODB_URI eller MONGODB_URI environment variable saknas!');
      console.log('🔧 För att få Railway MongoDB URI:');
      console.log('1. Gå till Railway Dashboard');
      console.log('2. Välj ditt projekt');
      console.log('3. Gå till Variables');
      console.log('4. Kopiera MONGODB_URI värdet');
      console.log('5. Kör: MONGODB_URI="din-uri-här" node scripts/deleteAllDataRailway.js');
      process.exit(1);
    }
    
    console.log('🚨 DELETE ALL DATA FROM RAILWAY DATABASE');
    console.log('========================================');
    console.log('🔄 Connecting to Railway MongoDB...');
    console.log('📡 URI:', RAILWAY_MONGODB_URI.substring(0, 50) + '...');
    
    await mongoose.connect(RAILWAY_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to Railway MongoDB!');
    console.log('⚠️  WARNING: This will delete ALL DATA from Railway database!');
    console.log('⚠️  Including: Users, Challenges, Events, Activities, Chat messages');
    console.log('⏳ Starting deletion in 10 seconds...');
    
    // Wait 10 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('🧹 Starting cleanup...\n');
    
    // Delete all data in order
    const userResult = await User.deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} users`);
    
    const challengeResult = await Challenge.deleteMany({});
    console.log(`✅ Deleted ${challengeResult.deletedCount} challenges`);
    
    const eventResult = await RunEvent.deleteMany({});
    console.log(`✅ Deleted ${eventResult.deletedCount} events`);
    
    const activityResult = await Activity.deleteMany({});
    console.log(`✅ Deleted ${activityResult.deletedCount} activities`);
    
    try {
      const chatResult = await Chat.deleteMany({});
      console.log(`✅ Deleted ${chatResult.deletedCount} chat messages`);
    } catch (error) {
      console.log('⚠️  Chat collection not found or already empty');
    }
    
    console.log('\n🎉 Railway database is completely clean!');
    console.log('📊 Summary:');
    console.log(`   Users: ${userResult.deletedCount}`);
    console.log(`   Challenges: ${challengeResult.deletedCount}`);
    console.log(`   Events: ${eventResult.deletedCount}`);
    console.log(`   Activities: ${activityResult.deletedCount}`);
    console.log('\n🚀 Ready for fresh data!');
    
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
deleteAllDataRailway(); 