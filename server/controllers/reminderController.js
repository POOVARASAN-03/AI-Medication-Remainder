const Reminder = require('../models/Reminder');
const ReminderHistory = require('../models/ReminderHistory');
const Prescription = require('../models/Prescription'); // Import Prescription model
const User = require('../models/User'); // Import User model
const mongoose = require('mongoose'); // Import mongoose

// @desc    Set a new reminder
// @route   POST /api/reminders
// @access  Private
const setReminder = async (req, res) => {
  const { prescription, medicineName, timeSlot, startDate, endDate } = req.body;

  if (!prescription || !medicineName || !timeSlot || !startDate || !endDate) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found or not authenticated" });

    const timeMap = {
      morning: "08:00",
      afternoon: "13:00",
      evening: "17:00",
      night: "21:00",
    };

    const time = timeMap[timeSlot];
    if (!time) {
      return res.status(400).json({ message: "Invalid time slot provided" });
    }

    // Get medicine dosage from the prescription's medicines array
    const pres = await Prescription.findById(prescription);
    if (!pres) return res.status(404).json({ message: "Prescription not found" });
    const selectedMedicine = pres.medicines.find(med => med.name === medicineName);
    if (!selectedMedicine) {
      return res.status(404).json({ message: `Medicine '${medicineName}' not found in prescription` });
    }

    const newReminder = await Reminder.create({
      user: req.user._id,
      prescription,
      medicineName,
      dosage: selectedMedicine.dosage,
      time,
      startDate,
      endDate,
      status: 'active',
    });

    res.status(201).json({
      message: "Reminder set successfully",
      reminder: newReminder,
    });

  } catch (err) {
    console.error("Error setting reminder:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    // Added filter by prescriptionId for PrescriptionViewPage to fetch specific reminders
    const filter = { user: req.user._id, status: 'active' };
    if (req.query.prescriptionId) {
      // Validate prescriptionId before adding to filter
      if (mongoose.Types.ObjectId.isValid(req.query.prescriptionId)) {
        filter.prescription = req.query.prescriptionId;
      } else {
        // If it's an invalid ObjectId string (like "undefined"), log and don't filter by prescription
        console.warn(`Invalid prescriptionId received: ${req.query.prescriptionId}`);
      }
    }

    const reminders = await Reminder.find(filter).populate('prescription', 'name image');
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

// @desc    Get recent reminders for notification dropdown
// @route   GET /api/reminders/recent
// @access  Private
const getRecentReminders = async (req, res) => {
  try {
    const recentReminders = await ReminderHistory.find({ user: req.user._id })
      .sort({ triggerDate: -1 })
      .limit(5)
      .populate('reminder', 'medicineName dosage');
    res.status(200).json(recentReminders);
  } catch (error) {
    console.error('Error fetching recent reminders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update reminder status (e.g., taken/missed)
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminderStatus = async (req, res) => {
  const { status } = req.body;
  // Get reminderHistoryId from the authenticated service worker token payload
  const reminderHistoryId = req.reminderHistoryId;

  if (!reminderHistoryId) {
    return res.status(400).json({ message: 'Reminder history ID is missing from token' });
  }

  try {
    const reminderHistory = await ReminderHistory.findById(reminderHistoryId);

    if (!reminderHistory) {
      return res.status(404).json({ message: 'Reminder history entry not found' });
    }

    // The user ID should also be in the token payload if needed for extra verification
    // For this flow, we already verified the token's purpose and user ID in serviceWorkerAuth middleware
    if (req.user && reminderHistory.user.toString() !== req.user._id.toString()) {
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

// @desc    Set multiple reminders
// @route   POST /api/reminders/batch
// @access  Private
const setBatchReminders = async (req, res) => {
  const { reminders } = req.body;

  if (!reminders || !Array.isArray(reminders) || reminders.length === 0) {
    return res.status(400).json({ message: "No reminders provided" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const createdReminders = [];
    const errors = [];

    for (const reminderData of reminders) {
      const { prescription, medicineName, timeSlot, startDate, endDate, time: customTime } = reminderData;

      // Use customTime if provided (for batch mode where we pre-calculate time), otherwise use timeSlot map
      let time = customTime;
      if (!time && timeSlot) {
        const timeMap = {
          morning: "08:00",
          afternoon: "13:00",
          evening: "17:00",
          night: "21:00",
        };
        time = timeMap[timeSlot];
      }

      if (!time) {
        errors.push({ medicineName, message: "Invalid time" });
        continue;
      }

      // Get medicine dosage
      const pres = await Prescription.findById(prescription);
      if (!pres) {
        errors.push({ medicineName, message: "Prescription not found" });
        continue;
      }

      const selectedMedicine = pres.medicines.find(med => med.name === medicineName);
      if (!selectedMedicine) {
        errors.push({ medicineName, message: "Medicine not found in prescription" });
        continue;
      }

      const newReminder = await Reminder.create({
        user: req.user._id,
        prescription,
        medicineName,
        dosage: selectedMedicine.dosage,
        time,
        startDate,
        endDate,
        status: 'active',
      });

      createdReminders.push(newReminder);
    }

    res.status(201).json({
      message: `Successfully created ${createdReminders.length} reminders`,
      reminders: createdReminders,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error("Error setting batch reminders:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Get daily adherence data for a user within a date range
// @route   GET /api/reminders/daily-adherence
// @access  Private
const getDailyAdherence = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // YYYY-MM-DD format

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const user = await User.findById(req.user._id); // Fetch user to get createdAt
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userCreationDate = new Date(user.createdAt);
    userCreationDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const dailyAdherence = {};

    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const dateString = currentDate.toISOString().split('T')[0];

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to start of day
      const dayToProcess = new Date(currentDate);
      dayToProcess.setHours(0, 0, 0, 0); // Normalize current loop date to start of day

      // Determine if adherence should be calculated or set to null
      let calculatedPercentage = null;
      let totalExpected = 0;
      let totalTaken = 0;

      // If it's a future date or before user creation, don't calculate adherence
      if (dayToProcess < userCreationDate || dayToProcess > today) {
        calculatedPercentage = null;
      } else {
        // Calculate expected reminders for the day from the Reminder model
        totalExpected = await Reminder.countDocuments({
          user: req.user._id,
          status: 'active',
          startDate: { $lte: dateString },
          endDate: { $gte: dateString },
        });

        // Calculate taken reminders for the day from ReminderHistory
        // Create date range for the entire day (00:00:00 to 23:59:59)
        const startOfDay = new Date(dateString);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateString);
        endOfDay.setHours(23, 59, 59, 999);
        
        totalTaken = await ReminderHistory.countDocuments({
          user: req.user._id,
          triggerDate: { $gte: startOfDay, $lte: endOfDay },
          status: 'taken',
        });

        // Calculate percentage
        if (totalExpected > 0) {
          calculatedPercentage = Math.round((totalTaken / totalExpected) * 100);
        } else {
          calculatedPercentage = null; // No reminders expected for this day
        }

        // Special handling for the current day: if no meds taken yet, show as null
        if (dayToProcess.getTime() === today.getTime() && totalExpected > 0 && totalTaken === 0) {
          calculatedPercentage = null;
        }
      }

      dailyAdherence[dateString] = {
        total: totalExpected,
        taken: totalTaken,
        percentage: calculatedPercentage,
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json(dailyAdherence);
  } catch (error) {
    console.error('Error fetching daily adherence:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { setReminder, getReminders, getReminderHistory, getRecentReminders, updateReminderStatus, setBatchReminders, getDailyAdherence };
