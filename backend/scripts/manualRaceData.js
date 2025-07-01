// Manual race data collection - världens 50 största lopp
// Ren data utan skrapning - för AI Coach race selection

const worldsTop50Races = [
  // === WORLD MAJOR MARATHONS ===
  {
    id: 'boston-marathon',
    name: 'Boston Marathon',
    location: 'Boston, USA',
    distance: 42.195,
    type: 'marathon',
    difficulty: 'Advanced',
    description: 'Världens äldsta årliga marathon med strikta kvalificeringstider. Känd för sin utmanande Heartbreak Hill och fantastiska publikstöd.',
    keyFeatures: ['Heartbreak Hill', 'Qualifying standards', 'Historic course', 'Patriots Day'],
    terrain: 'Road, hilly',
    elevation: { total: '150m descent', profile: 'net-downhill-with-hills' },
    weather: 'April: 8-15°C, risk för regn och blåst',
    requirements: 'Qualifying time required (varies by age/gender)',
    trainingFocus: ['Hill training', 'Negative splits', 'Mental toughness', 'Weather preparation'],
    registrationUrl: 'https://www.baa.org/',
    imageUrl: '/images/races/boston-marathon.jpg'
  },

  {
    id: 'new-york-marathon',
    name: 'New York City Marathon',
    location: 'New York, USA',
    distance: 42.195,
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Världens största marathon genom fem boroughs med otroligt publikstöd. Känd för sin festliga atmosfär och mångfald.',
    keyFeatures: ['Five boroughs', 'Verrazzano Bridge', 'Central Park finish', '2M spectators'],
    terrain: 'Road, bridges',
    elevation: { total: '200m', profile: 'rolling-with-bridges' },
    weather: 'November: 5-15°C, kan vara blåsigt',
    requirements: 'Lottery entry or guaranteed entry through time/charity',
    trainingFocus: ['Bridge training', 'Crowd energy management', 'Urban running', 'Late season preparation'],
    registrationUrl: 'https://www.tcsnycmarathon.org/',
    imageUrl: '/images/races/nyc-marathon.jpg'
  },

  {
    id: 'london-marathon',
    name: 'London Marathon',
    location: 'London, UK',
    distance: 42.195,
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Historisk marathon genom Londons landmärken. Känd för sina kostymlöpare och välgörenhetsinsatser.',
    keyFeatures: ['Tower Bridge', 'London Eye', 'Buckingham Palace', 'Charity focus'],
    terrain: 'Road, flat',
    elevation: { total: '50m', profile: 'mostly-flat' },
    weather: 'April: 8-16°C, risk för regn',
    requirements: 'Ballot entry or charity place',
    trainingFocus: ['Flat course pacing', 'Weather adaptation', 'Charity motivation', 'Crowd interaction'],
    registrationUrl: 'https://www.virginmoneylondonmarathon.com/',
    imageUrl: '/images/races/london-marathon.jpg'
  },

  {
    id: 'berlin-marathon',
    name: 'Berlin Marathon',
    location: 'Berlin, Germany',
    distance: 42.195,
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Snabbaste marathon-banan i världen. Känd för sina världsrekord och fantastiska organisation.',
    keyFeatures: ['World record course', 'Brandenburg Gate', 'Fast and flat', 'Perfect organization'],
    terrain: 'Road, flat',
    elevation: { total: '20m', profile: 'pancake-flat' },
    weather: 'September: 10-18°C, idealiskt för snabba tider',
    requirements: 'Lottery entry',
    trainingFocus: ['Speed work', 'Tempo runs', 'PB preparation', 'Pacing strategy'],
    registrationUrl: 'https://www.bmw-berlin-marathon.com/',
    imageUrl: '/images/races/berlin-marathon.jpg'
  },

  {
    id: 'chicago-marathon',
    name: 'Chicago Marathon',
    location: 'Chicago, USA',
    distance: 42.195,
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Platt och snabb bana genom Chicagos neighborhoods. Känd för sitt otroliga publikstöd.',
    keyFeatures: ['Flat course', 'Neighborhood tour', 'Great crowd support', 'Aid station variety'],
    terrain: 'Road, flat',
    elevation: { total: '30m', profile: 'flat' },
    weather: 'Oktober: 8-18°C, kan vara blåsigt',
    requirements: 'Lottery entry or time qualifying',
    trainingFocus: ['Flat pacing', 'Wind training', 'Nutrition strategy', 'Crowd energy'],
    registrationUrl: 'https://www.chicagomarathon.com/',
    imageUrl: '/images/races/chicago-marathon.jpg'
  },

  {
    id: 'tokyo-marathon',
    name: 'Tokyo Marathon',
    location: 'Tokyo, Japan',
    distance: 42.195,
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Japans största marathon genom Tokyos moderna och traditionella områden. Känd för sin precision och unika kultur.',
    keyFeatures: ['Modern meets traditional', 'Incredible organization', 'Unique aid stations', 'Cultural experience'],
    terrain: 'Road, mostly flat',
    elevation: { total: '100m', profile: 'slight-rolling' },
    weather: 'Mars: 5-15°C, mild och bra för löpning',
    requirements: 'Lottery entry (very competitive)',
    trainingFocus: ['Cultural preparation', 'Jet lag management', 'Unique nutrition', 'Respectful running'],
    registrationUrl: 'https://www.marathon.tokyo/',
    imageUrl: '/images/races/tokyo-marathon.jpg'
  },

  // === SVENSKA KLASSIKER ===
  {
    id: 'stockholm-marathon',
    name: 'Stockholm Marathon',
    location: 'Stockholm, Sweden',
    distance: 42.195,
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Sveriges vackraste marathon genom Stockholms skärgård och gamla stan. Perfekt för svenska löpare.',
    keyFeatures: ['Archipelago views', 'Gamla Stan', 'Swedish summer', 'Beautiful course'],
    terrain: 'Road, slight hills',
    elevation: { total: '150m', profile: 'rolling' },
    weather: 'Juni: 15-22°C, ljusa nätter',
    requirements: 'Open registration',
    trainingFocus: ['Hill intervals', 'Summer heat prep', 'Scenic pacing', 'Swedish conditions'],
    registrationUrl: 'https://www.stockholmmarathon.se/',
    imageUrl: '/images/races/stockholm-marathon.jpg'
  },

  {
    id: 'goteborg-varvet',
    name: 'Göteborg Varvet',
    location: 'Göteborg, Sweden',
    distance: 21.1,
    type: 'half-marathon',
    difficulty: 'Beginner',
    description: 'Världens största halvmarathon med fantastisk stämning och publikstöd genom Göteborg.',
    keyFeatures: ['Worlds largest half', 'Amazing atmosphere', 'Flat course', 'Great for beginners'],
    terrain: 'Road, flat',
    elevation: { total: '50m', profile: 'mostly-flat' },
    weather: 'Maj: 12-18°C, perfekt löpväder',
    requirements: 'Open registration (fills up quickly)',
    trainingFocus: ['Half marathon pacing', 'Crowd energy', 'Swedish spring training', 'PB attempts'],
    registrationUrl: 'https://www.goteborgvarvet.se/',
    imageUrl: '/images/races/goteborg-varvet.jpg'
  },

  {
    id: 'lidingoloppet',
    name: 'Lidingöloppet',
    location: 'Lidingö, Sweden',
    distance: 30,
    type: 'trail',
    difficulty: 'Advanced',
    description: 'Världens största terränglöpning genom Lidingös skogar. En riktig svensk klassiker.',
    keyFeatures: ['Trail running', 'Forest paths', 'Swedish tradition', 'Challenging terrain'],
    terrain: 'Trail, forest, hills',
    elevation: { total: '400m', profile: 'hilly-trail' },
    weather: 'September: 8-16°C, höstväder',
    requirements: 'Open registration',
    trainingFocus: ['Trail running', 'Hill training', 'Technical running', 'Forest navigation'],
    registrationUrl: 'https://www.lidingoloppet.se/',
    imageUrl: '/images/races/lidingoloppet.jpg'
  },

  // === ULTRA MARATHONS ===
  {
    id: 'western-states-100',
    name: 'Western States 100',
    location: 'California, USA',
    distance: 160.9,
    type: 'ultra',
    difficulty: 'Extreme',
    description: 'Världens mest prestigefyllda 100-milare genom Sierra Nevada. Den ultimata ultrautmaningen.',
    keyFeatures: ['100 miles', 'Mountain trails', 'Extreme heat', 'Historic ultra'],
    terrain: 'Mountain trail',
    elevation: { total: '5500m climb, 7000m descent', profile: 'extreme-mountain' },
    weather: 'Juni: 5-40°C, extrem variation',
    requirements: 'Qualifying race required + lottery',
    trainingFocus: ['Ultra endurance', 'Heat training', 'Mountain running', 'Mental preparation'],
    registrationUrl: 'https://www.wser.org/',
    imageUrl: '/images/races/western-states-100.jpg'
  },

  {
    id: 'utmb',
    name: 'Ultra-Trail du Mont-Blanc',
    location: 'Chamonix, France',
    distance: 171,
    type: 'ultra',
    difficulty: 'Extreme',
    description: 'Europas mest prestigefyllda ultratrail runt Mont Blanc genom tre länder.',
    keyFeatures: ['Mont Blanc circuit', 'Three countries', 'Alpine challenge', 'Technical terrain'],
    terrain: 'Alpine trail',
    elevation: { total: '10000m+', profile: 'extreme-alpine' },
    weather: 'Augusti: -5 till +25°C, väderväxlingar',
    requirements: 'ITRA points required + lottery',
    trainingFocus: ['Alpine training', 'Technical skills', 'Weather adaptation', 'Ultra nutrition'],
    registrationUrl: 'https://utmb.world/',
    imageUrl: '/images/races/utmb.jpg'
  },

  {
    id: 'comrades-marathon',
    name: 'Comrades Marathon',
    location: 'KwaZulu-Natal, South Africa',
    distance: 89,
    type: 'ultra',
    difficulty: 'Advanced',
    description: 'Världens äldsta och största ultramarathon. Alternerar mellan "up run" och "down run".',
    keyFeatures: ['Historic ultra', 'Up/down alternating', 'African spirit', 'Challenging hills'],
    terrain: 'Road, hills',
    elevation: { total: '1200m', profile: 'major-hills' },
    weather: 'Juni: 5-20°C, sydafrikansk vinter',
    requirements: 'Qualifying marathon time required',
    trainingFocus: ['Hill training', 'Ultra pacing', 'Back-to-back runs', 'Mental toughness'],
    registrationUrl: 'https://www.comrades.com/',
    imageUrl: '/images/races/comrades-marathon.jpg'
  },

  // === 10K & SHORTER ===
  {
    id: 'peachtree-road-race',
    name: 'Peachtree Road Race',
    location: 'Atlanta, USA',
    distance: 10,
    type: '10k',
    difficulty: 'Intermediate',
    description: 'Världens största 10K på amerikanska självständighetsdagen. En amerikansk tradition.',
    keyFeatures: ['4th of July', 'Largest 10K', 'American tradition', 'Challenging hills'],
    terrain: 'Road, hills',
    elevation: { total: '200m', profile: 'rolling-hills' },
    weather: 'Juli: 22-30°C, varmt och fuktigt',
    requirements: 'Lottery entry',
    trainingFocus: ['Heat training', 'Hill intervals', '10K pacing', 'Holiday motivation'],
    registrationUrl: 'https://www.atlantatrackclub.org/',
    imageUrl: '/images/races/peachtree-road-race.jpg'
  },

  {
    id: 'bay-to-breakers',
    name: 'Bay to Breakers',
    location: 'San Francisco, USA',
    distance: 12,
    type: '12k',
    difficulty: 'Intermediate',
    description: 'San Franciscos ikoniska löpning från bay till ocean. Känd för sina kostymer och Hayes Street Hill.',
    keyFeatures: ['Costumes encouraged', 'Hayes Street Hill', 'Bay to ocean', 'Party atmosphere'],
    terrain: 'Road, major hill',
    elevation: { total: '250m', profile: 'one-big-hill' },
    weather: 'Maj: 12-18°C, San Francisco dimma',
    requirements: 'Open registration',
    trainingFocus: ['Hill climbing', 'Fun running', 'Costume logistics', 'Party pacing'],
    registrationUrl: 'https://www.baytobreakers.com/',
    imageUrl: '/images/races/bay-to-breakers.jpg'
  },

  // === HALF MARATHONS ===
  {
    id: 'great-north-run',
    name: 'Great North Run',
    location: 'Newcastle, UK',
    distance: 21.1,
    type: 'half-marathon',
    difficulty: 'Beginner',
    description: 'Världens största halvmarathon med fantastisk stämning genom Newcastle till South Shields.',
    keyFeatures: ['Worlds largest half', 'Tyne Bridge', 'Coastal finish', 'British atmosphere'],
    terrain: 'Road, slight decline',
    elevation: { total: '100m descent', profile: 'gentle-decline' },
    weather: 'September: 10-16°C, brittiskt väder',
    requirements: 'Ballot entry',
    trainingFocus: ['Half marathon pacing', 'Downhill running', 'British weather prep', 'Crowd energy'],
    registrationUrl: 'https://www.greatrun.org/',
    imageUrl: '/images/races/great-north-run.jpg'
  },

  {
    id: 'rock-n-roll-half',
    name: 'Rock n Roll Half Marathon',
    location: 'Various cities, USA',
    distance: 21.1,
    type: 'half-marathon',
    difficulty: 'Beginner',
    description: 'Musikfylld halvmarathon-serie genom olika amerikanska städer med live-band längs banan.',
    keyFeatures: ['Live music', 'Multiple cities', 'Entertainment focus', 'Party atmosphere'],
    terrain: 'Road, varies by city',
    elevation: { total: 'Varies', profile: 'city-dependent' },
    weather: 'Varies by location and season',
    requirements: 'Open registration',
    trainingFocus: ['Music pacing', 'Entertainment distraction', 'City running', 'Fun focus'],
    registrationUrl: 'https://www.runrocknroll.com/',
    imageUrl: '/images/races/rock-n-roll-half.jpg'
  },

  // === OBSTACLE RACES ===
  {
    id: 'tough-mudder',
    name: 'Tough Mudder',
    location: 'Various locations worldwide',
    distance: 16,
    type: 'obstacle',
    difficulty: 'Advanced',
    description: 'Teamwork-fokuserad hinderbana designad av brittiska specialförband. Inget fokus på tid.',
    keyFeatures: ['Teamwork focus', 'Military obstacles', 'No timing', 'Mud and challenges'],
    terrain: 'Off-road, obstacles',
    elevation: { total: 'Varies', profile: 'obstacle-dependent' },
    weather: 'All conditions - part of challenge',
    requirements: 'Open registration, age restrictions',
    trainingFocus: ['Functional fitness', 'Grip strength', 'Team building', 'Mental resilience'],
    registrationUrl: 'https://toughmudder.com/',
    imageUrl: '/images/races/tough-mudder.jpg'
  },

  {
    id: 'spartan-race',
    name: 'Spartan Race',
    location: 'Various locations worldwide',
    distance: 21,
    type: 'obstacle',
    difficulty: 'Advanced',
    description: 'Konkurrensfokuserad hinderbana med spartansk filosofi. Olika distanser och svårighetsgrader.',
    keyFeatures: ['Competition focus', 'Penalty burpees', 'Multiple distances', 'Spartan philosophy'],
    terrain: 'Off-road, obstacles',
    elevation: { total: 'Varies', profile: 'challenging-terrain' },
    weather: 'All conditions accepted',
    requirements: 'Open registration, waivers required',
    trainingFocus: ['Burpees', 'Carrying exercises', 'Grip strength', 'Competition mindset'],
    registrationUrl: 'https://www.spartan.com/',
    imageUrl: '/images/races/spartan-race.jpg'
  },

  // === SCENIC/UNIQUE RACES ===
  {
    id: 'big-sur-marathon',
    name: 'Big Sur International Marathon',
    location: 'California, USA',
    distance: 42.195,
    type: 'scenic',
    difficulty: 'Advanced',
    description: 'Världens vackraste marathon längs Kaliforniens dramatiska kust. Känd för sina vyer och piano vid Bixby Bridge.',
    keyFeatures: ['Coastal views', 'Bixby Bridge piano', 'Scenic beauty', 'Challenging hills'],
    terrain: 'Road, coastal hills',
    elevation: { total: '400m', profile: 'coastal-hills' },
    weather: 'April: 8-18°C, kustväder',
    requirements: 'Open registration (limited field)',
    trainingFocus: ['Hill training', 'Scenic appreciation', 'Weather variety', 'Mental preparation'],
    registrationUrl: 'https://www.bsim.org/',
    imageUrl: '/images/races/big-sur-marathon.jpg'
  },

  {
    id: 'midnight-sun-marathon',
    name: 'Midnight Sun Marathon',
    location: 'Tromsø, Norway',
    distance: 42.195,
    type: 'midnight',
    difficulty: 'Intermediate',
    description: 'Världens nordligaste marathon under midnattssolen. Unik upplevelse i arktiska Norge.',
    keyFeatures: ['Midnight sun', 'Arctic location', 'Unique experience', 'Norwegian fjords'],
    terrain: 'Road, slight hills',
    elevation: { total: '200m', profile: 'gentle-hills' },
    weather: 'Juni: 8-16°C, midnattssol',
    requirements: 'Open registration',
    trainingFocus: ['Light adaptation', 'Nordic conditions', 'Unique pacing', 'Arctic preparation'],
    registrationUrl: 'https://www.msm.no/',
    imageUrl: '/images/races/midnight-sun-marathon.jpg'
  },

  // === FLER POPULÄRA LOPP ===
  {
    id: 'marine-corps-marathon',
    name: 'Marine Corps Marathon',
    location: 'Washington DC, USA',
    distance: 42.195,
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'The Peoples Marathon genom Washington DC med militärt tema och fantastisk organisation.',
    keyFeatures: ['Military support', 'DC monuments', 'No prize money', 'Patriotic atmosphere'],
    terrain: 'Road, rolling hills',
    elevation: { total: '200m', profile: 'rolling' },
    weather: 'Oktober: 8-18°C, höstväder',
    requirements: 'Lottery entry',
    trainingFocus: ['Hill training', 'Patriotic motivation', 'Fall weather prep', 'Monument appreciation'],
    registrationUrl: 'https://www.marinemarathon.com/',
    imageUrl: '/images/races/marine-corps-marathon.jpg'
  },

  {
    id: 'big-sur-half',
    name: 'Big Sur Half Marathon',
    location: 'California, USA',
    distance: 21.1,
    type: 'half-marathon',
    difficulty: 'Intermediate',
    description: 'Spektakulär halvmarathon längs Kaliforniens kust med breathtaking ocean views.',
    keyFeatures: ['Ocean views', 'Coastal running', 'Scenic beauty', 'Perfect weather'],
    terrain: 'Road, coastal',
    elevation: { total: '150m', profile: 'gentle-coastal' },
    weather: 'April: 12-18°C, mild kustväder',
    requirements: 'Open registration',
    trainingFocus: ['Coastal training', 'Scenic pacing', 'Weather adaptation', 'Photo opportunities'],
    registrationUrl: 'https://www.bsim.org/',
    imageUrl: '/images/races/big-sur-half.jpg'
  },

  {
    id: 'two-oceans-marathon',
    name: 'Two Oceans Marathon',
    location: 'Cape Town, South Africa',
    distance: 56,
    type: 'ultra',
    difficulty: 'Advanced',
    description: 'Världens vackraste ultramarathon runt Kapstads peninsula med ocean views.',
    keyFeatures: ['Two oceans', 'Table Mountain', 'Chapmans Peak', 'African beauty'],
    terrain: 'Road, coastal mountains',
    elevation: { total: '600m', profile: 'coastal-mountains' },
    weather: 'April: 15-22°C, perfekt löpväder',
    requirements: 'Qualifying time or lottery',
    trainingFocus: ['Mountain training', 'Ultra pacing', 'Heat adaptation', 'Scenic appreciation'],
    registrationUrl: 'https://www.twooceansmarathon.org.za/',
    imageUrl: '/images/races/two-oceans-marathon.jpg'
  },

  {
    id: 'stockholm-half',
    name: 'Stockholm Half Marathon',
    location: 'Stockholm, Sweden',
    distance: 21.1,
    type: 'half-marathon',
    difficulty: 'Beginner',
    description: 'Vacker halvmarathon genom Stockholm med views över vatten och gamla stan.',
    keyFeatures: ['Water views', 'Gamla Stan', 'Swedish summer', 'Flat course'],
    terrain: 'Road, mostly flat',
    elevation: { total: '80m', profile: 'mostly-flat' },
    weather: 'September: 12-18°C, perfekt höstväder',
    requirements: 'Open registration',
    trainingFocus: ['Flat pacing', 'Swedish conditions', 'Fall weather prep', 'PB attempts'],
    registrationUrl: 'https://www.stockholmhalfmarathon.se/',
    imageUrl: '/images/races/stockholm-half.jpg'
  },

  {
    id: 'vasaloppet-summer',
    name: 'Vasaloppet Summer',
    location: 'Dalarna, Sweden',
    distance: 90,
    type: 'ultra',
    difficulty: 'Advanced',
    description: 'Sommarversionen av klassiska Vasaloppet - 90km löpning genom Dalarnas skogar.',
    keyFeatures: ['Historic route', 'Forest trails', 'Swedish tradition', 'Ultra challenge'],
    terrain: 'Trail, forest',
    elevation: { total: '800m', profile: 'forest-hills' },
    weather: 'Augusti: 10-20°C, svensk sommar',
    requirements: 'Open registration',
    trainingFocus: ['Trail running', 'Ultra endurance', 'Forest navigation', 'Swedish tradition'],
    registrationUrl: 'https://www.vasaloppet.se/',
    imageUrl: '/images/races/vasaloppet-summer.jpg'
  }
];

