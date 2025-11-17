const express = require('express');
const { getMedicalChatResponse } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/medical', protect, getMedicalChatResponse);

module.exports = router;
