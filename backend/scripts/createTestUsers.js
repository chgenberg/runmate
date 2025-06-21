const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const createTestUsers = async () => {
  await connectDB();

  const testUsers = [
    {
      email: 'test@runmate.se',
      password: 'password123',
      firstName: 'Christopher',
      lastName: 'Genberg',
      dateOfBirth: new Date('1995-06-15'),
      gender: 'male',
      bio: 'Löpare från Stockholm som älskar att utforska nya rutter och träffa nya träningspartners! Tränar för mitt första maraton.',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&auto=format',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&auto=format',
      photos: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop&auto=format'
      ],
      additionalPhotos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop&auto=format'
      ],
      location: {
        city: 'Stockholm',
        country: 'Sverige',
        coordinates: [18.0686, 59.3293] // Stockholm coordinates
      },
      sportTypes: ['running'],
      activityLevel: 'serious',
      trainingStats: {
        bestTimes: {
          fiveK: 1200, // 20 minutes
          tenK: 2520, // 42 minutes
          halfMarathon: 5400 // 1h 30min
        },
        weeklyDistance: 50,
        weeklyWorkouts: 5,
        totalDistance: 2500,
        cycling: {
          weeklyDistance: 100,
          longestRide: 120,
          avgSpeed: 28,
          totalElevation: 5000
        }
      },
      trainingPreferences: {
        preferredTimes: ['morning', 'evening'],
        preferredDays: ['monday', 'wednesday', 'friday', 'saturday', 'sunday'],
        trainingTypes: ['easy-runs', 'long-runs', 'intervals', 'trail'],
        indoor: false,
        outdoor: true
      },
      matchingPreferences: {
        ageRange: { min: 22, max: 35 },
        genderPreference: ['female', 'male'],
        maxDistance: 25,
        levelRange: ['recreational', 'serious', 'competitive']
      },
      points: 2450,
      level: 5,
      badges: [
        {
          badgeId: 'first_run',
          name: 'First Run',
          description: 'Completed your first run!'
        },
        {
          badgeId: 'week_streak',
          name: 'Week Warrior',
          description: '7 days training streak'
        }
      ],
      streaks: {
        current: 7,
        longest: 14
      }
    },
    {
      email: 'anna@runmate.se',
      password: 'password123',
      firstName: 'Anna',
      lastName: 'Svensson',
      dateOfBirth: new Date('1997-03-22'),
      gender: 'female',
      bio: 'Yoga-instruktör och löpare. Älskar morgonträning och mindfulness. Tränar för mental hälsa lika mycket som fysisk!',
      profilePhoto: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop&auto=format',
      profilePicture: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop&auto=format',
      photos: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&auto=format'
      ],
      additionalPhotos: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&auto=format'
      ],
      location: {
        city: 'Stockholm',
        country: 'Sverige',
        coordinates: [18.0686, 59.3293]
      },
      sportTypes: ['running'],
      activityLevel: 'recreational',
      trainingStats: {
        bestTimes: {
          fiveK: 1380, // 23 minutes
          tenK: 2820 // 47 minutes
        },
        weeklyDistance: 25,
        weeklyWorkouts: 4,
        totalDistance: 800
      },
      trainingPreferences: {
        preferredTimes: ['early-morning', 'morning'],
        preferredDays: ['tuesday', 'thursday', 'saturday', 'sunday'],
        trainingTypes: ['easy-runs', 'long-runs', 'trail'],
        indoor: false,
        outdoor: true
      },
      matchingPreferences: {
        ageRange: { min: 25, max: 40 },
        genderPreference: ['male', 'female'],
        maxDistance: 20,
        levelRange: ['recreational', 'serious']
      },
      points: 1200,
      level: 3,
      streaks: {
        current: 4,
        longest: 8
      }
    },
    {
      email: 'marcus@runmate.se',
      password: 'password123',
      firstName: 'Marcus',
      lastName: 'Berg',
      dateOfBirth: new Date('1993-09-10'),
      gender: 'male',
      bio: 'CrossFit coach och cykel-entusiast. Älskar utmaningar och hjälper gärna andra nå sina mål!',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format',
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop&auto=format'
      ],
      location: {
        city: 'Stockholm',
        country: 'Sverige',
        coordinates: [18.0686, 59.3293]
      },
      sportTypes: ['running'],
      activityLevel: 'competitive',
      trainingStats: {
        bestTimes: {
          fiveK: 1050, // 17:30
          tenK: 2220, // 37 minutes
          halfMarathon: 4800 // 1h 20min
        },
        weeklyDistance: 80,
        weeklyWorkouts: 6,
        totalDistance: 4200,
        cycling: {
          weeklyDistance: 200,
          longestRide: 180,
          avgSpeed: 32,
          totalElevation: 12000
        }
      },
      trainingPreferences: {
        preferredTimes: ['morning', 'afternoon', 'evening'],
        preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        trainingTypes: ['intervals', 'tempo', 'hill-training', 'track'],
        indoor: true,
        outdoor: true
      },
      matchingPreferences: {
        ageRange: { min: 20, max: 35 },
        genderPreference: ['any'],
        maxDistance: 30,
        levelRange: ['serious', 'competitive', 'elite']
      },
      points: 5200,
      level: 8,
      badges: [
        {
          badgeId: 'speed_demon',
          name: 'Speed Demon',
          description: 'Sub-18 minute 5K!'
        },
        {
          badgeId: 'mountain_climber',
          name: 'Mountain Climber',
          description: '10,000m elevation gain'
        }
      ],
      streaks: {
        current: 12,
        longest: 25
      }
    },
    {
      email: 'emma@runmate.se',
      password: 'password123',
      firstName: 'Emma',
      lastName: 'Lindqvist',
      dateOfBirth: new Date('1999-12-05'),
      gender: 'female',
      bio: 'Tennisspelare som börjat med löpning för kondition. Alltid glad och motiverad!',
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&auto=format',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&auto=format',
      photos: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop&auto=format'
      ],
      location: {
        city: 'Stockholm',
        country: 'Sverige',
        coordinates: [18.0686, 59.3293]
      },
      sportTypes: ['running'],
      activityLevel: 'beginner',
      trainingStats: {
        bestTimes: {
          fiveK: 1680 // 28 minutes
        },
        weeklyDistance: 15,
        weeklyWorkouts: 3,
        totalDistance: 200
      },
      trainingPreferences: {
        preferredTimes: ['afternoon', 'evening'],
        preferredDays: ['wednesday', 'friday', 'sunday'],
        trainingTypes: ['easy-runs'],
        indoor: false,
        outdoor: true
      },
      matchingPreferences: {
        ageRange: { min: 22, max: 32 },
        genderPreference: ['female', 'male'],
        maxDistance: 15,
        levelRange: ['beginner', 'recreational']
      },
      points: 450,
      level: 2,
      streaks: {
        current: 2,
        longest: 5
      }
    }
  ];

  try {
    // Clear existing test users
    await User.deleteMany({ 
      email: { 
        $in: testUsers.map(user => user.email) 
      } 
    });

    // Create users (password will be hashed automatically by User model)
    for (let userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📧 Login credentials:');
    console.log('Email: test@runmate.se');
    console.log('Password: password123');
    console.log('\nOther test accounts:');
    console.log('- anna@runmate.se (password123)');
    console.log('- marcus@runmate.se (password123)');
    console.log('- emma@runmate.se (password123)');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createTestUsers(); 