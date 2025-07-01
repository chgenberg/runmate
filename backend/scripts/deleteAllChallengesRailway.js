const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');

const deleteAllChallengesRailway = async () => {
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
      console.log('5. Kör: MONGODB_URI="din-uri-här" node scripts/deleteAllChallengesRailway.js');
      process.exit(1);
    }
    
    console.log('🚨 DELETE ALL CHALLENGES FROM RAILWAY DATABASE');
    console.log('===============================================');
    console.log('🔄 Connecting to Railway MongoDB...');
    
    await mongoose.connect(RAILWAY_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to Railway MongoDB!');
    console.log('⚠️  WARNING: This will delete ALL challenges from Railway database!');
    console.log('⏳ Starting deletion in 5 seconds...');
    
    // Wait 5 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Delete all challenges
    const result = await Challenge.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} challenges from Railway`);
    console.log('🎉 Railway database is now clean and ready for new challenges!');
    
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
deleteAllChallengesRailway(); 