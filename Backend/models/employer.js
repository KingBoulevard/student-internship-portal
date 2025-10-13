const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Employer {
    // Create new employer - UPDATED FOR YOUR ACTUAL DATABASE SCHEMA
    static async create(employerData) {
        try {
            console.log('Employer.create received:', employerData);
            
            // Hash password
            const hashedPassword = await bcrypt.hash(employerData.password, 12);
            
            // 🎯 ONLY USE COLUMNS THAT ACTUALLY EXIST IN YOUR DATABASE
            const [result] = await db.execute(
                'INSERT INTO employers (company_name, email, password, industry) VALUES (?, ?, ?, ?)',
                [
                    employerData.company_name,
                    employerData.email,
                    hashedPassword,
                    employerData.industry || 'Technology'
                ]
                // Removed: is_active, is_verified since they don't exist in your table
            );
            
            console.log('Employer created successfully with ID:', result.insertId);
            return result.insertId;
            
        } catch (error) {
            console.error('Employer.create error:', error);
            throw error;
        }
    }

    // Update findByEmail to handle missing columns
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM employers WHERE email = ?', [email]);
        const user = rows[0];
        
        // 🎯 Add default values for missing columns in code
        if (user) {
            user.is_active = user.is_active !== undefined ? user.is_active : true;
            user.is_verified = user.is_verified !== undefined ? user.is_verified : false;
        }
        
        return user;
    }

    // Update other methods to handle missing columns
    static async getByIdSafe(id) {
        const [rows] = await db.execute(
            'SELECT id, company_name, email, industry FROM employers WHERE id = ?', 
            [id]
        );
        const user = rows[0];
        
        if (user) {
            user.is_active = true;  // Default value
            user.is_verified = false; // Default value
        }
        
        return user;
    }

    static async findByIdWithPassword(id) {
        const [rows] = await db.execute('SELECT * FROM employers WHERE id = ?', [id]);
        const user = rows[0];
        
        if (user) {
            user.is_active = user.is_active !== undefined ? user.is_active : true;
            user.is_verified = user.is_verified !== undefined ? user.is_verified : false;
        }
        
        return user;
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const [result] = await db.execute(
            'UPDATE employers SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows;
    }

    static async update(id, updateData) {
        // Remove fields that don't exist in database
        const cleanData = { ...updateData };
        delete cleanData.is_active;   // Remove if column doesn't exist
        delete cleanData.is_verified; // Remove if column doesn't exist
        
        const [result] = await db.execute(
            'UPDATE employers SET ? WHERE id = ?',
            [cleanData, id]
        );
        return result.affectedRows;
    }

    // Get employer by ID
    static async getById(id) {
        const [rows] = await db.execute(
            'SELECT id, company_name, email, industry FROM employers WHERE id = ?', 
            [id]
        );
        const user = rows[0];
        
        if (user) {
            user.is_active = true;
            user.is_verified = false;
        }
        
        return user;
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
}

module.exports = Employer;