const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  med1: {
    type: String,
    required: true,
  },
  med2: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    required: true,
  },
  note: {
    type: String,
  },
});

module.exports = mongoose.model('Interaction', InteractionSchema);
