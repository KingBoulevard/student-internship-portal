const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const studentController = {
    // Student registration with password hashing
    register: async (req, res) => {
        try {
            const { name, email, password, major, gpa } = req.body;
            
            // This checks if a student already exists
            const existingStudent = await Student.findByEmail(email);
            if (existingStudent) {
                return res.status(400).json({ error: 'Student already exists with this email' });
            }

            const studentId = await Student.create(req.body);
            res.status(201).json({ 
                message: 'Student registered successfully', 
                id: studentId 
            });
        } catch (error) {
            console.error('Error registering student:', error);
            res.status(500).json({ error: 'Failed to register student' });
        }
    },

    // Student login with password verification
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Find student
            const student = await Student.findByEmail(email);
            if (!student) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, student.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: student.id, email: student.email, type: 'student' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Return safe student data (without password)
            res.json({ 
                message: 'Login successful',
                token,
                student: {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    major: student.major,
                }
            });
        } catch (error) {
            console.error('Error during student login:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    // Get student profile (without password)
    getProfile: async (req, res) => {
        try {
            const student = await Student.getByIdSafe(req.params.id);
            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }
            res.json(student);
        } catch (error) {
            console.error('Error fetching student:', error);
            res.status(500).json({ error: 'Failed to fetch student' });
        }
    }
};

module.exports = studentController;