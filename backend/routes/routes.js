const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const axios = require('axios');

// Configuration for external APIs
const OPENROUTE_SERVICE_API_KEY = process.env.OPENROUTE_SERVICE_API_KEY || 'demo-key';
const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY || 'demo-key';

// OpenStreetMap routes via Overpass API
router.get('/osm', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 5000, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Simplified but more effective Overpass API query
    const overpassQuery = `
      [out:json][timeout:30];
      (
        // Any footways and paths (most common for running)
        way["highway"="footway"](around:${Math.min(radius, 8000)},${lat},${lng});
        way["highway"="path"](around:${Math.min(radius, 8000)},${lat},${lng});
        way["highway"="track"](around:${Math.min(radius, 8000)},${lat},${lng});
        way["highway"="cycleway"](around:${Math.min(radius, 8000)},${lat},${lng});
        
        // Sports facilities
        way["leisure"="track"](around:${radius},${lat},${lng});
        way["leisure"="sports_centre"](around:${radius},${lat},${lng});
        
        // Official routes
        relation["route"="foot"](around:${radius},${lat},${lng});
        relation["route"="hiking"](around:${radius},${lat},${lng});
        
        // Pedestrian areas
        way["highway"="pedestrian"](around:${Math.min(radius, 5000)},${lat},${lng});
        way["highway"="steps"](around:${Math.min(radius, 3000)},${lat},${lng});
      );
      out geom;
    `;

    console.log('Querying Overpass API for running routes...');
    console.log('Query:', overpassQuery);
    
    const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 30000
    });

    const data = response.data;
    console.log(`Found ${data.elements ? data.elements.length : 0} OSM elements`);
    
    // Log first few elements for debugging
    if (data.elements && data.elements.length > 0) {
      console.log('First OSM element:', JSON.stringify(data.elements[0], null, 2));
    }
    
    if (!data.elements || data.elements.length === 0) {
      console.log('No OSM routes found, generating fallback routes');
      return res.json({ routes: generateFallbackOsmRoutes(lat, lng) });
    }

    // Process and enhance OSM data
    const routes = await Promise.all(
      data.elements.slice(0, limit).map(async (element, index) => {
        const coordinates = extractCoordinates(element, lat, lng);
        const distance = calculateRouteDistance(coordinates);
        
        // Try to get elevation profile from GraphHopper
        let elevation = Math.round(Math.random() * 100 + 30);
        try {
          const elevationData = await getElevationProfile(coordinates);
          elevation = elevationData.totalElevation || elevation;
        } catch (error) {
          console.log('Could not get elevation data:', error.message);
        }

        const routeName = element.tags?.name || 
                         (element.tags?.highway === 'footway' ? `Gångväg ${index + 1}` :
                          element.tags?.highway === 'path' ? `Stig ${index + 1}` :
                          element.tags?.highway === 'track' ? `Spår ${index + 1}` :
                          element.tags?.highway === 'cycleway' ? `Cykelväg ${index + 1}` :
                          element.tags?.leisure === 'track' ? `Löpbana ${index + 1}` :
                          `Rutt ${index + 1}`);

        return {
          id: `osm-${element.id}`,
          name: routeName,
          distance: Math.round(distance * 10) / 10,
          duration: Math.round(distance * 6.5), // ~6.5 min/km average
          difficulty: getDifficultyFromElevation(elevation, distance),
          terrain: getTerrainType(element.tags),
          elevation,
          calories: Math.round(distance * 70),
          description: generateRouteDescription(element.tags, distance),
          source: 'OpenStreetMap',
          highlights: generateHighlights(element.tags),
          coordinates,
          image: `/lopning${(index % 6) + 1}.png`,
          matchScore: Math.round(Math.random() * 20 + 70),
          osmTags: element.tags
        };
      })
    );

    res.json({ routes });

  } catch (error) {
    console.error('Error fetching OSM routes:', error);
    
    // Return fallback routes on error
    const { lat, lng } = req.query;
    const fallbackRoutes = generateFallbackOsmRoutes(lat, lng);
    
    res.json({ 
      routes: fallbackRoutes,
      warning: 'Using fallback routes due to API error'
    });
  }
});

