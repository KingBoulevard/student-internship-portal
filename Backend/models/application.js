const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

// Protected routes (require authentication)
router.get('/', auth, applicationController.getAllApplications);
router.get('/:id', auth, applicationController.getApplicationById);
router.post('/', auth, applicationController.createApplication);
router.put('/:id/status', auth, applicationController.updateApplicationStatus);

module.exports = router;