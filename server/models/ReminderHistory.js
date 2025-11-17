const mongoose = require('mongoose');

const ReminderHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reminder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder',
    required: true,
  },
  medicineName: {
    type: String,
    required: true,
  },
  scheduledTime: {
    type: String,
    required: true,
  },
  triggerDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['sent', 'taken', 'missed'],
    default: 'sent',
  },
});

module.exports = mongoose.model('ReminderHistory', ReminderHistorySchema);
