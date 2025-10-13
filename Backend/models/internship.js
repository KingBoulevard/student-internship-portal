const db = require('../config/db');

class Internship {
    // Create new internship (now with employer_id)
    static async create(internshipData) {
        const { title, company, description, requirements, deadline, employer_id } = internshipData;
        const [result] = await db.execute(
            'INSERT INTO internships (title, company, description, requirements, deadline, employer_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, company, description, requirements, deadline, employer_id]
        );
        return result.insertId;
    }

    // Get internships with employer info
    static async getAll() {
        const [rows] = await db.execute(
            `SELECT i.*, e.company_name, e.website 
             FROM internships i 
             LEFT JOIN employers e ON i.employer_id = e.id 
             WHERE i.is_active = 1`
        );
        return rows;
    }
}

module.exports = Internship;