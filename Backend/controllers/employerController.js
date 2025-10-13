const Employer = require('../models/employer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const employerController = {
    // Employer registration
    register: async (req, res) => {
        try {
            const { company_name, email, password, industry, company_size, website, description, contact_person, phone } = req.body;
            
            // Check if employer already exists
            const existingEmployer = await Employer.findByEmail(email);
            if (existingEmployer) {
                return res.status(400).json({ error: 'Employer already exists with this email' });
            }

            const employerId = await Employer.create(req.body);
            res.status(201).json({ 
                message: 'Employer registered successfully', 
                id: employerId 
            });
        } catch (error) {
            console.error('Error registering employer:', error);
            res.status(500).json({ error: 'Failed to register employer' });
        }
    },

    // Employer login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            const employer = await Employer.findByEmail(email);
            if (!employer) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isPasswordValid = await bcrypt.compare(password, employer.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: employer.id, email: employer.email, type: 'employer' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ 
                message: 'Login successful',
                token,
                employer: {
                    id: employer.id,
                    company_name: employer.company_name,
                    email: employer.email,
                    is_verified: employer.is_verified
                }
            });
        } catch (error) {
            console.error('Error during employer login:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    // Get employer profile
    getProfile: async (req, res) => {
        try {
            const employer = await Employer.getById(req.user.id);
            if (!employer) {
                return res.status(404).json({ error: 'Employer not found' });
            }
            res.json(employer);
        } catch (error) {
            console.error('Error fetching employer profile:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    },

    // Get employer's internships
    getMyInternships: async (req, res) => {
        try {
            const internships = await Employer.getInternships(req.user.id);
            res.json(internships);
        } catch (error) {
            console.error('Error fetching internships:', error);
            res.status(500).json({ error: 'Failed to fetch internships' });
        }
    },

    // Get applications for employer's internships
    getMyApplications: async (req, res) => {
        try {
            const applications = await Employer.getApplications(req.user.id);
            res.json(applications);
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ error: 'Failed to fetch applications' });
        }
    }
};

module.exports = employerController;