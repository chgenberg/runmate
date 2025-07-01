// Manual race data collection - världens 50 största lopp
// Ren data utan skrapning - för AI Coach race selection

const fs = require('fs');
const path = require('path');

// Original hardcoded races (will be replaced by file loading)
const hardcodedRaces = [
  {
    id: 'boston-marathon',
    name: 'Boston Marathon',
    location: 'Boston, USA',
    distance: 42.195,
    distanceStr: '42.195 km',
    type: 'marathon',
    difficulty: 'Advanced',
    description: 'Världens äldsta årliga marathon med strikta kvalificeringstider.',
    terrain: 'Road, hilly',
    searchTags: ['Boston', 'USA', 'Amerika', 'marathon', 'kvalificering', 'april'],
    imageUrl: '/images/races/boston-marathon.jpg'
  },
  {
    id: 'new-york-city-marathon',
    name: 'New York City Marathon',
    location: 'New York, USA',
    distance: 42.195,
    distanceStr: '42.195 km',
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Världens största marathon med över 50,000 deltagare.',
    terrain: 'Road, varied',
    searchTags: ['New York', 'NYC', 'USA', 'Amerika', 'marathon', 'november'],
    imageUrl: '/images/races/nyc-marathon.jpg'
  },
  {
    id: 'london-marathon',
    name: 'London Marathon',
    location: 'London, England',
    distance: 42.195,
    distanceStr: '42.195 km',
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Ett av World Marathon Majors med fantastisk atmosfär.',
    terrain: 'Road, flat',
    searchTags: ['London', 'England', 'Storbritannien', 'UK', 'marathon', 'april'],
    imageUrl: '/images/races/london-marathon.jpg'
  },
  {
    id: 'berlin-marathon',
    name: 'Berlin Marathon',
    location: 'Berlin, Tyskland',
    distance: 42.195,
    distanceStr: '42.195 km',
    type: 'marathon',
    difficulty: 'Beginner',
    description: 'Känd som världens snabbaste marathon med platt bana.',
    terrain: 'Road, flat',
    searchTags: ['Berlin', 'Tyskland', 'marathon', 'september', 'snabb', 'rekord'],
    imageUrl: '/images/races/berlin-marathon.jpg'
  },
  {
    id: 'chicago-marathon',
    name: 'Chicago Marathon',
    location: 'Chicago, USA',
    distance: 42.195,
    distanceStr: '42.195 km',
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Del av World Marathon Majors med utmärkt organisation.',
    terrain: 'Road, flat',
    searchTags: ['Chicago', 'USA', 'Amerika', 'marathon', 'oktober'],
    imageUrl: '/images/races/chicago-marathon.jpg'
  },
  {
    id: 'tokyo-marathon',
    name: 'Tokyo Marathon',
    location: 'Tokyo, Japan',
    distance: 42.195,
    distanceStr: '42.195 km',
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Asiens största marathon med unik japansk kultur.',
    terrain: 'Road, slightly hilly',
    searchTags: ['Tokyo', 'Japan', 'Asien', 'marathon', 'mars'],
    imageUrl: '/images/races/tokyo-marathon.jpg'
  },
  {
    id: 'stockholm-marathon',
    name: 'Stockholm Marathon',
    location: 'Stockholm, Sverige',
    distance: 42.195,
    distanceStr: '42.195 km',
    type: 'marathon',
    difficulty: 'Intermediate',
    description: 'Vackert marathon genom Sveriges huvudstad.',
    terrain: 'Road, slightly hilly',
    searchTags: ['Sverige', 'Stockholm', 'marathon', 'juni', 'huvudstad'],
    imageUrl: '/images/races/stockholm-marathon.jpg'
  },
  {
    id: 'goteborgsvarvet',
    name: 'Göteborgsvarvet',
    location: 'Göteborg, Sverige',
    distance: 21.1,
    distanceStr: '21.1 km',
    type: 'halvmarathon',
    difficulty: 'Beginner',
    description: 'Världens största halvmarathon med över 60,000 deltagare.',
    terrain: 'Road, flat',
    searchTags: ['Sverige', 'Göteborg', 'halvmarathon', 'maj', 'stor'],
    imageUrl: '/images/races/goteborgsvarvet.jpg'
  },
  {
    id: 'lidingoloppet',
    name: 'Lidingöloppet',
    location: 'Lidingö, Sverige',
    distance: 30,
    distanceStr: '30 km',
    type: 'terränglöpning',
    difficulty: 'Intermediate',
    description: 'Världens största terränglöpning genom Lidingös skogar.',
    terrain: 'Trail, forest',
    searchTags: ['Sverige', 'Lidingö', 'terräng', 'september', 'skog'],
    imageUrl: '/images/races/lidingoloppet.jpg'
  },
  {
    id: 'vasaloppet',
    name: 'Vasaloppet',
    location: 'Dalarna, Sverige',
    distance: 90,
    distanceStr: '90 km',
    type: 'skidlöpning',
    difficulty: 'Advanced',
    description: 'Världens äldsta och största längdskidtävling.',
    terrain: 'Cross-country ski',
    searchTags: ['Sverige', 'Dalarna', 'skidor', 'mars', 'tradition'],
    imageUrl: '/images/races/vasaloppet.jpg'
  },
  {
    id: 'comrades-marathon',
    name: 'Comrades Marathon',
    location: 'Durban-Pietermaritzburg, Sydafrika',
    distance: 89,
    distanceStr: '89 km',
    type: 'ultramarathon',
    difficulty: 'Expert',
    description: 'Världens äldsta och största ultramarathon.',
    terrain: 'Road, very hilly',
    searchTags: ['Sydafrika', 'ultramarathon', 'juni', 'tradition'],
    imageUrl: '/images/races/comrades.jpg'
  },
  {
    id: 'western-states-100',
    name: 'Western States 100',
    location: 'Kalifornien, USA',
    distance: 161,
    distanceStr: '161 km',
    type: 'trail ultramarathon',
    difficulty: 'Expert',
    description: 'Prestigefyllt 100-mile trail race genom Sierra Nevada.',
    terrain: 'Trail, mountains',
    searchTags: ['Kalifornien', 'USA', 'trail', 'ultramarathon', 'berg'],
    imageUrl: '/images/races/western-states.jpg'
  },
  {
    id: 'utmb',
    name: 'Ultra-Trail du Mont-Blanc',
    location: 'Chamonix, Frankrike',
    distance: 171,
    distanceStr: '171 km',
    type: 'trail ultramarathon',
    difficulty: 'Expert',
    description: 'Världens mest prestigefyllda trail ultramarathon.',
    terrain: 'Mountain trail',
    searchTags: ['Frankrike', 'Mont Blanc', 'trail', 'ultramarathon', 'berg'],
    imageUrl: '/images/races/utmb.jpg'
  },
  {
    id: 'badwater-135',
    name: 'Badwater 135',
    location: 'Death Valley, USA',
    distance: 217,
    distanceStr: '217 km',
    type: 'ultramarathon',
    difficulty: 'Expert',
    description: 'Världens tuffaste race från Death Valley till Mount Whitney.',
    terrain: 'Road, desert',
    searchTags: ['USA', 'Death Valley', 'ultramarathon', 'öken', 'extrem'],
    imageUrl: '/images/races/badwater.jpg'
  },
  {
    id: 'two-oceans-marathon',
    name: 'Two Oceans Marathon',
    location: 'Kapstaden, Sydafrika',
    distance: 56,
    distanceStr: '56 km',
    type: 'ultramarathon',
    difficulty: 'Advanced',
    description: 'Vackert race runt Kaphalvön med fantastisk utsikt.',
    terrain: 'Road, hilly',
    searchTags: ['Sydafrika', 'Kapstaden', 'ultramarathon', 'påsk', 'utsikt'],
    imageUrl: '/images/races/two-oceans.jpg'
  }
];

