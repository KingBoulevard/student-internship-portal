// Backend/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

// ✅ Test route
router.get('/', (req, res) => {
  res.json({ message: '🎓 Students API is active!' });
});

// ✅ Get specific student profile (protected)
router.get('/:id', auth, studentController.getProfile);

module.exports = router;
