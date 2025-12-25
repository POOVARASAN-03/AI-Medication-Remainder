const express = require('express');
const router = express.Router();
const { triggerActiveReminders } = require('../cron/triggerReminders');
const { protect } = require('../middleware/authMiddleware');
const verifyCronSecret = require('../middleware/verifyCronSecret');
/**
 * @route   POST /api/cron/trigger
 * @desc    Manually trigger reminders for active prescriptions
 * @access  Private (requires authentication)
 */
router.post('/trigger',verifyCronSecret, async (req, res) => {
    try {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
        const currentDay = now.toISOString().split('T')[0];
        
        console.log('🕐 Server time:', currentTime, '| Date:', currentDay);
        
        const result = await triggerActiveReminders();
        
        res.status(200).json({
            success: true,
            message: 'Reminder check triggered successfully',
            serverTime: currentTime,
            serverDate: currentDay,
            data: result
        });
    } catch (error) {
        console.error('Error triggering reminders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to trigger reminders',
            error: error.message
        });
    }
});

module.exports = router;
