const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Admin {
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
        return rows[0];
    }

    static async getByIdSafe(id) {
        const [rows] = await db.execute(
            'SELECT id, username, email, role, created_at FROM admins WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByIdWithPassword(id) {
        const [rows] = await db.execute('SELECT * FROM admins WHERE id = ?', [id]);
        return rows[0];
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const [result] = await db.execute(
            'UPDATE admins SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows;
    }
}

module.exports = Admin;