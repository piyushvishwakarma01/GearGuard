const fs = require('fs').promises;
const path = require('path');
const db = require('../src/config/database');

async function initDatabase() {
    try {
        console.log('🚀 Initializing Render Database...');

        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const seedPath = path.join(__dirname, '../../database/seed.sql');

        // 1. Read SQL
        console.log('📖 Reading Schema and Seed files...');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');
        const seedSql = await fs.readFile(seedPath, 'utf8');

        // 2. Apply Schema (Drops and Recreates Tables)
        console.log('🏗️  Applying Database Schema...');
        await db.query(schemaSql);
        console.log('✅ Schema applied successfully.');

        // 3. Apply Dummy Data
        console.log('🌱 Injecting Dummy Data...');
        await db.query(seedSql);
        console.log('✅ Dummy data injected successfully.');

        console.log('✨ Database initialization complete! You are ready to go.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}

initDatabase();
