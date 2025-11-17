const express = require('express');
const { setReminder, getReminders, getReminderHistory, updateReminderStatus } = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, setReminder).get(protect, getReminders);
router.get('/history', protect, getReminderHistory);
router.route('/:id').put(protect, updateReminderStatus);

module.exports = router;
