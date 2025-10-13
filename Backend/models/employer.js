const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Employer {
    // Create new employer
    static async create(employerData) {
        const { user_id, company_name, company_website, email, password } = employerData;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const [result] = await db.execute(
            'INSERT INTO employers (user_id, company_name, company_website, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, company_name, company_website, email, password]
        );
        return result.insertId;
    }

    // Find employer by email
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM employers WHERE email = ?', [email]);
        return rows[0];
    }

    // Get employer by ID
    static async getById(id) {
        const [rows] = await db.execute('SELECT user_id, company_name, company_website, email, password FROM employers WHERE id = ?', [id]);
        return rows[0];
    }

    // Get internships posted by employer
    static async getInternships(employerId) {
        const [rows] = await db.execute(
            'SELECT * FROM internships WHERE employer_id = ? ORDER BY created_at DESC',
            [employerId]
        );
        return rows;
    }

    // Get applications for employer's internships
    static async getApplications(employerId) {
        const [rows] = await db.execute(
            `SELECT a.*, s.name as student_name, s.major, i.title as internship_title 
             FROM applications a 
             JOIN students s ON a.student_id = s.id 
             JOIN internships i ON a.internship_id = i.id 
             WHERE a.employer_id = ? 
             ORDER BY a.applied_at DESC`,
            [employerId]
        );
        return rows;
    }

    // Add similar methods to Employer model
    static async findByIdWithPassword(id) {
        const [rows] = await db.execute('SELECT * FROM employers WHERE id = ?', [id]);
        return rows[0];
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const [result] = await db.execute(
            'UPDATE employers SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows;
    }
}

module.exports = Employer;