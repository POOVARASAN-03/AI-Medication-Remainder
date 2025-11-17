const Reminder = require('../models/Reminder');
const ReminderHistory = require('../models/ReminderHistory');

// @desc    Set a new reminder
// @route   POST /api/reminders
// @access  Private
const setReminder = async (req, res) => {
  const { prescription, medicineName, time, startDate, endDate } = req.body;

  if (!prescription || !medicineName || !time || !startDate || !endDate) {
    return res.status(400).json({ message: 'Please provide all reminder details' });
  }

  try {
    const reminder = await Reminder.create({
      user: req.user._id,
      prescription,
      medicineName,
      time,
      startDate,
      endDate,
    });

    res.status(201).json({ message: 'Reminder set successfully', reminder });
  } catch (error) {
    console.error('Error setting reminder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).populate('prescription', 'image');
    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reminder history for a user
// @route   GET /api/reminders/history
// @access  Private
const getReminderHistory = async (req, res) => {
  try {
    const history = await ReminderHistory.find({ user: req.user._id }).sort({ triggerDate: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching reminder history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update reminder status (e.g., taken/missed)
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const reminderHistory = await ReminderHistory.findById(id);

    if (!reminderHistory) {
      return res.status(404).json({ message: 'Reminder history entry not found' });
    }

    if (reminderHistory.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this reminder' });
    }

    reminderHistory.status = status;
    await reminderHistory.save();

    res.status(200).json({ message: 'Reminder status updated successfully', reminderHistory });
  } catch (error) {
    console.error('Error updating reminder status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { setReminder, getReminders, getReminderHistory, updateReminderStatus };