// Popular community routes
router.get('/popular', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    // Mock popular routes - in production this would come from database
    const popularRoutes = [
      {
        id: 'popular-1',
        name: 'Djurgården Klassiker',
        distance: 8.5,
        duration: 52,
        difficulty: 'Medel',
        terrain: 'Park',
        elevation: 65,
        calories: 595,
        description: 'En av Stockholms mest populära löprutter genom vackra Djurgården.',
        source: 'Community',
        highlights: ['Populär', 'Vacker utsikt', 'Välmärkt'],
        coordinates: generateCircularRoute(parseFloat(lat), parseFloat(lng), 8.5),
        image: '/lopning1.png',
        matchScore: 88,
        popularity: 4.8,
        completions: 1247
      },
      {
        id: 'popular-2',
        name: 'Långholmen Loop',
        distance: 5.2,
        duration: 31,
        difficulty: 'Lätt',
        terrain: 'Park',
        elevation: 35,
        calories: 364,
        description: 'Perfekt rutt för nybörjare med fantastisk utsikt över vattnet.',
        source: 'Community',
        highlights: ['Nybörjarvänlig', 'Vattenvy', 'Centralt'],
        coordinates: generateCircularRoute(parseFloat(lat), parseFloat(lng), 5.2),
        image: '/lopning2.png',
        matchScore: 92,
        popularity: 4.6,
        completions: 892
      },
      {
        id: 'popular-3',
        name: 'Södermalm Trappor',
        distance: 6.8,
        duration: 45,
        difficulty: 'Svår',
        terrain: 'Urban',
        elevation: 120,
        calories: 545,
        description: 'Utmanande rutt med många trappor för intensiv träning.',
        source: 'Community',
        highlights: ['Utmanande', 'Trappträning', 'Stadsmiljö'],
        coordinates: generateCircularRoute(parseFloat(lat), parseFloat(lng), 6.8),
        image: '/lopning3.png',
        matchScore: 78,
        popularity: 4.3,
        completions: 534
      }
    ];

    res.json({ routes: popularRoutes });

  } catch (error) {
    console.error('Error fetching popular routes:', error);
    res.status(500).json({ error: 'Failed to fetch popular routes' });
  }
});

// Generate route using OpenRouteService
router.post('/generate', auth, async (req, res) => {
  try {
    const { startLat, startLng, distance, preferences = {} } = req.body;

    if (!startLat || !startLng || !distance) {
      return res.status(400).json({ error: 'Start coordinates and distance are required' });
    }

    // Use OpenRouteService to generate a circular route
    const route = await generateCircularRouteWithORS(
      startLat, 
      startLng, 
      distance, 
      preferences
    );

    // Enhance with elevation data from GraphHopper
    try {
      const elevationData = await getElevationProfile(route.coordinates);
      route.elevation = elevationData.totalElevation;
      route.elevationProfile = elevationData.profile;
    } catch (error) {
      console.log('Could not enhance with elevation data:', error.message);
    }

    res.json({ route });

  } catch (error) {
    console.error('Error generating route:', error);
    res.status(500).json({ error: 'Failed to generate route' });
  }
});

