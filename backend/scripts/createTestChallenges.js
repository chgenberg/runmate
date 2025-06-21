const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/runmate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const createTestChallenges = async () => {
  await connectDB();

  try {
    // Get some users to be creators
    const users = await User.find().limit(4);
    if (users.length === 0) {
      console.log('❌ No users found. Please run createTestUsers.js first.');
      return;
    }

    const testChallenges = [
      {
        title: 'Maraton på 30 dagar',
        description: 'Kör totalt 42.2 km under november månad. Dela upp det som du vill!',
        type: 'distance',
        goal: {
          target: 42.2,
          unit: 'km',
          isCollective: false
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        creator: users[0]._id,
        participants: [
          { user: users[0]._id, progress: { distance: 27.3 } },
          { user: users[1]._id, progress: { distance: 15.8 } },
          { user: users[2]._id, progress: { distance: 22.1 } }
        ],
        maxParticipants: 50,
        visibility: 'public',
        status: 'active',
        allowedActivityTypes: ['running']
      },
      {
        title: '1000 meter höjdmeter',
        description: 'Samla 1000 meter i höjdmeter genom löpning eller cykling.',
        type: 'elevation',
        goal: {
          target: 1000,
          unit: 'meters',
          isCollective: true
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        creator: users[1]._id,
        participants: [
          { user: users[1]._id, progress: { elevation: 450 } },
          { user: users[3]._id, progress: { elevation: 320 } }
        ],
        maxParticipants: 30,
        visibility: 'public',
        status: 'active',
        totalProgress: { elevation: 770 },
        allowedActivityTypes: ['running', 'cycling']
      },
      {
        title: '7 dagars streak',
        description: 'Spring minst 3km varje dag i en vecka. Missa inte en dag!',
        type: 'custom',
        goal: {
          target: 7,
          unit: 'activities',
          isCollective: false
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        creator: users[2]._id,
        participants: [
          { user: users[0]._id, progress: { activities: 3 } },
          { user: users[1]._id, progress: { activities: 2 } },
          { user: users[2]._id, progress: { activities: 3 } },
          { user: users[3]._id, progress: { activities: 4 } }
        ],
        maxParticipants: 100,
        visibility: 'public',
        status: 'active',
        allowedActivityTypes: ['running']
      },
      {
        title: 'Sub-20 5K',
        description: 'Spring 5 kilometer under 20 minuter innan årets slut.',
        type: 'custom',
        goal: {
          target: 1200, // 20 minutes in seconds
          unit: 'time',
          isCollective: false,
          winCondition: 'first_to_complete'
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        creator: users[3]._id,
        participants: [
          { user: users[1]._id, progress: { time: 0 } },
          { user: users[3]._id, progress: { time: 0 } }
        ],
        maxParticipants: 20,
        visibility: 'public',
        status: 'active',
        allowedActivityTypes: ['running']
      },
      {
        title: '100 timmar träning',
        description: 'Logga 100 timmar träning totalt. All typ av träning räknas!',
        type: 'time',
        goal: {
          target: 360000, // 100 hours in seconds
          unit: 'time',
          isCollective: true
        },
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        creator: users[0]._id,
        participants: users.map(u => ({ user: u._id, progress: { time: 45000 + Math.random() * 20000 } })),
        maxParticipants: 75,
        visibility: 'public',
        status: 'active',
        totalProgress: { time: 187200 }, // 52 hours
        allowedActivityTypes: ['running', 'cycling', 'walking', 'swimming', 'other']
      },
      {
        title: 'Oktober Marathon Challenge',
        description: 'Avslutad utmaning - Spring ett helt maraton under oktober.',
        type: 'distance',
        goal: {
          target: 42.195,
          unit: 'km',
          isCollective: false
        },
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        creator: users[1]._id,
        participants: [
          { user: users[0]._id, progress: { distance: 42.195 } },
          { user: users[1]._id, progress: { distance: 42.195 } }
        ],
        maxParticipants: 40,
        visibility: 'public',
        status: 'completed',
        allowedActivityTypes: ['running']
      }
    ];

    // Clear existing challenges
    await Challenge.deleteMany({});

    // Create challenges
    for (let challengeData of testChallenges) {
      const challenge = new Challenge(challengeData);
      await challenge.save();
      console.log(`✅ Created challenge: ${challengeData.title}`);
    }

    console.log('\n🎉 Test challenges created successfully!');

  } catch (error) {
    console.error('❌ Error creating test challenges:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createTestChallenges(); 