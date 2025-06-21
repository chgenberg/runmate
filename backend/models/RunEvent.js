const mongoose = require('mongoose');

const RunEventSchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for the run.'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  location: {
    name: { type: String, required: true },
    point: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      }
    }
  },
  distance: { // in kilometers
    type: Number,
    required: true,
  },
  pace: { // seconds per km
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  maxParticipants: {
    type: Number,
    default: 4,
    min: 2
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pendingRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'full', 'in-progress', 'completed', 'cancelled'],
    default: 'open',
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }
}, { timestamps: true });

RunEventSchema.pre('save', function(next) {
  if (this.isNew) {
    this.participants.push(this.host);
  }
  next();
});

RunEventSchema.index({ 'location.point': '2dsphere' });

module.exports = mongoose.model('RunEvent', RunEventSchema); 