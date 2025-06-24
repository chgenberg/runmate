const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const createRealUsers = async () => {
  await connectDB();

  const realUsers = [
    {
      email: 'anna.karlsson@gmail.com',
      password: 'password123',
      firstName: 'Anna',
      lastName: 'Karlsson',
      dateOfBirth: new Date('1992-03-15'),
      gender: 'female',
      bio: 'Löpning är mitt sätt att koppla av efter långa dagar på jobbet. Jobbar som marknadsförare i Stockholm och springer gärna längs Långholmen på helgerna. Tränar för Stockholms Halvmarathon 2024!',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&auto=format',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&auto=format',
      photos: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop&auto=format'
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
          fiveK: 1320, // 22 minuter
          tenK: 2760, // 46 minuter
          halfMarathon: 6000 // 1h 40min
        },
        weeklyDistance: 30,
        weeklyWorkouts: 4,
        totalDistance: 1250
      },
      trainingPreferences: {
        preferredTimes: ['morning', 'evening'],
        preferredDays: ['tuesday', 'thursday', 'saturday', 'sunday'],
        trainingTypes: ['easy-runs', 'long-runs'],
        indoor: false,
        outdoor: true
      },
      matchingPreferences: {
        ageRange: { min: 25, max: 38 },
        genderPreference: ['female', 'male'],
        maxDistance: 25,
        levelRange: ['recreational', 'serious']
      },
      points: 1450,
      level: 4,
      streaks: {
        current: 6,
        longest: 12
      }
    },
    {
      email: 'erik.andersson@hotmail.com',
      password: 'password123',
      firstName: 'Erik',
      lastName: 'Andersson',
      dateOfBirth: new Date('1988-07-22'),
      gender: 'male',
      bio: 'Före detta fotbollsspelare som hittat kärleken i löpning. Bor i Göteborg och springer helst tidigt på morgonen innan jobbet. Älskar intervaller och att pusha mina gränser!',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format',
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&auto=format'
      ],
      location: {
        city: 'Göteborg',
        country: 'Sverige',
        coordinates: [11.9746, 57.7089]
      },
      sportTypes: ['running'],
      activityLevel: 'serious',
      trainingStats: {
        bestTimes: {
          fiveK: 1140, // 19 minuter
          tenK: 2460, // 41 minuter
          halfMarathon: 5220 // 1h 27min
        },
        weeklyDistance: 55,
        weeklyWorkouts: 5,
        totalDistance: 2890
      },
      trainingPreferences: {
        preferredTimes: ['early-morning', 'morning'],
        preferredDays: ['monday', 'tuesday', 'wednesday', 'friday', 'saturday'],
        trainingTypes: ['intervals', 'tempo', 'long-runs'],
        indoor: true,
        outdoor: true
      },
      matchingPreferences: {
        ageRange: { min: 22, max: 40 },
        genderPreference: ['any'],
        maxDistance: 30,
        levelRange: ['recreational', 'serious', 'competitive']
      },
      points: 2890,
      level: 6,
      badges: [
        {
          badgeId: 'sub20_5k',
          name: 'Sub 20 5K',
          description: 'Sprang 5K under 20 minuter!'
        }
      ],
      streaks: {
        current: 15,
        longest: 23
      }
    },
    {
      email: 'sara.lindqvist@yahoo.se',
      password: 'password123',
      firstName: 'Sara',
      lastName: 'Lindqvist',
      dateOfBirth: new Date('1995-11-08'),
      gender: 'female',
      bio: 'Naturälskare som springer för att utforska Sveriges vackra natur. Bor i Malmö men reser gärna för att hitta nya löpspår. Trail running är mitt hjärta! 🌲',
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format',
      photos: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&auto=format'
      ],
      location: {
        city: 'Malmö',
        country: 'Sverige',
        coordinates: [13.0038, 55.6050]
      },
      sportTypes: ['running'],
      activityLevel: 'recreational',
      trainingStats: {
        bestTimes: {
          fiveK: 1500, // 25 minuter
          tenK: 3180, // 53 minuter
        },
        weeklyDistance: 25,
        weeklyWorkouts: 3,
        totalDistance: 680
      },
      trainingPreferences: {
        preferredTimes: ['afternoon', 'evening'],
        preferredDays: ['wednesday', 'saturday', 'sunday'],
        trainingTypes: ['trail', 'easy-runs', 'long-runs'],
        indoor: false,
        outdoor: true
      },
      matchingPreferences: {
        ageRange: { min: 24, max: 35 },
        genderPreference: ['female', 'male'],
        maxDistance: 20,
        levelRange: ['beginner', 'recreational']
      },
      points: 780,
      level: 3,
      streaks: {
        current: 3,
        longest: 8
      }
    },
    {
      email: 'johan.nilsson@live.se',
      password: 'password123',
      firstName: 'Johan',
      lastName: 'Nilsson',
      dateOfBirth: new Date('1985-01-30'),
      gender: 'male',
      bio: 'Pappa till två som springer för att hålla mig i form och få lite "me-time". Jobbar som ingenjör i Uppsala. Målet är att springa ett maraton innan jag fyller 40!',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format',
      photos: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format'
      ],
      location: {
        city: 'Uppsala',
        country: 'Sverige',
        coordinates: [17.6389, 59.8586]
      },
      sportTypes: ['running'],
      activityLevel: 'serious',
      trainingStats: {
        bestTimes: {
          fiveK: 1260, // 21 minuter
          tenK: 2640, // 44 minuter
          halfMarathon: 5700 // 1h 35min
        },
        weeklyDistance: 40,
        weeklyWorkouts: 4,
        totalDistance: 1890
      },
      trainingPreferences: {
        preferredTimes: ['early-morning'],
        preferredDays: ['tuesday', 'thursday', 'saturday', 'sunday'],
        trainingTypes: ['easy-runs', 'long-runs', 'tempo'],
        indoor: false,
        outdoor: true
      },
      matchingPreferences: {
        ageRange: { min: 28, max: 45 },
        genderPreference: ['male'],
        maxDistance: 15,
        levelRange: ['recreational', 'serious']
      },
      points: 1920,
      level: 5,
      streaks: {
        current: 8,
        longest: 16
      }
    },
    {
      email: 'emma.svensson@outlook.com',
      password: 'password123',
      firstName: 'Emma',
      lastName: 'Svensson',
      dateOfBirth: new Date('1997-05-14'),
      gender: 'female',
      bio: 'Student i Lund som började springa för två år sedan och blev helt kär! Älskar att springa med musik och utforska nya rutter runt universitetet. Alltid positiv och peppad! 🎵',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&auto=format',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&auto=format',
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&auto=format'
      ],
      location: {
        city: 'Lund',
        country: 'Sverige',
        coordinates: [13.1931, 55.7047]
      },
      sportTypes: ['running'],
      activityLevel: 'beginner',
      trainingStats: {
        bestTimes: {
          fiveK: 1620, // 27 minuter
          tenK: 3420, // 57 minuter
        },
        weeklyDistance: 20,
        weeklyWorkouts: 3,
        totalDistance: 320
      },
      trainingPreferences: {
        preferredTimes: ['afternoon', 'evening'],
        preferredDays: ['monday', 'wednesday', 'friday'],
        trainingTypes: ['easy-runs'],
        indoor: false,
        outdoor: true
      },
      matchingPreferences: {
        ageRange: { min: 20, max: 30 },
        genderPreference: ['female', 'male'],
        maxDistance: 10,
        levelRange: ['beginner', 'recreational']
      },
      points: 420,
      level: 2,
      streaks: {
        current: 4,
        longest: 7
      }
    }
  ];

  try {
    // Ta bort befintliga användare med samma email
    const emails = realUsers.map(user => user.email);
    await User.deleteMany({ 
      email: { $in: emails }
    });

    // Skapa användarna
    for (let userData of realUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Skapade användare: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }

    console.log('\n🎉 5 äkta användarprofiler skapade!');
    console.log('\n📧 Inloggningsuppgifter (alla använder lösenord: password123):');
    console.log('1. anna.karlsson@gmail.com - Anna Karlsson (Stockholm, Recreational)');
    console.log('2. erik.andersson@hotmail.com - Erik Andersson (Göteborg, Serious)');
    console.log('3. sara.lindqvist@yahoo.se - Sara Lindqvist (Malmö, Recreational)');
    console.log('4. johan.nilsson@live.se - Johan Nilsson (Uppsala, Serious)');
    console.log('5. emma.svensson@outlook.com - Emma Svensson (Lund, Beginner)');

  } catch (error) {
    console.error('❌ Fel vid skapande av användare:', error);
  } finally {
    mongoose.connection.close();
  }
};

createRealUsers(); 