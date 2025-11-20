const express = require('express');
const { uploadPrescription, getUserPrescriptions, getPrescriptionById } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../services/uploadService');

const router = express.Router();

router.post('/upload', protect, upload.single('image'), uploadPrescription);
router.get('/', protect, getUserPrescriptions);
router.get('/:id', protect, getPrescriptionById);

module.exports = router;
