const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '64993929Jmx$',
    database: process.env.DB_NAME || 'internship_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
 
// Promise wrapper for the pool
const promisePool = pool.promise();

console.log('Database connected!')

module.exports = promisePool;