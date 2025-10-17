// Backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

// ✅ Get all applications (admin or debug use)
router.get('/', auth, applicationController.getAllApplications);

// ✅ Get single application by ID
router.get('/:id', auth, applicationController.getApplicationById);

// ✅ Create new application (student applies for internship)
router.post('/', auth, applicationController.createApplication);

// ✅ Update application status (for employer/admin)
router.put('/:id/status', auth, applicationController.updateApplicationStatus);

// ✅ Get applications by student ID (for student dashboard)
router.get('/student/:studentId', auth, applicationController.getApplicationsByStudent);

module.exports = router;
