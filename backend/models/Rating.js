const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  // Vem som ger betyget
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Vem som får betyget
  ratee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Vilket event/aktivitet betyget gäller
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RunEvent',
    required: true
  },
  
  // Positiva kategorier (endast dessa syns)
  categories: {
    punctual: {
      type: Boolean,
      default: false,
      description: 'Kom i tid'
    },
    fittingPace: {
      type: Boolean,
      default: false,
      description: 'Höll utlovad nivå/tempo'
    },
    goodCommunication: {
      type: Boolean,
      default: false,
      description: 'Bra kommunikation'
    },
    motivating: {
      type: Boolean,
      default: false,
      description: 'Motiverande och uppmuntrande'
    },
    knowledgeable: {
      type: Boolean,
      default: false,
      description: 'Kunnig om löpning'
    },
    friendly: {
      type: Boolean,
      default: false,
      description: 'Trevlig och social'
    },
    wellPrepared: {
      type: Boolean,
      default: false,
      description: 'Välförberedd'
    },
    flexible: {
      type: Boolean,
      default: false,
      description: 'Flexibel och anpassningsbar'
    }
  },
  
  // Fritext kommentar (endast positiv)
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Övergripande betyg 1-5 stjärnor
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  
  // Flag för att markera att rating har granskats
  isApproved: {
    type: Boolean,
    default: true // Auto-godkänn positiva ratings
  },
  
  // För negativa rapporter till support (ej synliga för användare)
  reportToSupport: {
    hasReport: {
      type: Boolean,
      default: false
    },
    reportReason: {
      type: String,
      enum: ['late', 'inappropriate_behavior', 'safety_concern', 'misrepresentation', 'other']
    },
    reportDetails: {
      type: String,
      maxlength: 1000
    },
    isHandled: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index för att snabbt hitta ratings för en användare
RatingSchema.index({ ratee: 1, isApproved: 1 });
RatingSchema.index({ rater: 1 });
RatingSchema.index({ relatedEvent: 1 });

// Förhindra dubbelbetyg för samma event
RatingSchema.index({ rater: 1, ratee: 1, relatedEvent: 1 }, { unique: true });

// Virtuell för att räkna total poäng per kategori
RatingSchema.virtual('totalPositivePoints').get(function() {
  const categories = this.categories;
  return Object.values(categories).filter(val => val === true).length;
});

// Statisk metod för att beräkna användarens rating-statistik
RatingSchema.statics.getUserRatingStats = async function(userId) {
  const ratings = await this.find({ 
    ratee: userId, 
    isApproved: true 
  }).populate('rater', 'firstName lastName');
  
  if (ratings.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      categoryStats: {},
      level: 'Ny löpare',
      badge: null
    };
  }
  
  // Beräkna genomsnittligt betyg
  const averageRating = ratings.reduce((sum, rating) => sum + rating.overallRating, 0) / ratings.length;
  
  // Räkna kategorier
  const categoryStats = {
    punctual: 0,
    fittingPace: 0,
    goodCommunication: 0,
    motivating: 0,
    knowledgeable: 0,
    friendly: 0,
    wellPrepared: 0,
    flexible: 0
  };
  
  ratings.forEach(rating => {
    Object.keys(categoryStats).forEach(category => {
      if (rating.categories[category]) {
        categoryStats[category]++;
      }
    });
  });
  
  // Bestäm level och badge baserat på ratings
  let level = 'Ny löpare';
  let badge = null;
  
  if (ratings.length >= 5 && averageRating >= 4.5) {
    level = 'Superlöpare';
    badge = 'superstar';
  } else if (ratings.length >= 3 && averageRating >= 4.0) {
    level = 'Pålitlig löpare';
    badge = 'trusted';
  } else if (ratings.length >= 1 && averageRating >= 3.5) {
    level = 'Erfaren löpare';
    badge = 'experienced';
  }
  
  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalRatings: ratings.length,
    categoryStats,
    level,
    badge,
    recentRatings: ratings.slice(-5) // Senaste 5 ratings
  };
};

module.exports = mongoose.model('Rating', RatingSchema); 