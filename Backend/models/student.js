const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Student {
    // Create new student WITH PASSWORD HASHING
    static async create(studentData) {
        console.log('Student.create received:', studentData);
        
        // ✅ FIXED: Destructure ALL required fields including student_id and is_active
        const { name, email, password, major, student_id, is_active } = studentData;
        
        // ✅ Validate required fields
        if (!name || !email || !password || !major || !student_id) {
            throw new Error('Missing required fields for student registration');
        }
        
        // ✅ Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 12); // 12 salt rounds
        
        console.log('Executing student insert with:', {
            name, email, major, student_id, is_active
        });
        
        const [result] = await db.execute(
            'INSERT INTO students (name, email, password, major, student_id, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, major, student_id, is_active || true]  // ✅ Fixed: 6 values for 6 placeholders
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
            'SELECT id, name, email, major, student_id, created_at FROM students WHERE id = ?', 
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
        const allowedFields = ['name', 'major', 'phone', 'skills'];
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