const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const auth = require('../middleware/auth');

// GET all employers (public or protected - you decide)
router.get('/', (req, res) => {
    res.json({ 
        message: 'Employers API is working!',
        endpoints: {
            'POST /register': 'Employer registration',
            'POST /login': 'Employer login',
            'GET /profile': 'Get employer profile (protected)',
            'GET /internships': 'Get employer internships (protected)',
            'GET /applications': 'Get applications (protected)'
        }
    });
});



// Public routes
router.post('/register', employerController.register);
router.post('/login', employerController.login);

// Protected routes (require authentication)
router.get('/profile', auth, employerController.getProfile);
router.get('/internships', auth, employerController.getMyInternships);
router.get('/applications', auth, employerController.getMyApplications);

module.exports = router;