const mysql = require('mysql2');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

// Create connection without specifying database
const connection = mysql.createConnection(dbConfig);

// SQL script to create database and tables
const setupSQL = `
-- Create database
CREATE DATABASE IF NOT EXISTS durga_traders;
USE durga_traders;

-- Tiles table for inventory management
CREATE TABLE IF NOT EXISTS tiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    supplier VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bills table for customer transactions
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_address TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    items JSON NOT NULL,
    notes TEXT
);

-- Bill items table for detailed transaction records
CREATE TABLE IF NOT EXISTS bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    tile_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (tile_id) REFERENCES tiles(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO tiles (name, type, size, color, price, quantity, supplier, description) VALUES
('Premium Ceramic', 'Ceramic', '12x12', 'White', 45.00, 100, 'ABC Ceramics', 'High quality ceramic tiles'),
('Marble Finish', 'Porcelain', '24x24', 'Beige', 85.00, 50, 'Marble Co', 'Premium marble finish tiles'),
('Wood Look', 'Vinyl', '6x36', 'Oak', 35.00, 200, 'Vinyl Pro', 'Wood look vinyl tiles'),
('Glass Mosaic', 'Glass', '1x1', 'Blue', 12.00, 500, 'Glass Art', 'Decorative glass mosaic tiles'),
('Natural Stone', 'Stone', '16x16', 'Gray', 65.00, 75, 'Stone Works', 'Natural stone tiles');
`;

console.log('🚀 Setting up Durga Traders database...');
console.log(`📊 Connecting to MySQL at ${dbConfig.host} as ${dbConfig.user}`);

connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('\n📝 Please check your database configuration:');
        console.error('1. Make sure MySQL is running');
        console.error('2. Update your .env file with correct credentials:');
        console.error('   DB_HOST=localhost');
        console.error('   DB_USER=your_username');
        console.error('   DB_PASSWORD=your_password');
        console.error('   DB_NAME=durga_traders');
        process.exit(1);
    }
    
    console.log('✅ Connected to MySQL successfully');
    
    // Execute setup script
    connection.query(setupSQL, (err, results) => {
        if (err) {
            console.error('❌ Error setting up database:', err.message);
            connection.end();
            process.exit(1);
        }
        
        console.log('✅ Database setup completed successfully!');
        console.log('📋 Created tables: tiles, bills, bill_items');
        console.log('📦 Inserted sample data');
        console.log('\n🎉 You can now start the application with: npm start');
        
        connection.end();
    });
});

