const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Student {
    // Create new student WITH PASSWORD HASHING
    static async create(studentData) {
        const { name, email, password, major, gpa } = studentData;
        
        // ✅ Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 12); // 12 salt rounds
        
        const [result] = await db.execute(
            'INSERT INTO students (name, email, password, major, gpa) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, major, gpa]  // ✅ Store hashed password
        );
        return result.insertId;
    }

    // Find student by email (for login)
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM students WHERE email = ?', [email]);
        return rows[0];
    }

    // Verify password during login
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Get student without password (for safe data retrieval)
    static async getByIdSafe(id) {
        const [rows] = await db.execute(
            'SELECT id, name, email, major, gpa, created_at FROM students WHERE id = ?', 
            [id]
        );
        return rows[0];
    }

    // Add these methods to your existing Student model
   static async findByIdWithPassword(id) {
        const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
        return rows[0];
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const [result] = await db.execute(
            'UPDATE students SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows;
    }

    static async update(id, updateData) {
        const allowedFields = ['name', 'major', 'gpa', 'phone', 'skills'];
        const fieldsToUpdate = {};
    
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                fieldsToUpdate[field] = updateData[field];
            }
        });

        if (Object.keys(fieldsToUpdate).length === 0) {
            return 0;
        }

        const setClause = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
        const values = Object.values(fieldsToUpdate);
        values.push(id);

        const [result] = await db.execute(
            `UPDATE students SET ${setClause} WHERE id = ?`,
            values
        );
        return result.affectedRows;
    }
}

module.exports = Student;