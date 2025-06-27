const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Railway production database eller lokal
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/runmate';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected:', mongoURI.includes('mongodb+srv') ? 'Railway Cloud' : 'localhost');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Svenska städer och regioner för realistisk data
const swedishLocations = [
  { city: 'Stockholm', region: 'Stockholm', lat: 59.3293, lng: 18.0686 },
  { city: 'Göteborg', region: 'Västra Götaland', lat: 57.7089, lng: 11.9746 },
  { city: 'Malmö', region: 'Skåne', lat: 55.6050, lng: 13.0038 },
  { city: 'Uppsala', region: 'Uppsala', lat: 59.8586, lng: 17.6389 },
  { city: 'Västerås', region: 'Västmanland', lat: 59.6162, lng: 16.5528 },
  { city: 'Örebro', region: 'Örebro', lat: 59.2741, lng: 15.2066 },
  { city: 'Linköping', region: 'Östergötland', lat: 58.4108, lng: 15.6214 },
  { city: 'Helsingborg', region: 'Skåne', lat: 56.0465, lng: 12.6945 },
  { city: 'Jönköping', region: 'Småland', lat: 57.7826, lng: 14.1618 },
  { city: 'Norrköping', region: 'Östergötland', lat: 58.5877, lng: 16.1924 },
  { city: 'Lund', region: 'Skåne', lat: 55.7047, lng: 13.1910 },
  { city: 'Umeå', region: 'Västerbotten', lat: 63.8258, lng: 20.2630 },
  { city: 'Gävle', region: 'Gävleborg', lat: 60.6749, lng: 17.1413 },
  { city: 'Borås', region: 'Västra Götaland', lat: 57.7210, lng: 12.9401 },
  { city: 'Eskilstuna', region: 'Södermanland', lat: 59.3706, lng: 16.5077 },
];

// Realistiska svenska namn
const swedishNames = {
  male: [
    { first: 'Erik', last: 'Andersson' },
    { first: 'Lars', last: 'Johansson' },
    { first: 'Karl', last: 'Karlsson' },
    { first: 'Anders', last: 'Nilsson' },
    { first: 'Johan', last: 'Eriksson' },
    { first: 'Nils', last: 'Larsson' },
    { first: 'Per', last: 'Olsson' },
    { first: 'Magnus', last: 'Persson' },
    { first: 'Mikael', last: 'Svensson' },
    { first: 'Daniel', last: 'Gustafsson' },
    { first: 'Alexander', last: 'Pettersson' },
    { first: 'Gustav', last: 'Jonsson' },
    { first: 'Viktor', last: 'Jansson' },
    { first: 'Oscar', last: 'Hansson' },
    { first: 'Filip', last: 'Bengtsson' },
  ],
  female: [
    { first: 'Anna', last: 'Andersson' },
    { first: 'Emma', last: 'Johansson' },
    { first: 'Maria', last: 'Karlsson' },
    { first: 'Sara', last: 'Nilsson' },
    { first: 'Linda', last: 'Eriksson' },
    { first: 'Lena', last: 'Larsson' },
    { first: 'Karin', last: 'Olsson' },
    { first: 'Susanne', last: 'Persson' },
    { first: 'Jenny', last: 'Svensson' },
    { first: 'Malin', last: 'Gustafsson' },
    { first: 'Johanna', last: 'Pettersson' },
    { first: 'Elin', last: 'Jonsson' },
    { first: 'Sofia', last: 'Jansson' },
    { first: 'Ida', last: 'Hansson' },
    { first: 'Maja', last: 'Bengtsson' },
  ]
};

// Realistiska löparbeskrivningar på svenska
const runnerBios = [
  'Springer för att hålla mig i form och rensa huvudet. Älskar morgonlöpning!',
  'Maratonlöpare med passion för långdistans. Tränar för Boston Marathon 2025.',
  'Nybörjare som precis upptäckt löpningens glädje. Söker träningspartners!',
  'Trail runner som föredrar skogsstigar framför asfalt. Naturen är mitt gym.',
  'Före detta fotbollsspelare som övergick till löpning. Älskar intervaller.',
  'Löpning är min meditation. Springer 5-6 gånger i veckan, alla distanser.',
  'Deltog i Göteborg Varvet 3 år i rad. Siktar på sub-1:30 i halvmaraton.',
  'Ultrarunner som tränar för Lidingöloppet. Längre är bättre!',
  'Springer mest för det sociala. Träning blir roligare tillsammans!',
  'Tempolöpning är min favorit. Pushar gränser varje träningspass.',
  'Kombinerar löpning med styrketräning. Balans är nyckeln till framgång.',
  'Löpcoach som hjälper andra nå sina mål. Dela kunskap och inspiration!',
  'Återhämtar mig från skada men kommer tillbaka starkare än någonsin.',
  'Parkrun-entusiast! Lördagsmys = 5km på tid med nya vänner.',
  'Springer för välgörenhet. Varje kilometer gör skillnad för andra.',
  'Teknisk löpare som analyserar varje pass. Data driver prestation.',
  'Familjelöpare som tränar tidigt på morgonen innan familjen vaknar.',
  'Vinterløpare som inte låter väder stoppa träningen. Dubb och reflex!',
  'Minimalstlöpare som springer barfota när det är möjligt. Less is more.',
  'Löpning + kaffe = perfekt kombination. Fika efter varje långpass!',
  'Nattlöpare som älskar tomma gator och stjärnklar himmel.',
  'Bergslöpare från norra Sverige. Backar är bara tillfällen att bli starkare.',
  'Löpning hjälper mig hantera stress från jobbet. Bästa terapin som finns.',
  'Veteran som springer sedan 70-talet. Erfarenhet möter modern träning.',
  'Triathlet som använder löpning som bas för allt annat. Uthållighet först.',
  'Löpning är familjetradition. Tre generationer springer tillsammans.',
  'Rehabiliterar med löpning efter livsstilsförändringar. Ny start!',
  'Löpbloggare som dokumenterar resan från soffa till maraton.',
  'Veganlöpare som visar att växtbaserad kost ger energi för allt.',
  'Löpning som mindfulness - varje steg är en meditation i rörelse.'
];

