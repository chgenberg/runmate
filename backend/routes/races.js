const express = require('express');
const router = express.Router();
const Race = require('../models/Race');
const { getRacesForAICoach } = require('../scripts/manualRaceData');
const { protect } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// GET /api/races - Hämta alla lopp för AI Coach
router.get('/', async (req, res) => {
  try {
    const { type, difficulty, search, limit = 50 } = req.query;
    
    let query = { isActive: true };
    
    // Filtrera efter typ
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Filtrera efter svårighetsgrad
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    // Sök i namn, beskrivning eller plats
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { searchTags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const races = await Race.find(query)
      .sort({ popularity: -1, name: 1 })
      .limit(parseInt(limit))
      .select('id name location distance type difficulty description keyFeatures imageUrl terrain elevation weather requirements');
    
    // Om inga lopp finns i databasen, använd manual data
    if (races.length === 0) {
      const manualRaces = getRacesForAICoach();
      
      // Filtrera manual data om nödvändigt
      let filteredRaces = manualRaces;
      
      if (type && type !== 'all') {
        filteredRaces = filteredRaces.filter(race => race.type === type);
      }
      
      if (difficulty && difficulty !== 'all') {
        filteredRaces = filteredRaces.filter(race => race.difficulty === difficulty);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredRaces = filteredRaces.filter(race => 
          (race.name && race.name.toLowerCase().includes(searchLower)) ||
          (race.location && race.location.toLowerCase().includes(searchLower)) ||
          (race.description && race.description.toLowerCase().includes(searchLower)) ||
          (race.searchTags && race.searchTags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }
      
      return res.json({
        success: true,
        races: filteredRaces.slice(0, parseInt(limit)),
        source: 'manual-data',
        total: filteredRaces.length
      });
    }
    
    res.json({
      success: true,
      races,
      source: 'database',
      total: races.length
    });
    
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({
      success: false,
      message: 'Kunde inte hämta lopp',
      error: error.message
    });
  }
});

// Get all races from manual data (replaces file reading for Railway compatibility)
router.get('/race-files', async (req, res) => {
  try {
    const { worldsTop50Races } = require('../scripts/manualRaceData');
    
    if (!worldsTop50Races || worldsTop50Races.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No race data available'
      });
    }
    
    // Add ranking to each race
    const racesWithRanking = worldsTop50Races.map((race, index) => ({
      ...race,
      ranking: index + 1
    }));
    
    res.json({
      success: true,
      count: racesWithRanking.length,
      races: racesWithRanking
    });
  } catch (error) {
    console.error('Error loading race data:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading race data',
      error: error.message
    });
  }
});

// GET /api/races/:id - Hämta specifikt lopp
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let race = await Race.findOne({ id: id, isActive: true });
    
    // Om inte i databas, sök i manual data
    if (!race) {
      const { worldsTop50Races } = require('../scripts/manualRaceData');
      race = worldsTop50Races.find(r => r.id === id);
      
      if (!race) {
        return res.status(404).json({
          success: false,
          message: 'Lopp hittades inte'
        });
      }
    }
    
    res.json({
      success: true,
      race,
      source: race._id ? 'database' : 'manual-data'
    });
    
  } catch (error) {
    console.error('Error fetching race:', error);
    res.status(500).json({
      success: false,
      message: 'Kunde inte hämta lopp',
      error: error.message
    });
  }
});

// GET /api/races/types/all - Hämta alla tillgängliga typer
router.get('/types/all', async (req, res) => {
  try {
    const types = await Race.distinct('type', { isActive: true });
    
    // Om inga typer i databas, använd manual data
    if (types.length === 0) {
      const { worldsTop50Races } = require('../scripts/manualRaceData');
      const manualTypes = [...new Set(worldsTop50Races.map(race => race.type))];
      
      return res.json({
        success: true,
        types: manualTypes,
        source: 'manual-data'
      });
    }
    
    res.json({
      success: true,
      types,
      source: 'database'
    });
    
  } catch (error) {
    console.error('Error fetching race types:', error);
    res.status(500).json({
      success: false,
      message: 'Kunde inte hämta löptyper',
      error: error.message
    });
  }
});

// GET /api/races/stats/summary - Hämta statistik över lopp
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Race.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalRaces: { $sum: 1 },
          byType: {
            $push: {
              type: '$type',
              difficulty: '$difficulty'
            }
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      // Använd manual data för statistik
      const { worldsTop50Races } = require('../scripts/manualRaceData');
      
      const typeStats = {};
      const difficultyStats = {};
      
      worldsTop50Races.forEach(race => {
        typeStats[race.type] = (typeStats[race.type] || 0) + 1;
        difficultyStats[race.difficulty] = (difficultyStats[race.difficulty] || 0) + 1;
      });
      
      return res.json({
        success: true,
        stats: {
          totalRaces: worldsTop50Races.length,
          byType: typeStats,
          byDifficulty: difficultyStats
        },
        source: 'manual-data'
      });
    }
    
    // Bearbeta database stats
    const typeStats = {};
    const difficultyStats = {};
    
    stats[0].byType.forEach(item => {
      typeStats[item.type] = (typeStats[item.type] || 0) + 1;
      difficultyStats[item.difficulty] = (difficultyStats[item.difficulty] || 0) + 1;
    });
    
    res.json({
      success: true,
      stats: {
        totalRaces: stats[0].totalRaces,
        byType: typeStats,
        byDifficulty: difficultyStats
      },
      source: 'database'
    });
    
  } catch (error) {
    console.error('Error fetching race stats:', error);
    res.status(500).json({
      success: false,
      message: 'Kunde inte hämta statistik',
      error: error.message
    });
  }
});

module.exports = router; 