// Backend/controllers/applicationController.js
const db = require('../config/db');

const applicationController = {
  // ✅ Get all applications (admin or debug)
  getAllApplications: async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, s.name AS student_name, i.title AS internship_title, e.company_name 
         FROM applications a
         JOIN students s ON a.student_id = s.id
         JOIN internships i ON a.internship_id = i.id
         JOIN employers e ON i.employer_id = e.id
         ORDER BY a.created_at DESC`
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching all applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  },

  // ✅ Get single application by ID
  getApplicationById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await db.execute(
        `SELECT a.*, s.name AS student_name, s.email AS student_email,
                i.title AS internship_title, e.company_name
         FROM applications a
         JOIN students s ON a.student_id = s.id
         JOIN internships i ON a.internship_id = i.id
         JOIN employers e ON i.employer_id = e.id
         WHERE a.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching application by ID:', error);
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  },

  // ✅ Student applies for an internship
  createApplication: async (req, res) => {
    try {
      const { student_id, internship_id, cover_letter } = req.body;

      if (!student_id || !internship_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if already applied
      const [existing] = await db.execute(
        `SELECT id FROM applications WHERE student_id = ? AND internship_id = ?`,
        [student_id, internship_id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'You have already applied for this internship' });
      }

      const [result] = await db.execute(
        `INSERT INTO applications (student_id, internship_id, cover_letter, status) VALUES (?, ?, ?, 'Pending')`,
        [student_id, internship_id, cover_letter || '']
      );

      res.status(201).json({
        message: 'Application submitted successfully',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ error: 'Failed to create application' });
    }
  },

  // ✅ Update application status (used by employers/admin)
  updateApplicationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['Pending', 'Reviewed', 'Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const [result] = await db.execute(
        `UPDATE applications SET status = ? WHERE id = ?`,
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      res.json({ message: 'Application status updated successfully' });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ error: 'Failed to update application status' });
    }
  },

  // ✅ Get all applications for a specific student
  getApplicationsByStudent: async (req, res) => {
    try {
      const { studentId } = req.params;

      const [rows] = await db.execute(
        `SELECT a.id, a.status, a.created_at,
                i.title AS internship_title,
                e.company_name AS employer_name
         FROM applications a
         JOIN internships i ON a.internship_id = i.id
         JOIN employers e ON i.employer_id = e.id
         WHERE a.student_id = ?
         ORDER BY a.created_at DESC`,
        [studentId]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error fetching student applications:', error);
      res.status(500).json({ error: 'Failed to fetch student applications' });
    }
  }
};

module.exports = applicationController;
