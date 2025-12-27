const cron = require('node-cron');
const db = require('../config/database');
require('dotenv').config();

/**
 * Mark overdue maintenance requests
 * Runs every hour
 */
const markOverdueRequests = cron.schedule('0 * * * *', async () => {
    try {
        console.log('[CRON] Running overdue detection...');

        const result = await db.query(
            `UPDATE maintenance_requests
       SET is_overdue = true
       WHERE scheduled_date < CURRENT_TIMESTAMP
       AND status NOT IN ('Repaired', 'Scrap')
       AND is_overdue = false
       AND deleted_at IS NULL
       RETURNING id, subject, scheduled_date`,
            []
        );

        if (result.rows.length > 0) {
            console.log(`[CRON] Marked ${result.rows.length} requests as overdue:`);
            result.rows.forEach((req) => {
                console.log(`  - ${req.subject} (scheduled: ${req.scheduled_date})`);
            });

            // Log in audit
            for (const req of result.rows) {
                await db.query(
                    `INSERT INTO audit_logs (entity_type, entity_id, action, changes)
           VALUES ($1, $2, $3, $4)`,
                    [
                        'maintenance_request',
                        req.id,
                        'MARKED_OVERDUE',
                        JSON.stringify({ scheduled_date: req.scheduled_date }),
                    ]
                );
            }
        } else {
            console.log('[CRON] No overdue requests found');
        }
    } catch (error) {
        console.error('[CRON] Error marking overdue requests:', error);
    }
});

/**
 * Send preventive maintenance reminders
 * Runs daily at 8 AM
 */
const sendPreventiveMaintenanceReminders = cron.schedule('0 8 * * *', async () => {
    try {
        console.log('[CRON] Checking upcoming preventive maintenance...');

        const result = await db.query(
            `SELECT 
        mr.id, mr.subject, mr.scheduled_date,
        e.equipment_name,
        mt.name as team_name,
        u.full_name as assigned_technician_name,
        u.email as assigned_technician_email
       FROM maintenance_requests mr
       JOIN equipment e ON mr.equipment_id = e.id
       JOIN maintenance_teams mt ON mr.maintenance_team_id = mt.id
       LEFT JOIN users u ON mr.assigned_technician_id = u.id
       WHERE mr.request_type = 'Preventive'
       AND mr.status = 'New'
       AND mr.scheduled_date >= CURRENT_DATE
       AND mr.scheduled_date <= CURRENT_DATE + INTERVAL '7 days'
       AND mr.deleted_at IS NULL
       ORDER BY mr.scheduled_date`,
            []
        );

        if (result.rows.length > 0) {
            console.log(`[CRON] Found ${result.rows.length} upcoming preventive maintenance requests:`);
            result.rows.forEach((req) => {
                console.log(
                    `  - ${req.subject} for ${req.equipment_name} (${req.scheduled_date}) - Team: ${req.team_name}`
                );

                // In production, send email/notification here
                // For now, just log
                if (req.assigned_technician_email) {
                    console.log(`    → Would send reminder to: ${req.assigned_technician_email}`);
                } else {
                    console.log(`    → No technician assigned yet`);
                }
            });

            // Log notification sent (in audit)
            for (const req of result.rows) {
                await db.query(
                    `INSERT INTO audit_logs (entity_type, entity_id, action, changes)
           VALUES ($1, $2, $3, $4)`,
                    [
                        'maintenance_request',
                        req.id,
                        'REMINDER_SENT',
                        JSON.stringify({
                            scheduled_date: req.scheduled_date,
                            recipient: req.assigned_technician_email
                        }),
                    ]
                );
            }
        } else {
            console.log('[CRON] No upcoming preventive maintenance in next 7 days');
        }
    } catch (error) {
        console.error('[CRON] Error sending preventive maintenance reminders:', error);
    }
});

/**
 * Check warranty expiration
 * Runs daily at 9 AM
 */
const checkWarrantyExpiration = cron.schedule('0 9 * * *', async () => {
    try {
        console.log('[CRON] Checking warranty expirations...');

        const result = await db.query(
            `SELECT 
        e.id, e.equipment_name, e.serial_number, e.warranty_expiry_date,
        d.name as department_name,
        mt.name as team_name
       FROM equipment e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN maintenance_teams mt ON e.default_maintenance_team_id = mt.id
       WHERE e.warranty_expiry_date IS NOT NULL
       AND e.warranty_expiry_date >= CURRENT_DATE
       AND e.warranty_expiry_date <= CURRENT_DATE + INTERVAL '30 days'
       AND e.deleted_at IS NULL
       ORDER BY e.warranty_expiry_date`,
            []
        );

        if (result.rows.length > 0) {
            console.log(`[CRON] Found ${result.rows.length} equipment with expiring warranties (next 30 days):`);
            result.rows.forEach((eq) => {
                const daysUntilExpiry = Math.ceil(
                    (new Date(eq.warranty_expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
                );
                console.log(
                    `  - ${eq.equipment_name} (${eq.serial_number}) expires in ${daysUntilExpiry} days (${eq.warranty_expiry_date})`
                );
            });

            // In production, send notification to managers
            console.log('  → Would send notification to managers');

            // Log notification
            for (const eq of result.rows) {
                await db.query(
                    `INSERT INTO audit_logs (entity_type, entity_id, action, changes)
           VALUES ($1, $2, $3, $4)`,
                    [
                        'equipment',
                        eq.id,
                        'WARRANTY_EXPIRY_WARNING',
                        JSON.stringify({ warranty_expiry_date: eq.warranty_expiry_date }),
                    ]
                );
            }
        } else {
            console.log('[CRON] No warranties expiring in next 30 days');
        }
    } catch (error) {
        console.error('[CRON] Error checking warranty expiration:', error);
    }
});

/**
 * Initialize cron jobs
 */
const initCronJobs = () => {
    const ENABLE_CRON = process.env.ENABLE_CRON_JOBS !== 'false';

    if (!ENABLE_CRON) {
        console.log('⏸️  Cron jobs disabled (set ENABLE_CRON_JOBS=true to enable)');
        return;
    }

    console.log('⏰ Initializing cron jobs...');

    markOverdueRequests.start();
    console.log('  ✓ Overdue detection: Every hour');

    sendPreventiveMaintenanceReminders.start();
    console.log('  ✓ Preventive maintenance reminders: Daily at 8 AM');

    checkWarrantyExpiration.start();
    console.log('  ✓ Warranty expiration check: Daily at 9 AM');

    console.log('✅ All cron jobs started');
};

/**
 * Stop all cron jobs
 */
const stopCronJobs = () => {
    markOverdueRequests.stop();
    sendPreventiveMaintenanceReminders.stop();
    checkWarrantyExpiration.stop();
    console.log('⏹️  All cron jobs stopped');
};

module.exports = {
    initCronJobs,
    stopCronJobs,
    markOverdueRequests,
    sendPreventiveMaintenanceReminders,
    checkWarrantyExpiration,
};
