const mongoose = require('mongoose');
const RunEvent = require('../models/RunEvent');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/runmate';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected: localhost');
}).catch(error => {
  console.error('Database connection failed:', error);
});

const testEvents = [
  {
    title: 'Morgonlöpning i Slottsskogen',
    description: 'En mysig morgonlöpning i Slottsskogen. Tempo ca 5:30/km.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    time: '07:00',
    location: {
      name: 'Slottsskogen, Göteborg',
      point: {
        type: 'Point',
        coordinates: [11.9364, 57.6799] // [longitude, latitude]
      }
    },
    distance: 8,
    pace: 330, // 5:30 in seconds
    difficulty: 'medium',
    maxParticipants: 12,
    meetupSpot: 'Vid Slottsskogens stora parkering',
    route: 'Klassiska Slottsskogen-rundan'
  },
  {
    title: 'Intervalllöpning på Säveån',
    description: 'Intervaller 4x1000m med vila. För dig som vill bli snabbare!',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    time: '18:30',
    location: {
      name: 'Säveån, Göteborg',
      point: {
        type: 'Point',
        coordinates: [12.1058, 57.7395]
      }
    },
    distance: 10,
    pace: 270, // 4:30 in seconds
    difficulty: 'hard',
    maxParticipants: 8,
    meetupSpot: 'Parkeringen vid Säveån',
    route: 'Säveåns löparspår'
  },
  {
    title: 'Långpass söndagsmys',
    description: 'Lugnt långpass i vacker natur. Perfekt för halvmaraton-träning.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    time: '09:00',
    location: {
      name: 'Delsjön, Göteborg',
      point: {
        type: 'Point',
        coordinates: [12.0247, 57.7309]
      }
    },
    distance: 18,
    pace: 360, // 6:00 in seconds
    difficulty: 'medium',
    maxParticipants: 15,
    meetupSpot: 'Delsjöns parkering',
    route: 'Runt Delsjön och Stora Delsjön'
  },
  {
    title: 'Trailrunning i Änggårdsbergen',
    description: 'Teknisk terränglöpning för äventyrslystna löpare.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    time: '10:00',
    location: {
      name: 'Änggårdsbergen, Göteborg',
      point: {
        type: 'Point',
        coordinates: [12.0392, 57.7745]
      }
    },
    distance: 12,
    pace: 390, // 6:30 in seconds
    difficulty: 'hard',
    maxParticipants: 10,
    meetupSpot: 'Änggårdsbergens entré',
    route: 'Bergsrundan'
  },
  {
    title: 'Tempo-träning i Kungsparken',
    description: 'Strukturerad tempoträning för att förbättra din uthållighet.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: '17:00',
    location: {
      name: 'Kungsparken, Göteborg',
      point: {
        type: 'Point',
        coordinates: [11.9772, 57.7089]
      }
    },
    distance: 6,
    pace: 300, // 5:00 in seconds
    difficulty: 'medium',
    maxParticipants: 20,
    meetupSpot: 'Kungsparken entré vid Götaplatsen',
    route: 'Kungsparken loop'
  }
];

const createTestEvents = async () => {
  try {
    // Get test users to assign as hosts
    const users = await User.find({ email: { $regex: /@runmate\.se$/ } }).limit(5);
    
    if (users.length === 0) {
      console.log('No test users found. Run createTestUsers.js first.');
      return;
    }

    // Clear existing test events
    await RunEvent.deleteMany({ 
      host: { $in: users.map(u => u._id) }
    });

    for (let i = 0; i < testEvents.length; i++) {
      const eventData = testEvents[i];
      const host = users[i % users.length]; // Rotate through available users

      const event = new RunEvent({
        ...eventData,
        host: host._id,
        participants: [host._id], // Host automatically participates
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await event.save();
      console.log(`✅ Created event: ${event.title}`);
    }

    console.log('\n🎉 Test events created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test events:', error);
    process.exit(1);
  }
};

createTestEvents(); 