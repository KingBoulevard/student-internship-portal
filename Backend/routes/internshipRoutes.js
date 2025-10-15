const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');

// GET /api/internships - Get all internships
router.get('/', internshipController.getAllInternships);

// GET /api/internships/:id - Get internship by ID
router.get('/:id', internshipController.getInternshipById);

// POST /api/internships - Create new internship
router.post('/', internshipController.createInternship);

module.exports = router;