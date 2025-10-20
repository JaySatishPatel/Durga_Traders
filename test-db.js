const db = require('./config/database');

console.log('🧪 Testing database connection...');

// Test basic connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('\n🔧 Troubleshooting steps:');
        console.error('1. Make sure MySQL is running');
        console.error('2. Check your config.env file configuration');
        console.error('3. Verify database credentials');
        console.error('4. Run: npm run setup-db');
        process.exit(1);
    }
    
    console.log('✅ Database connection successful');
    
    // Test a simple query
    connection.query('SELECT COUNT(*) as count FROM tiles', (err, results) => {
        if (err) {
            console.error('❌ Query test failed:', err.message);
            console.error('Run: npm run setup-db to create tables');
        } else {
            console.log(`✅ Query test successful - Found ${results[0].count} tiles in database`);
        }
        
        connection.release();
        console.log('\n🎉 Database is ready! You can now start the application.');
        process.exit(0);
    });
});


