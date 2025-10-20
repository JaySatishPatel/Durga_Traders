const mysql = require('mysql2');
require('dotenv').config({ path: './config.env' });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Jay@2210',
    database: process.env.DB_NAME || 'durga_traders',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        console.error('Please check your database configuration in config.env file');
        return;
    }
    console.log('✅ Connected to MySQL database successfully');
    console.log(`📊 Database: ${dbConfig.database}`);
    connection.release();
});

// Export both pool and promise-based pool
module.exports = pool;
module.exports.promise = pool.promise();