// Generera realistiska aktiviteter för en användare
const generateActivities = (userId, numActivities = Math.floor(Math.random() * 20) + 5) => {
  const activities = [];
  const now = new Date();
  
  for (let i = 0; i < numActivities; i++) {
    // Slumpa datum mellan 1-365 dagar sedan
    const daysAgo = Math.floor(Math.random() * 365) + 1;
    const activityDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    // Olika typer av löpning med realistiska värden
    const runTypes = [
      { type: 'easy', distance: 3 + Math.random() * 5, paceRange: [300, 420] }, // 5:00-7:00 min/km
      { type: 'tempo', distance: 5 + Math.random() * 8, paceRange: [240, 300] }, // 4:00-5:00 min/km
      { type: 'long', distance: 10 + Math.random() * 15, paceRange: [330, 390] }, // 5:30-6:30 min/km
      { type: 'interval', distance: 4 + Math.random() * 6, paceRange: [210, 270] }, // 3:30-4:30 min/km
      { type: 'recovery', distance: 2 + Math.random() * 4, paceRange: [360, 480] } // 6:00-8:00 min/km
    ];
    
    const runType = runTypes[Math.floor(Math.random() * runTypes.length)];
    const distance = Math.round(runType.distance * 10) / 10; // Avrunda till 1 decimal
    const pace = runType.paceRange[0] + Math.random() * (runType.paceRange[1] - runType.paceRange[0]);
    const duration = Math.round(distance * pace); // sekunder
    
    // Beräkna kalorier (ca 60-80 kcal per km beroende på vikt och intensitet)
    const caloriesPerKm = 60 + Math.random() * 20;
    const calories = Math.round(distance * caloriesPerKm);
    
    // Höjdmeter baserat på distans
    const elevationGain = Math.round(distance * (10 + Math.random() * 30));
    
    // Puls baserat på intensitet
    const baseHR = 140;
    const intensityMultiplier = runType.type === 'interval' ? 1.3 : 
                               runType.type === 'tempo' ? 1.2 : 
                               runType.type === 'easy' ? 1.0 : 0.9;
    const avgHeartRate = Math.round(baseHR * intensityMultiplier + Math.random() * 20);
    const maxHeartRate = Math.round(avgHeartRate * 1.1 + Math.random() * 15);
    
    activities.push({
      userId: userId,
      title: `${runType.type.charAt(0).toUpperCase() + runType.type.slice(1)} löpning`,
      description: `${distance}km ${runType.type} träning`,
      distance: distance,
      duration: duration,
      averagePace: Math.round(pace),
      averageSpeed: Math.round((3600 / pace) * 10) / 10, // km/h
      sportType: 'running',
      activityType: runType.type,
      startTime: activityDate,
      endTime: new Date(activityDate.getTime() + duration * 1000),
      elevationGain: elevationGain,
      calories: calories,
      averageHeartRate: avgHeartRate,
      maxHeartRate: maxHeartRate,
      source: 'manual',
      pointsEarned: Math.round(distance * 10) + 5,
      isPublic: Math.random() > 0.3, // 70% publika
      status: 'completed'
    });
  }
  
  return activities;
};