// Function to read and parse all race files
const loadRacesFromFiles = () => {
  try {
    const racesFile = path.join(__dirname, '../../complete_race_data/all_races.txt');
    
    if (!fs.existsSync(racesFile)) {
      console.error('all_races.txt file not found at:', racesFile);
      return hardcodedRaces;
    }
    
    console.log('Reading races from:', racesFile);
    const content = fs.readFileSync(racesFile, 'utf8');
    console.log('File content length:', content.length);
    
    const races = [];
    
    // Split content by race sections (## followed by space and number)
    const raceBlocks = content.split(/## \d+\.\s/);
    console.log('Number of race blocks found:', raceBlocks.length - 1); // -1 because first element is empty
    
    // Skip the first empty element and process each race block
    for (let i = 1; i < raceBlocks.length; i++) {
      const block = raceBlocks[i].trim();
      if (!block) continue;
      
      try {
        // Extract race name (first line)
        const lines = block.split('\n');
        const name = lines[0].trim();
        
        // Extract other fields
        const platsMatch = block.match(/\*\*Plats:\*\* (.+)/);
        const distansMatch = block.match(/\*\*Distans:\*\* (.+)/);
        const typMatch = block.match(/\*\*Typ:\*\* (.+)/);
        const svårighetsMatch = block.match(/\*\*Svårighetsgrad:\*\* (.+)/);
        const terrängMatch = block.match(/\*\*Terräng:\*\* (.+)/);
        const beskrivningMatch = block.match(/\*\*Beskrivning:\*\* (.+)/);
        const söktaggarMatch = block.match(/\*\*Söktaggar:\*\* (.+)/);
        
        if (!name || !platsMatch || !distansMatch) {
          console.warn(`Incomplete race data for race ${i} (${name || 'unnamed'}), skipping`);
          continue;
        }
        
        // Parse distance
        const distanceStr = distansMatch[1];
        let distance = 42.195; // default
        let distanceNumber = parseFloat(distanceStr.replace(/[^\d.]/g, ''));
        if (!isNaN(distanceNumber)) {
          distance = distanceNumber;
        }
        
        // Determine difficulty level
        const svårighetsgrad = svårighetsMatch ? svårighetsMatch[1] : 'Medel';
        let difficulty = 'Intermediate';
        switch(svårighetsgrad.toLowerCase()) {
          case 'nybörjare':
            difficulty = 'Beginner';
            break;
          case 'medel':
            difficulty = 'Intermediate';
            break;
          case 'avancerad':
            difficulty = 'Advanced';
            break;
          case 'extrem':
            difficulty = 'Expert';
            break;
        }
        
        // Create searchTags array
        const searchTags = söktaggarMatch ? 
          söktaggarMatch[1].split(',').map(tag => tag.trim()) : [];
        
        const race = {
          id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: name,
          location: platsMatch[1],
          distance: distance,
          distanceStr: distanceStr,
          type: typMatch ? typMatch[1].toLowerCase() : 'marathon',
          difficulty: difficulty,
          description: beskrivningMatch ? beskrivningMatch[1] : '',
          terrain: terrängMatch ? terrängMatch[1] : '',
          searchTags: searchTags,
          imageUrl: `/images/races/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`
        };
        
        races.push(race);
        
      } catch (error) {
        console.error(`Error parsing race ${i}:`, error);
        continue;
      }
    }
    
    console.log(`Successfully parsed ${races.length} races`);
    
    // If no races were parsed from file, return hardcoded data
    if (races.length === 0) {
      console.warn('No races parsed from file, using hardcoded data');
      return hardcodedRaces;
    }
    
    return races;
    
  } catch (error) {
    console.error('Error loading races from all_races.txt:', error);
    // Return the original hardcoded data as fallback
    return hardcodedRaces;
  }
};

// Load races from files or use hardcoded data
let worldsTop50Races;
try {
  console.log('Attempting to load races from files...');
  worldsTop50Races = loadRacesFromFiles();
  console.log(`Successfully loaded ${worldsTop50Races.length} races from files`);
} catch (error) {
  console.error('Failed to load races from files, using hardcoded data:', error);
  worldsTop50Races = hardcodedRaces;
}

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
    console.error('Error saving races to database:', error);
  }
};

// Funktion för att hämta lopp för AI Coach
const getRacesForAICoach = () => {
  return worldsTop50Races.map(race => ({
    id: race.id,
    name: race.name,
    location: race.location,
    distance: race.distanceStr || (race.distance + ' km'), // Use distanceStr if available
    type: race.type,
    difficulty: race.difficulty,
    description: race.description ? race.description.substring(0, 150) + '...' : '',
    keyFeatures: race.keyFeatures ? race.keyFeatures.slice(0, 3) : [], // Bara första 3 features
    terrain: race.terrain,
    elevation: race.elevation,
    weather: race.weather,
    searchTags: race.searchTags || [],
    ranking: race.ranking,
    imageUrl: race.imageUrl || '/images/races/default.jpg'
  }));
};

// Kör om filen körs direkt
if (require.main === module) {
  saveRacesToDatabase();
}

// Export the loaded races
module.exports = {
  worldsTop50Races,
  saveRacesToDatabase,
  getRacesForAICoach
}; 