const Reminder = require('../models/Reminder');
const ReminderHistory = require('../models/ReminderHistory');
const Prescription = require('../models/Prescription'); // Import Prescription model
const User = require('../models/User'); // Import User model

// @desc    Set a new reminder
// @route   POST /api/reminders
// @access  Private
const setReminder = async (req, res) => {
  const { prescription, medicineName, timeSlot, startDate, endDate, notificationMethod, whatsappNumber } = req.body; // Added whatsappNumber
  console.log('1. whatsappNumber from req.body:', whatsappNumber);

  if (!prescription || !medicineName || !timeSlot || !startDate || !endDate || !notificationMethod) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await User.findById(req.user._id); // Fetch the user
    if (!user) return res.status(404).json({ message: "User not found or not authenticated" });

    const timeMap = {
      morning: "08:00",
      afternoon: "13:00",
      evening: "18:00",
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

    // Determine which WhatsApp number to use (frontend provided or user profile)
    let finalWhatsappNumber = whatsappNumber || user.whatsappNumber; // Prioritize frontend provided
    console.log('2. finalWhatsappNumber (after prioritization):', finalWhatsappNumber);
    let formattedWhatsappNumber = undefined; // Default to undefined

    if ((notificationMethod === 'whatsapp' || notificationMethod === 'both') && finalWhatsappNumber) {
      // Remove any existing 'whatsapp:' prefix and leading '+' if present for consistent re-formatting
      let cleanedNumber = finalWhatsappNumber.replace(/^(whatsapp:\+?|\+)/, '');
      console.log('3. cleanedNumber (after stripping prefixes):', cleanedNumber);

      // Add 'whatsapp:+' prefix
      formattedWhatsappNumber = `whatsapp:+${cleanedNumber}`;
      console.log('4. formattedWhatsappNumber (final format):', formattedWhatsappNumber);
    }

    console.log('5. Creating new reminder with whatsappNumber:', formattedWhatsappNumber);
    const newReminder = await Reminder.create({
      user: req.user._id,
      prescription,
      medicineName,
      dosage: selectedMedicine.dosage, // Get dosage from selected medicine
      time,
      startDate,
      endDate,
      notifyBy: notificationMethod,
      whatsappNumber: formattedWhatsappNumber,
      email: (notificationMethod === 'email' || notificationMethod === 'both') ? user.email : undefined,
      status: 'active',
    });

    // If a WhatsApp number was provided and successfully formatted, update the user's profile
    if (whatsappNumber && formattedWhatsappNumber) {
        console.log('6. Updating user whatsappNumber to:', formattedWhatsappNumber);
        user.whatsappNumber = formattedWhatsappNumber;
        await user.save();
    }

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
      filter.prescription = req.query.prescriptionId;
    }

    const reminders = await Reminder.find(filter).populate('prescription', 'image');
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