const create30RealUsers = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Skapar 30 realistiska svenska användare...');
    
    // Ta bort befintliga testanvändare (behåll test@runmate.se)
    await User.deleteMany({ 
      email: { $ne: 'test@runmate.se' },
      $or: [
        { email: /test\d+@runmate\.se/ },
        { source: 'generated' }
      ]
    });
    
    await Activity.deleteMany({ 
      userId: { $in: await User.find({ 
        email: { $ne: 'test@runmate.se' },
        source: 'generated' 
      }).distinct('_id') }
    });
    
    console.log('Rensade befintliga genererade användare och aktiviteter');
    
    const users = [];
    const allActivities = [];
    
    for (let i = 1; i <= 30; i++) {
      // Slumpa kön
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const genderKey = gender === 'male' ? 'male' : 'female';
      
      // Välj namn baserat på kön
      const nameOptions = swedishNames[genderKey];
      const selectedName = nameOptions[Math.floor(Math.random() * nameOptions.length)];
      
      // Välj plats
      const location = swedishLocations[Math.floor(Math.random() * swedishLocations.length)];
      
      // Generera ålder mellan 18-65
      const age = 18 + Math.floor(Math.random() * 47);
      const birthYear = new Date().getFullYear() - age;
      const birthDate = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      // Aktivitetsnivå och sporttyper
      const activityLevels = ['recreational', 'serious', 'competitive'];
      const activityLevel = activityLevels[Math.floor(Math.random() * activityLevels.length)];
      
      // Unsplash bilder för löpare
      const photoId = Math.floor(Math.random() * 1000) + 1;
      const photoQuery = gender === 'male' ? 'man-running' : 'woman-running';
      const profilePhoto = `https://images.unsplash.com/photo-${1500000000 + photoId}?w=400&h=400&fit=crop&auto=format&q=80&${photoQuery}`;
      
      // Skapa användare
      const userData = {
        email: `test${i}@runmate.se`,
        password: await bcrypt.hash('password123', 10),
        firstName: selectedName.first,
        lastName: selectedName.last,
        dateOfBirth: birthDate,
        gender: gender,
        bio: runnerBios[Math.floor(Math.random() * runnerBios.length)],
        profilePhoto: profilePhoto,
        profilePicture: profilePhoto,
        photos: [profilePhoto],
        activityLevel: activityLevel,
        sportTypes: ['running'],
        location: {
          city: location.city,
          country: 'Sweden',
          coordinates: [location.lng, location.lat]
        },
        avgPace: 300 + Math.floor(Math.random() * 120), // 5:00-7:00 min/km
        weeklyDistance: 20 + Math.floor(Math.random() * 40), // 20-60km per vecka
        preferredTrainingTimes: [['early-morning', 'morning', 'evening'][Math.floor(Math.random() * 3)]],
        isProfileComplete: true,
        isEmailVerified: true,
        source: 'generated',
        points: Math.floor(Math.random() * 500) + 100,
        level: Math.floor(Math.random() * 10) + 1,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Slumpad skapandetid
      };
      
      const user = new User(userData);
      await user.save();
      users.push(user);
      
      // Generera aktiviteter för användaren
      const userActivities = generateActivities(user._id);
      allActivities.push(...userActivities);
      
      console.log(`✓ Skapade ${selectedName.first} ${selectedName.last} från ${location.city} (${userActivities.length} aktiviteter)`);
    }
    
    // Spara alla aktiviteter
    if (allActivities.length > 0) {
      await Activity.insertMany(allActivities);
      console.log(`✓ Skapade ${allActivities.length} aktiviteter totalt`);
    }
    
    // Uppdatera användarstatistik baserat på aktiviteter
    for (const user of users) {
      const userActivities = allActivities.filter(a => a.userId.toString() === user._id.toString());
      const totalDistance = userActivities.reduce((sum, a) => sum + a.distance, 0);
      const totalPoints = Math.round(totalDistance * 10) + (userActivities.length * 5);
      
      user.points = totalPoints;
      user.level = Math.floor(totalPoints / 100) + 1;
      await user.save();
    }
    
    // Visa sammanfattning
    console.log('\n🎉 === SAMMANFATTNING ===');
    console.log(`✓ Skapade ${users.length} realistiska svenska användare`);
    console.log(`✓ Genererade ${allActivities.length} träningsaktiviteter`);
    console.log(`✓ Fördelning över ${swedishLocations.length} svenska städer`);
    
    // Visa fördelning
    const genderCount = users.reduce((acc, u) => {
      acc[u.gender] = (acc[u.gender] || 0) + 1;
      return acc;
    }, {});
    
    const locationCount = users.reduce((acc, u) => {
      acc[u.location.city] = (acc[u.location.city] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Fördelning:');
    console.log('Kön:', genderCount);
    console.log('Städer:', Object.entries(locationCount).slice(0, 5).map(([city, count]) => `${city}: ${count}`).join(', '));
    
    const totalDistance = allActivities.reduce((sum, a) => sum + a.distance, 0);
    const avgDistance = totalDistance / allActivities.length;
    
    console.log(`\n🏃‍♂️ Aktivitetsstatistik:`);
    console.log(`Total distans: ${Math.round(totalDistance)} km`);
    console.log(`Genomsnittlig distans: ${Math.round(avgDistance * 10) / 10} km per aktivitet`);
    
    console.log('\n✅ Alla användare är redo för Railway deployment!');
    console.log('🔗 Profiler använder Unsplash-bilder som fungerar överallt');
    console.log('📍 Realistisk svensk data från olika regioner');
    
  } catch (error) {
    console.error('❌ Fel vid skapande av användare:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Databas frånkopplad');
  }
};

if (require.main === module) {
  create30RealUsers();
}

module.exports = create30RealUsers; 