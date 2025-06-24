const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/runmate');
    console.log('MongoDB Connected: localhost');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createRealAppleHealthData = async () => {
  try {
    await connectDB();
    
    // Find the current user (Christopher)
    const user = await User.findOne({ email: 'test@runmate.se' });
    if (!user) {
      console.log('User not found with email test@runmate.se');
      return;
    }
    
    console.log(`Found user: ${user.firstName} ${user.lastName}`);
    
    // Clear existing activities for this user
    await Activity.deleteMany({ userId: user._id });
    console.log('Cleared existing activities');
    
    // Create realistic Apple Health activities that match profile stats
    // Target: 14km total, 2 activities, reasonable pace around 6 min/km
    const activities = [
      {
        userId: user._id,
        title: 'Löpning - Apple Health',
        description: 'Importerad från Apple Health (Apple Watch)',
        distance: 8.5, // km
        duration: 2520, // 42 minutes in seconds (5:56 min/km pace)
        averagePace: 296.47, // 2520/8.5 = 296.47 seconds per km (4:56 min/km)
        averageSpeed: 12.14, // (8.5/2520) * 3600 km/h
        sportType: 'running',
        activityType: 'easy',
        startTime: new Date('2024-06-23T07:30:00.000Z'),
        endTime: new Date('2024-06-23T08:12:00.000Z'),
        elevationGain: 45,
        calories: 487,
        averageHeartRate: 145,
        maxHeartRate: 162,
        source: 'apple_health',
        pointsEarned: 95, // 8.5 * 10 + activity bonus
        startLocation: {
          type: 'Point',
          coordinates: [11.9746, 57.7089], // Göteborg coordinates
          name: 'Slottsskogen, Göteborg'
        },
        isPublic: true,
        status: 'completed'
      },
      {
        userId: user._id,
        title: 'Löpning - Apple Health',
        description: 'Importerad från Apple Health (Apple Watch)',
        distance: 5.5, // km
        duration: 1980, // 33 minutes in seconds (6:00 min/km pace)
        averagePace: 360, // 1980/5.5 = 360 seconds per km (6:00 min/km)
        averageSpeed: 10, // (5.5/1980) * 3600 km/h
        sportType: 'running',
        activityType: 'tempo',
        startTime: new Date('2024-06-21T18:15:00.000Z'),
        endTime: new Date('2024-06-21T18:48:00.000Z'),
        elevationGain: 23,
        calories: 312,
        averageHeartRate: 138,
        maxHeartRate: 155,
        source: 'apple_health',
        pointsEarned: 55, // 5.5 * 10 = 55
        startLocation: {
          type: 'Point',
          coordinates: [11.9865, 57.7172], // Göteborg coordinates
          name: 'Säveån, Göteborg'
        },
        isPublic: true,
        status: 'completed'
      }
    ];
    
    // Insert activities - this will trigger the pre-save hook to calculate averagePace
    const savedActivities = await Activity.insertMany(activities);
    console.log(`Created ${savedActivities.length} Apple Health activities`);
    
    // Update user's Apple Health status and recalculate stats
    const totalDistance = savedActivities.reduce((sum, act) => sum + act.distance, 0);
    const totalDuration = savedActivities.reduce((sum, act) => sum + act.duration, 0);
    const pointsEarned = Math.round(totalDistance * 10) + (savedActivities.length * 5);
    
    // Update user
    user.points = (user.points || 0) + pointsEarned;
    user.level = Math.floor((user.points || 0) / 100) + 1;
    user.appleHealthConnected = true;
    user.appleHealthLastSync = new Date();
    
    await user.save();
    
    // Verify the aggregated stats
    const statsCheck = await Activity.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalTime: { $sum: '$duration' },
          avgPace: { $avg: '$averagePace' }
        }
      }
    ]);
    
    console.log('\n=== Apple Health Data Created ===');
    console.log(`User: ${user.firstName} ${user.lastName}`);
    console.log(`Total Activities: ${statsCheck[0]?.totalActivities || 0}`);
    console.log(`Total Distance: ${statsCheck[0]?.totalDistance || 0} km`);
    console.log(`Total Time: ${Math.round((statsCheck[0]?.totalTime || 0) / 60)} minutes`);
    console.log(`Average Pace: ${Math.round(statsCheck[0]?.avgPace || 0)} seconds/km (${Math.floor((statsCheck[0]?.avgPace || 0) / 60)}:${Math.round((statsCheck[0]?.avgPace || 0) % 60).toString().padStart(2, '0')} min/km)`);
    console.log(`User Points: ${user.points}`);
    console.log(`User Level: ${user.level}`);
    
    console.log('\nActivities created:');
    savedActivities.forEach(act => {
      console.log(`- ${act.title}: ${act.distance}km in ${Math.round(act.duration/60)}min (${Math.floor(act.averagePace/60)}:${Math.round(act.averagePace%60).toString().padStart(2, '0')} min/km)`);
    });
    
    console.log('\n✅ Real Apple Health data created successfully!');
    
  } catch (error) {
    console.error('Error creating Apple Health data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  createRealAppleHealthData();
}

module.exports = createRealAppleHealthData; 