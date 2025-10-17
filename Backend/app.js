// app.js - Main application setup
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const employerRoutes = require('./routes/employerRoutes');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
//const uploadRoutes = require('./routes/uploadRoutes'); // ✅ Added

// Import database connection
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// =====================
// 🌍 Middleware
// =====================
app.use(cors());
app.use(express.json());

// Serve static uploads (CVs, images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================
// 🚀 API Routes
// =====================
app.use('/api/students', studentRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
//app.use('/api/upload', uploadRoutes); // ✅ Added upload route

// =====================
// 🏠 Basic route
// =====================
app.get('/', (req, res) => {
    res.json({ 
        message: '🎓 Internship Portal API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            students: '/api/students',
            internships: '/api/internships',
            employers: '/api/employers',
            applications: '/api/applications',
            upload: '/api/upload'
        }
    });
});

// =====================
// ❤️ Health Check
// =====================
app.get('/health', async (req, res) => {
    try {
        await db.execute('SELECT 1');
        res.json({ 
            status: '✅ Healthy',
            database: '✅ Connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: '❌ Unhealthy',
            database: '❌ Connection failed',
            error: error.message 
        });
    }
});

// =====================
// 🚫 404 Handler
// =====================
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `The route ${req.originalUrl} does not exist` 
    });
});

// =====================
// 🚀 Start Server
// =====================
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}`);
});

module.exports = app; // Export for testing