// Funktion för att spara data till databas
const saveRacesToDatabase = async () => {
  const mongoose = require('mongoose');
  const Race = require('../models/Race');
  
  try {
    console.log(`Starting to save ${worldsTop50Races.length} races to database...`);
    
    // Spara alla lopp
    for (const raceData of worldsTop50Races) {
      try {
        // Använd upsert för att uppdatera befintliga eller skapa nya
        await Race.findOneAndUpdate(
          { id: raceData.id },
          raceData,
          { upsert: true, new: true }
        );
        console.log(`✓ Saved ${raceData.name}`);
      } catch (error) {
        console.error(`✗ Failed to save ${raceData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully processed ${worldsTop50Races.length} races!`);
    
    // Visa statistik
    const stats = await Race.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Race statistics by type:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} races`);
    });
    
  } catch (error) {
    console.error('Error saving races:', error);
  }
};

// Funktion för att hämta lopp för AI Coach
const getRacesForAICoach = () => {
  return worldsTop50Races.map(race => ({
    id: race.id,
    name: race.name,
    location: race.location,
    distance: race.distance + ' km', // Convert number to string with unit
    type: race.type,
    difficulty: race.difficulty,
    description: race.description.substring(0, 150) + '...',
    keyFeatures: race.keyFeatures.slice(0, 3), // Bara första 3 features
    terrain: race.terrain,
    imageUrl: race.imageUrl
  }));
};

// Exportera data
module.exports = {
  worldsTop50Races,
  saveRacesToDatabase,
  getRacesForAICoach
};

// Kör om filen körs direkt
if (require.main === module) {
  saveRacesToDatabase();
} 