// Add/remove route from favorites
router.post('/:routeId/favorite', auth, async (req, res) => {
  try {
    const { routeId } = req.params;
    const userId = req.user.id;

    // In production, save to database
    // For now, just return success
    res.json({ success: true, message: 'Route added to favorites' });

  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/:routeId/favorite', auth, async (req, res) => {
  try {
    const { routeId } = req.params;
    const userId = req.user.id;

    // In production, remove from database
    // For now, just return success
    res.json({ success: true, message: 'Route removed from favorites' });

  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Helper functions

function extractCoordinates(element, centerLat, centerLng) {
  if (element.geometry) {
    return element.geometry.map(point => [point.lat, point.lon]);
  }
  
  if (element.nodes && element.nodes.length > 0) {
    // For ways without geometry, generate approximate coordinates around the center
    return generateApproximateCoordinates(element.nodes.length, parseFloat(centerLat), parseFloat(centerLng));
  }
  
  return generateApproximateCoordinates(10, parseFloat(centerLat), parseFloat(centerLng));
}

function calculateRouteDistance(coordinates) {
  if (!coordinates || coordinates.length < 2) return 5;
  
  let totalDistance = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const dist = haversineDistance(
      coordinates[i-1][0], coordinates[i-1][1],
      coordinates[i][0], coordinates[i][1]
    );
    totalDistance += dist;
  }
  
  return totalDistance;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getDifficultyFromElevation(elevation, distance) {
  const elevationPerKm = elevation / distance;
  if (elevationPerKm < 20) return 'Lätt';
  if (elevationPerKm < 50) return 'Medel';
  return 'Svår';
}

function getTerrainType(tags) {
  if (!tags) return 'Blandat';
  
  if (tags.surface === 'asphalt' || tags.highway === 'footway') return 'Asfalt';
  if (tags.natural || tags.landuse === 'forest') return 'Natur';
  if (tags.leisure === 'park') return 'Park';
  if (tags.highway === 'track') return 'Grusväg';
  
  return 'Blandat';
}

function generateRouteDescription(tags, distance) {
  if (!tags) {
    return `En ${distance.toFixed(1)} km lång rutt genom vacker natur.`;
  }

  // Generate description based on actual route characteristics
  if (tags?.highway === 'footway') {
    return `Välunderhållen gångväg på ${distance.toFixed(1)}km. Perfekt för löpning med jämn yta och god tillgänglighet.`;
  }
  if (tags?.highway === 'path') {
    return `Naturstig på ${distance.toFixed(1)}km genom vacker terräng. Varierad underlag och naturupplevelse.`;
  }
  if (tags?.highway === 'track') {
    return `Skogsväg/spår på ${distance.toFixed(1)}km. Naturlig löpupplevelse med mjukare underlag.`;
  }
  if (tags?.highway === 'cycleway') {
    return `Cykelväg på ${distance.toFixed(1)}km som även är utmärkt för löpning. Säker och välunderhållen.`;
  }
  if (tags?.leisure === 'track') {
    return `Löpbana på ${distance.toFixed(1)}km. Professionell yta för träning och tester.`;
  }
  if (tags?.highway === 'pedestrian') {
    return `Gågata på ${distance.toFixed(1)}km. Bilfri miljö perfekt för stadslöpning.`;
  }
  if (tags?.surface === 'paved') {
    return `Asfalterad rutt på ${distance.toFixed(1)}km. Snabb och jämn yta för tempotränng.`;
  }
  if (tags?.surface === 'gravel') {
    return `Grusväg på ${distance.toFixed(1)}km. Naturlig känsla med mjukare steg.`;
  }
  let description = '';
  const routeName = tags.name || 'Namnlös rutt';
  
  if (tags.route === 'hiking' || tags.route === 'foot') {
    description = `${routeName} - En ${distance.toFixed(1)} km lång vandring/löprunda`;
  } else if (tags.leisure === 'track' && tags.sport === 'running') {
    description = `${routeName} - Atletikbana för löpträning, ${distance.toFixed(1)} km`;
  } else if (tags.highway === 'footway' || tags.highway === 'path') {
    if (tags.name && (tags.name.includes('Costa') || tags.name.includes('Playa') || tags.name.includes('Mar'))) {
      description = `${routeName} - Kustpromenad med havsutsikt, ${distance.toFixed(1)} km`;
    } else if (tags.natural) {
      description = `${routeName} - Naturstig genom ${tags.natural}, ${distance.toFixed(1)} km`;
    } else {
      description = `${routeName} - Gång- och löpstig, ${distance.toFixed(1)} km`;
    }
  } else if (tags.highway === 'cycleway') {
    description = `${routeName} - Cykelväg som tillåter löpning, ${distance.toFixed(1)} km`;
  } else {
    description = `${routeName} - ${distance.toFixed(1)} km rutt`;
  }
  
  // Add terrain info if available
  if (tags.surface) {
    description += ` (${tags.surface})`;
  }
  
  return description;
}

function generateHighlights(tags) {
  const highlights = [];
  
  if (!tags) {
    return ['Naturupplevelse', 'Välmärkt', 'Populär'];
  }
  
  // Route type highlights
  if (tags.route === 'hiking') highlights.push('Vandringsled');
  if (tags.route === 'foot' || tags.route === 'running') highlights.push('Löprunda');
  if (tags.leisure === 'track' && tags.sport === 'running') highlights.push('Atletikbana');
  
  // Terrain and surface
  if (tags.surface === 'asphalt') highlights.push('Asfalt');
  if (tags.surface === 'concrete') highlights.push('Betong');
  if (tags.surface === 'unpaved') highlights.push('Grusväg');
  if (tags.surface === 'sand') highlights.push('Sand');
  
  // Special features
  if (tags.lit === 'yes') highlights.push('Belyst');
  if (tags.name && (tags.name.includes('Costa') || tags.name.includes('Playa') || tags.name.includes('Mar'))) {
    highlights.push('Havsutsikt');
  }
  if (tags.natural === 'forest') highlights.push('Skog');
  if (tags.natural === 'beach') highlights.push('Strand');
  if (tags.natural === 'coastline') highlights.push('Kust');
  
  // Accessibility
  if (tags.access === 'yes') highlights.push('Allmän tillgång');
  if (tags.foot === 'yes') highlights.push('Tillåten för fotgängare');
  if (tags.wheelchair === 'yes') highlights.push('Tillgänglig');
  
  // Default if no specific highlights
  if (highlights.length === 0) {
    highlights.push('Naturupplevelse', 'Välmärkt');
  }
  
  return highlights.slice(0, 3);
}

async function getElevationProfile(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    throw new Error('No coordinates provided');
  }

  try {
    // Use GraphHopper Elevation API
    const coordinateString = coordinates
      .slice(0, 20) // Limit to avoid API limits
      .map(coord => `${coord[1]},${coord[0]}`) // GraphHopper expects lon,lat
      .join('|');

    const response = await axios.get('https://graphhopper.com/api/1/elevation', {
      params: {
        points: coordinateString,
        key: GRAPHHOPPER_API_KEY
      },
      timeout: 10000
    });

    if (response.data && response.data.heights) {
      const heights = response.data.heights;
      const totalElevation = Math.max(...heights) - Math.min(...heights);
      
      return {
        totalElevation: Math.round(totalElevation),
        profile: heights
      };
    }
    
    throw new Error('Invalid elevation data');

  } catch (error) {
    // Fallback to estimated elevation
    return {
      totalElevation: Math.round(Math.random() * 100 + 30),
      profile: []
    };
  }
}

async function generateCircularRouteWithORS(lat, lng, distance, preferences) {
  try {
    // OpenRouteService doesn't have direct circular route generation
    // So we'll create waypoints in a circle and route between them
    const waypoints = generateCircularWaypoints(lat, lng, distance, 8);
    
    const response = await axios.post('https://api.openrouteservice.org/v2/directions/foot-walking', {
      coordinates: waypoints.map(point => [point.lng, point.lat]),
      format: 'geojson',
      options: {
        avoid_features: preferences.avoidTraffic ? ['steps'] : []
      }
    }, {
      headers: {
        'Authorization': OPENROUTE_SERVICE_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const geometry = response.data.features[0].geometry.coordinates;
    const coordinates = geometry.map(point => [point[1], point[0]]); // Convert to lat,lng
    
    return {
      id: `generated-${Date.now()}`,
      name: `Genererad rutt ${distance} km`,
      distance: distance,
      duration: Math.round(distance * 6.5),
      difficulty: 'Medel',
      terrain: 'Blandat',
      elevation: 50,
      calories: Math.round(distance * 70),
      description: `AI-genererad rutt på ${distance} km anpassad efter dina preferenser.`,
      source: 'Generated',
      highlights: ['AI-genererad', 'Anpassad', 'Optimerad'],
      coordinates,
      image: '/lopning4.png',
      matchScore: 95
    };

  } catch (error) {
    console.error('OpenRouteService error:', error.message);
    
    // Fallback to simple circular route
    return {
      id: `fallback-${Date.now()}`,
      name: `Rutt ${distance} km`,
      distance: distance,
      duration: Math.round(distance * 6.5),
      difficulty: 'Medel',
      terrain: 'Blandat',
      elevation: Math.round(Math.random() * 80 + 20),
      calories: Math.round(distance * 70),
      description: `En ${distance} km lång rutt i ditt område.`,
      source: 'Generated',
      highlights: ['Lokal', 'Anpassad', 'Enkel'],
      coordinates: generateCircularRoute(lat, lng, distance),
      image: '/lopning5.png',
      matchScore: 85
    };
  }
}

function generateCircularWaypoints(lat, lng, distance, numPoints) {
  const waypoints = [];
  const radius = distance / (2 * Math.PI) * 0.009; // Approximate conversion to degrees
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const waypointLat = lat + Math.cos(angle) * radius;
    const waypointLng = lng + Math.sin(angle) * radius;
    waypoints.push({ lat: waypointLat, lng: waypointLng });
  }
  
  return waypoints;
}

function generateCircularRoute(centerLat, centerLng, distance) {
  const coordinates = [];
  const points = Math.max(20, Math.round(distance * 4));
  // Better radius calculation: ~111km per degree latitude, adjust for longitude
  const radiusLat = (distance / 111) * 0.3; // Smaller radius for more realistic routes
  const radiusLng = radiusLat / Math.cos(centerLat * Math.PI / 180); // Adjust for longitude

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    // Add some randomness but keep it reasonable
    const randomFactor = 0.7 + Math.random() * 0.6;
    const lat = centerLat + Math.cos(angle) * radiusLat * randomFactor;
    const lng = centerLng + Math.sin(angle) * radiusLng * randomFactor;
    coordinates.push([lat, lng]);
  }
  
  return coordinates;
}

function generateFallbackOsmRoutes(lat, lng) {
  // Generate more realistic fallback routes based on location
  const isCoastal = Math.abs(parseFloat(lat) - 39.5) < 1 && Math.abs(parseFloat(lng) - 2.6) < 1; // Roughly Mallorca area
  
  if (isCoastal) {
    return [
      {
        id: 'fallback-coastal-1',
        name: 'Kustpromenad - Havsutsikt',
        distance: 5.8,
        duration: 35,
        difficulty: 'Lätt',
        terrain: 'Kust',
        elevation: 15,
        calories: 406,
        description: 'Vacker kustpromenad med fantastisk havsutsikt och lätt terräng.',
        source: 'OpenStreetMap',
        highlights: ['Havsutsikt', 'Kust', 'Lättlöpt'],
        coordinates: generateCircularRoute(parseFloat(lat), parseFloat(lng), 5.8),
        image: '/lopning1.png',
        matchScore: 90
      },
      {
        id: 'fallback-mountain-1',
        name: 'Bergstig - Serra de Tramuntana',
        distance: 7.2,
        duration: 52,
        difficulty: 'Svår',
        terrain: 'Berg',
        elevation: 180,
        calories: 504,
        description: 'Utmanande bergstig med spektakulär utsikt över ön.',
        source: 'OpenStreetMap',
        highlights: ['Bergsutsikt', 'Utmanande', 'Natur'],
        coordinates: generateCircularRoute(parseFloat(lat), parseFloat(lng), 7.2),
        image: '/lopning6.png',
        matchScore: 85
      },
      {
        id: 'fallback-beach-1',
        name: 'Strandpromenad - Playa Circuit',
        distance: 3.5,
        duration: 21,
        difficulty: 'Lätt',
        terrain: 'Strand',
        elevation: 5,
        calories: 245,
        description: 'Avslappnande löpning längs stranden med mjuk sand och havsbris.',
        source: 'OpenStreetMap',
        highlights: ['Strand', 'Havsbris', 'Återhämtning'],
        coordinates: generateCircularRoute(parseFloat(lat), parseFloat(lng), 3.5),
        image: '/lopning2.png',
        matchScore: 88
      }
    ];
  }
  
  // Default fallback for other locations
  return [
    {
      id: 'fallback-nature-1',
      name: 'Naturrutt - Lokala stigar',
      distance: 6.5,
      duration: 42,
      difficulty: 'Medel',
      terrain: 'Natur',
      elevation: 85,
      calories: 455,
      description: 'En vacker naturrutt genom lokala stigar med varierande terräng.',
      source: 'OpenStreetMap',
      highlights: ['Naturupplevelse', 'Lokala stigar', 'Varierande'],
      coordinates: generateCircularRoute(parseFloat(lat), parseFloat(lng), 6.5),
      image: '/lopning4.png',
      matchScore: 82
    },
    {
      id: 'fallback-urban-1',
      name: 'Stadsrunda - Urbana vägar',
      distance: 4.2,
      duration: 26,
      difficulty: 'Lätt',
      terrain: 'Urban',
      elevation: 25,
      calories: 294,
      description: 'Lättlöpt rutt genom urbana områden, perfekt för vardagsträning.',
      source: 'OpenStreetMap',
      highlights: ['Urban', 'Lättlöpt', 'Bekvämt'],
      coordinates: generateCircularRoute(parseFloat(lat), parseFloat(lng), 4.2),
      image: '/lopning2.png',
      matchScore: 88
    }
  ];
}

function generateApproximateCoordinates(nodeCount, centerLat = 59.3293, centerLng = 18.0686) {
  const coordinates = [];
  const radius = 0.005; // Even smaller radius to keep routes very close to center
  
  for (let i = 0; i < Math.min(nodeCount, 20); i++) {
    const angle = (i / nodeCount) * 2 * Math.PI;
    const distance = Math.random() * radius;
    const lat = centerLat + Math.cos(angle) * distance;
    const lng = centerLng + Math.sin(angle) * distance;
    coordinates.push([lat, lng]);
  }
  return coordinates;
}

module.exports = router; 