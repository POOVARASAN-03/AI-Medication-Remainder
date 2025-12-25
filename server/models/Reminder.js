const mongoose = require('mongoose');

const reminderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },

    // Time to trigger reminder
    time: {
      type: String, // Format: "HH:MM"
      required: true,
    },

    // Date Range
    startDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    endDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reminder', reminderSchema);
