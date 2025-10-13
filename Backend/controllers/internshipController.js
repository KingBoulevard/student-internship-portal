const Internship = require('../models/internship');

const internshipController = {
    // Get all internships
    getAllInternships: async (req, res) => {
        try {
            const internships = await Internship.getAll();
            res.json(internships);
        } catch (error) {
            console.error('Error fetching internships:', error);
            res.status(500).json({ error: 'Failed to fetch internships' });
        }
    },

    // Get internship by ID
    getInternshipById: async (req, res) => {
        try {
            const internship = await Internship.getById(req.params.id);
            if (!internship) {
                return res.status(404).json({ error: 'Internship not found' });
            }
            res.json(internship);
        } catch (error) {
            console.error('Error fetching internship:', error);
            res.status(500).json({ error: 'Failed to fetch internship' });
        }
    },

    // Create new internship
    createInternship: async (req, res) => {
        try {
            const internshipId = await Internship.create(req.body);
            res.status(201).json({ 
                message: 'Internship created successfully', 
                id: internshipId 
            });
        } catch (error) {
            console.error('Error creating internship:', error);
            res.status(500).json({ error: 'Failed to create internship' });
        }
    }
};

module.exports = internshipController;