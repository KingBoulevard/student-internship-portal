const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const auth = require('../middleware/auth');
const db = require('../config/db');

// Public routes
router.post('/register', employerController.register);
router.post('/login', employerController.login);

// Protected routes
router.get('/profile', auth, employerController.getProfile);
router.get('/internships', auth, employerController.getMyInternships);
router.get('/applications', auth, employerController.getMyApplications);


// GET current employer info
router.get('/me', auth, async (req, res) => {
  try {
    // Make sure only employers can access this
    if (req.user.role !== 'employer') {
      return res.status(403).json({ success: false, message: "Forbidden: Not an employer" });
    }

    // Fetch employer from DB
    const [employer] = await db.promise().query(
      'SELECT id, name, company_name, email FROM employers WHERE id = ?',
      [req.user.id]
    );

    if (!employer || employer.length === 0) {
      return res.status(404).json({ success: false, message: "Employer not found" });
    }

    res.json({ success: true, employer: employer[0] });
  } catch (error) {
    console.error("Error fetching employer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
