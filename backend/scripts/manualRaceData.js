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
    const racesDir = path.join(__dirname, '../../complete_race_data');
    console.log('Looking for race files in:', racesDir);
    
    const files = fs.readdirSync(racesDir);
    console.log('Found files:', files.length);
    
    const races = [];
    
    // Filter and sort race files (exclude index file)
    const raceFiles = files
      .filter(file => file.endsWith('.txt') && file !== '00_KOMPLETT_INDEX.txt')
      .sort((a, b) => {
        const numA = parseInt(a.split('_')[0]);
        const numB = parseInt(b.split('_')[0]);
        return numA - numB;
      });
    
    console.log('Race files to process:', raceFiles.length);
    
    // Parse each race file
    raceFiles.forEach((file, index) => {
      const filePath = path.join(racesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Parse race data from file
      const raceData = {};
      let currentSection = '';
      
      lines.forEach(line => {
        // Parse different fields
        if (line.startsWith('Namn: ')) {
          raceData.name = line.replace('Namn: ', '').trim();
        } else if (line.startsWith('Plats: ')) {
          raceData.location = line.replace('Plats: ', '').trim();
        } else if (line.startsWith('Distans: ')) {
          const distanceStr = line.replace('Distans: ', '').trim();
          raceData.distanceStr = distanceStr;
          // Extract numeric distance
          const match = distanceStr.match(/(\d+(?:\.\d+)?)/);
          raceData.distance = match ? parseFloat(match[1]) : 42.195;
        } else if (line.startsWith('Typ: ')) {
          raceData.type = line.replace('Typ: ', '').trim().toLowerCase();
        } else if (line.startsWith('Svårighetsgrad: ')) {
          raceData.difficulty = line.replace('Svårighetsgrad: ', '').trim();
        } else if (line.startsWith('Terräng: ')) {
          raceData.terrain = line.replace('Terräng: ', '').trim();
        } else if (line.startsWith('Höjdmeter: ')) {
          raceData.elevation = line.replace('Höjdmeter: ', '').trim();
        } else if (line.startsWith('Väder: ')) {
          raceData.weather = line.replace('Väder: ', '').trim();
        } else if (line.startsWith('Popularitet: ')) {
          raceData.popularity = line.replace('Popularitet: ', '').trim();
        } else if (line.startsWith('Krav: ')) {
          raceData.requirements = line.replace('Krav: ', '').trim();
        } else if (line.startsWith('Unik')) {
          raceData.uniqueFeature = line.replace(/^Unikt?\s+[^-]+-lopp:\s*/, '').trim();
        } else if (line.startsWith('Beskrivning:')) {
          currentSection = 'description';
        } else if (line.startsWith('Nyckelfunktioner:')) {
          currentSection = 'features';
          raceData.keyFeatures = [];
        } else if (line.startsWith('Träningsfokus:')) {
          currentSection = 'training';
          raceData.trainingFocus = [];
        } else if (currentSection === 'description' && !line.startsWith('Nyckelfunktioner:')) {
          raceData.description = (raceData.description || '') + ' ' + line.trim();
        } else if (currentSection === 'features' && line.startsWith('- ')) {
          raceData.keyFeatures.push(line.replace('- ', '').trim());
        } else if (currentSection === 'training' && line.startsWith('- ')) {
          raceData.trainingFocus.push(line.replace('- ', '').trim());
        }
      });
      
      // Clean up description
      if (raceData.description) {
        raceData.description = raceData.description.trim();
      }
      
      // Create ID from name
      raceData.id = raceData.name
        .toLowerCase()
        .replace(/[åä]/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Add ranking
      raceData.ranking = index + 1;
      
      // Normalize type
      if (raceData.type) {
        if (raceData.type.includes('trail') || raceData.type.includes('terräng')) {
          raceData.type = 'trail';
        } else if (raceData.type.includes('ultra')) {
          raceData.type = 'ultra';
        } else if (raceData.type.includes('halvmarathon') || raceData.type.includes('half')) {
          raceData.type = 'half-marathon';
        } else if (raceData.type.includes('marathon')) {
          raceData.type = 'marathon';
        } else if (raceData.type.includes('10k') || raceData.distance === 10) {
          raceData.type = '10k';
        } else if (raceData.type.includes('5k') || raceData.distance === 5) {
          raceData.type = '5k';
        }
      }
      
      // Add search tags for Swedish races
      raceData.searchTags = [];
      if (raceData.location && raceData.location.toLowerCase().includes('sverige')) {
        raceData.searchTags.push('Sverige', 'Sweden', 'Svenska lopp');
      }
      if (raceData.location && raceData.location.toLowerCase().includes('stockholm')) {
        raceData.searchTags.push('Stockholm');
      }
      if (raceData.location && raceData.location.toLowerCase().includes('göteborg')) {
        raceData.searchTags.push('Göteborg', 'Goteborg');
      }
      
      // Add elevation object
      if (raceData.elevation) {
        raceData.elevationObj = {
          total: raceData.elevation,
          profile: raceData.elevation.includes('+') ? 'hilly' : 'flat'
        };
      }
      
      races.push(raceData);
    });
    
    console.log('Successfully parsed races:', races.length);
    return races;
  } catch (error) {
    console.error('Error loading races from files:', error);
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