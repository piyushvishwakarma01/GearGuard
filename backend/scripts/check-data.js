const db = require('../src/config/database');

async function checkData() {
    try {
        console.log('🕵️‍♀️ Checking Database Content...');
        const users = await db.query('SELECT COUNT(*) FROM users');
        const equipment = await db.query('SELECT COUNT(*) FROM equipment');
        const requests = await db.query('SELECT COUNT(*) FROM maintenance_requests');

        console.log('--------------------------------');
        console.log(`Users: ${users.rows[0].count}`);
        console.log(`Equipment: ${equipment.rows[0].count}`);
        console.log(`Requests: ${requests.rows[0].count}`);
        console.log('--------------------------------');

        if (parseInt(equipment.rows[0].count) > 0) {
            console.log('✅ Data exists in potential tables.');
        } else {
            console.log('❌ Database appears empty of equipment data.');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking data:', error);
        process.exit(1);
    }
}

checkData();
