const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'durga_traders',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        console.error('Please check your database configuration in .env file');
        return;
    }
    console.log('✅ Connected to MySQL database successfully');
    console.log(`📊 Database: ${dbConfig.database}`);
    connection.release();
});

// Export both pool and promise-based pool
module.exports = pool;
module.exports.promise = pool.promise();
