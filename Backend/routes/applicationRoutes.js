const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

// Create new application
router.post('/', auth, applicationController.createApplication);

// Update application status
router.put('/:id/status', auth, applicationController.updateApplicationStatus);

// Get applications by student ID
router.get('/student/:studentId', auth, applicationController.getApplicationsByStudent);

module.exports = router;
