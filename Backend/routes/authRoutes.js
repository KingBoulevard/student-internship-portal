const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
    res.json({ 
        message: 'Auth API is working!',
        endpoints: {
            'POST /login': 'User login (automatic user type detection)',
            'POST /register': 'User registration', 
            'GET /profile': 'Get user profile (protected)',
            'PUT /profile': 'Update profile (protected)',
            'PUT /change-password': 'Change password (protected)',
            'GET /verify': 'Verify token (protected)'
        },
        note: 'User type is automatically detected by email domain'
    });
});


// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes (require authentication)
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);
router.get('/verify', auth, authController.verifyToken);

module.exports = router;