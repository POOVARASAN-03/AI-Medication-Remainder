const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
  },
  medicines: [
    {
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
    },
  ],
  interactions: [
    {
      med1: String,
      med2: String,
      severity: String,
      note: String,
    },
  ],
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
