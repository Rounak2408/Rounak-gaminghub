const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameName: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

scoreSchema.index({ gameName: 1, score: -1 });
scoreSchema.index({ userId: 1, gameName: 1 });

module.exports = mongoose.model('Score', scoreSchema);
