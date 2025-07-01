const mongoose = require('mongoose');
const Chat = require('../models/Chat');

const deleteAllChatsRailway = async () => {
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
      console.log('5. Kör: MONGODB_URI="din-uri-här" node scripts/deleteAllChatsRailway.js');
      process.exit(1);
    }
    
    console.log('💬 DELETE ALL CHATS FROM RAILWAY DATABASE');
    console.log('==========================================');
    console.log('🔄 Connecting to Railway MongoDB...');
    console.log('📡 URI:', RAILWAY_MONGODB_URI.substring(0, 50) + '...');
    
    await mongoose.connect(RAILWAY_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to Railway MongoDB!');
    console.log('⚠️  WARNING: This will delete ALL CHATS from Railway database!');
    console.log('⏳ Starting deletion in 3 seconds...');
    
    // Wait 3 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🧹 Deleting all chats...\n');
    
    // Delete all chats
    try {
      const chatResult = await Chat.deleteMany({});
      console.log(`✅ Deleted ${chatResult.deletedCount} chat messages from Railway database`);
    } catch (error) {
      console.log('⚠️  Chat collection not found or already empty');
    }
    
    console.log('\n🎉 All chats deleted from Railway database!');
    console.log('🚀 Users can now start fresh conversations!');
    
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
deleteAllChatsRailway(); 