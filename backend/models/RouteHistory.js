const mongoose = require('mongoose');

const routeHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  origin: {
    type: String,
    required: [true, 'Please add origin coordinates'],
  },
  destination: {
    type: String,
    required: [true, 'Please add destination coordinates'],
  },
  selectedRoute: {
    type: Object,
    required: [true, 'Please add selected route data'],
  },
  environmentalScore: {
    type: Number,
    required: [true, 'Please add environmental score'],
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

// Index for faster queries
routeHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('RouteHistory', routeHistorySchema);