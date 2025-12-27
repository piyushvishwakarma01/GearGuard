const fs = require('fs').promises;
const path = require('path');
const db = require('../src/config/database');

async function setupDatabase() {
    try {
        console.log('🔄 Starting database setup...');

        // Read SQL files
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const seedPath = path.join(__dirname, '../../database/seed.sql');

        console.log('📖 Reading SQL files...');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');
        const seedSql = await fs.readFile(seedPath, 'utf8');

        // Execute Schema
        console.log('🏗️  Creating database schema...');
        await db.query(schemaSql);
        console.log('✅ Schema created successfully');

        // Execute Seed
        console.log('🌱 Seeding database...');
        await db.query(seedSql);
        console.log('✅ Database seeded successfully');

        console.log('✨ Database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();
