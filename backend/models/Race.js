const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  distance: {
    type: Number,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['marathon', 'half-marathon', 'ultra', '10k', '12k', '5k', 'trail', 'obstacle', 'scenic', 'midnight'],
    index: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Extreme'],
    index: true
  },
  description: {
    type: String,
    required: true
  },
  keyFeatures: [{
    type: String
  }],
  terrain: {
    type: String,
    required: true
  },
  elevation: {
    total: String,
    profile: String,
    max: String,
    min: String
  },
  weather: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  trainingFocus: [{
    type: String
  }],
  registrationUrl: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  
  // Additional race information
  history: String,
  tips: [String],
  
  // Official race data (from scraping)
  officialData: {
    raceDate: String,
    entryFee: String,
    cutoffTime: String,
    aidStations: [String],
    courseMap: String
  },
  
  // Metadata
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0,
    index: true
  },
  
  // For search functionality
  searchTags: [{
    type: String,
    index: true
  }]
}, {
  timestamps: true
});

// Index för bättre sökprestanda
raceSchema.index({ name: 'text', location: 'text', description: 'text' });
raceSchema.index({ type: 1, difficulty: 1 });
raceSchema.index({ distance: 1, type: 1 });

// Virtual för att generera search tags automatiskt
raceSchema.virtual('generatedSearchTags').get(function() {
  const tags = [];
  
  // Lägg till grundläggande tags
  tags.push(this.type, this.difficulty.toLowerCase());
  
  // Lägg till distans-baserade tags
  if (this.distance <= 5) tags.push('short-distance');
  else if (this.distance <= 10) tags.push('medium-distance');
  else if (this.distance <= 21.1) tags.push('long-distance');
  else if (this.distance <= 42.195) tags.push('marathon-distance');
  else tags.push('ultra-distance');
  
  // Lägg till land/region tags
  if (this.location.includes('USA')) tags.push('usa', 'america');
  if (this.location.includes('Sweden')) tags.push('sweden', 'nordic', 'scandinavia');
  if (this.location.includes('UK') || this.location.includes('London')) tags.push('uk', 'britain');
  if (this.location.includes('Germany')) tags.push('germany', 'europe');
  if (this.location.includes('France')) tags.push('france', 'europe');
  if (this.location.includes('Japan')) tags.push('japan', 'asia');
  
  // Lägg till terrain tags
  if (this.terrain.includes('trail')) tags.push('trail', 'off-road');
  if (this.terrain.includes('road')) tags.push('road', 'street');
  if (this.terrain.includes('hill')) tags.push('hilly', 'elevation');
  if (this.terrain.includes('flat')) tags.push('flat', 'fast');
  
  // Lägg till special feature tags
  this.keyFeatures.forEach(feature => {
    if (feature.toLowerCase().includes('hill')) tags.push('hills');
    if (feature.toLowerCase().includes('bridge')) tags.push('bridges');
    if (feature.toLowerCase().includes('scenic')) tags.push('scenic');
    if (feature.toLowerCase().includes('historic')) tags.push('historic');
  });
  
  return [...new Set(tags)]; // Remove duplicates
});

// Pre-save middleware för att uppdatera search tags
raceSchema.pre('save', function(next) {
  this.searchTags = this.generatedSearchTags;
  next();
});

// Static methods för att hitta lopp
raceSchema.statics.findByType = function(type) {
  return this.find({ type: type, isActive: true }).sort({ popularity: -1 });
};

raceSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty: difficulty, isActive: true }).sort({ popularity: -1 });
};

raceSchema.statics.findByDistance = function(minDistance, maxDistance) {
  return this.find({ 
    distance: { $gte: minDistance, $lte: maxDistance },
    isActive: true 
  }).sort({ distance: 1 });
};

raceSchema.statics.searchRaces = function(query) {
  return this.find({
    $or: [
      { $text: { $search: query } },
      { searchTags: { $in: [new RegExp(query, 'i')] } },
      { name: new RegExp(query, 'i') },
      { location: new RegExp(query, 'i') }
    ],
    isActive: true
  }).sort({ popularity: -1 });
};

// Instance methods
raceSchema.methods.getTrainingPlan = function(userLevel, timeToRace) {
  // Denna metod kan senare användas för att generera träningsplaner
  // baserat på loppets egenskaper
  return {
    raceId: this._id,
    raceName: this.name,
    trainingFocus: this.trainingFocus,
    difficulty: this.difficulty,
    recommendations: this.generateRecommendations(userLevel, timeToRace)
  };
};

raceSchema.methods.generateRecommendations = function(userLevel, timeToRace) {
  const recommendations = [];
  
  // Baserat på loppets svårighetsgrad
  if (this.difficulty === 'Extreme' && userLevel === 'Beginner') {
    recommendations.push('Consider starting with a shorter distance first');
    recommendations.push('Build significant base mileage before attempting');
  }
  
  // Baserat på tid kvar
  if (timeToRace < 12 && this.distance >= 42.195) {
    recommendations.push('12+ weeks recommended for marathon training');
    recommendations.push('Consider a shorter race if time is limited');
  }
  
  // Baserat på terrain
  if (this.terrain.includes('hill') || this.terrain.includes('mountain')) {
    recommendations.push('Include hill training in your routine');
    recommendations.push('Practice downhill running technique');
  }
  
  if (this.type === 'trail') {
    recommendations.push('Train on similar terrain when possible');
    recommendations.push('Focus on technical running skills');
  }
  
  return recommendations;
};

// Export model
const Race = mongoose.model('Race', raceSchema);

module.exports = Race; 