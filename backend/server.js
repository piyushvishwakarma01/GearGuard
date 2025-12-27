require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');
const { initCronJobs } = require('./src/jobs/cronJobs');

const PORT = process.env.PORT || 5000;

// Test database connection
const testDatabase = async () => {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('✅ Database connection successful');
        console.log(`   Server time: ${result.rows[0].now}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await testDatabase();

        // Initialize cron jobs
        initCronJobs();

        // Start HTTP server
        const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
        app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════════════════════');
            console.log('   🛠️  GEARGUARD - Maintenance Management System');
            console.log('═══════════════════════════════════════════════════════');
            console.log(`   🚀 Server running on port ${PORT}`);
            console.log(`   🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   📚 API Docs: /api-docs`);
            console.log(`   🏥 Health Check: /health`);
            console.log('═══════════════════════════════════════════════════════');
            console.log('');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Shutting down server...');
    db.pool.end(() => {
        console.log('✅ Database connections closed');
        process.exit(0);
    });
});

// Start the server
startServer();
