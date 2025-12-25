const express = require('express');
const router = express.Router();
const User = require('../models/User');
const fcmService = require('../services/fcmService');

// Store FCM token
router.post('/store-fcm-token', async (req, res) => {
  const { userId, fcmToken } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { fcmToken });
    res.status(200).json({ message: 'FCM token stored successfully' });
    console.log('Stored FCM Token for user:', userId, 'Token:', fcmToken);
  } catch (error) {
    console.error('Error storing FCM token:', error);
    res.status(500).json({ message: 'Failed to store FCM token' });
  }
});

// Test notification
router.post('/test-notification', async (req, res) => {
  try {
    const { message } = req.body;
    const testToken = 'YOUR_TEST_DEVICE_TOKEN'; // Replace with a valid FCM token for testing

    await fcmService.sendNotification(testToken, {
      notification: {
        title: 'Test Notification',
        body: message,
      },
    });

    res.status(200).json({ message: 'Notification sent successfully!' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send notification.' });
  }
});

module.exports = router;