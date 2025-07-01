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
    type: 'marathon',
    difficulty: 'Advanced',
    description: 'Världens äldsta årliga marathon med strikta kvalificeringstider.',
    keyFeatures: ['Heartbreak Hill', 'Qualifying standards', 'Historic course'],
    terrain: 'Road, hilly',
    imageUrl: '/images/races/boston-marathon.jpg'
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
    
    const content = fs.readFileSync(racesFile, 'utf8');
    const races = [];
    
    // Split content by race sections (## followed by number)
    const raceBlocks = content.split(/## \d+\./);
    
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
          console.warn(`Incomplete race data for race ${i}, skipping`);
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
    
    console.log(`Successfully parsed races: ${races.length}`);
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