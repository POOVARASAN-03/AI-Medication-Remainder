const express = require('express');
const { setReminder, getReminders, getReminderHistory, getRecentReminders, updateReminderStatus, setBatchReminders, getDailyAdherence } = require('../controllers/reminderController');
const { protect, serviceWorkerAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, setReminder).get(protect, getReminders);
router.post('/batch', protect, setBatchReminders);
router.get('/history', protect, getReminderHistory);
router.get('/recent', protect, getRecentReminders);
router.get('/daily-adherence', protect, getDailyAdherence);
router.route('/:id').put(serviceWorkerAuth, updateReminderStatus);

module.exports = router;
