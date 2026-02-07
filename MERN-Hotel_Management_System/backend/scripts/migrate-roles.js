/**
 * Database Migration Script: Convert Legacy Roles to Admin/Staff/Guest
 * 
 * This script updates all users in the database from legacy roles
 * (manager, receptionist, housekeeping, maintenance) to the new
 * three-role system (admin, staff, guest) with department assignments.
 * 
 * Usage:
 *   node scripts/migrate-roles.js
 * 
 * IMPORTANT: Backup your database before running this script!
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Role mapping configuration
const ROLE_MIGRATION_MAP = {
    manager: { role: 'staff', department: 'Management' },
    receptionist: { role: 'staff', department: 'Front Office' },
    housekeeping: { role: 'staff', department: 'Housekeeping' },
    maintenance: { role: 'staff', department: 'Maintenance' },
    // These roles remain unchanged
    admin: { role: 'admin', department: null },
    guest: { role: 'guest', department: null },
    staff: { role: 'staff', department: 'Other' } // Default for existing staff
};

async function migrateRoles() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        // Get User model
        const User = mongoose.model('User');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users to process\n`);

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // Process each user
        for (const user of users) {
            const oldRole = user.role;
            const migration = ROLE_MIGRATION_MAP[oldRole];

            if (!migration) {
                console.log(`⚠ Unknown role "${oldRole}" for user ${user.email} - skipping`);
                skippedCount++;
                continue;
            }

            // Skip if already migrated
            if (oldRole === migration.role && user.department === migration.department) {
                console.log(`→ User ${user.email} already migrated (${oldRole}) - skipping`);
                skippedCount++;
                continue;
            }

            try {
                // Update user
                user.role = migration.role;
                if (migration.department) {
                    user.department = migration.department;
                }
                await user.save();

                console.log(`✓ Migrated ${user.email}: ${oldRole} → ${migration.role}${migration.department ? ` (${migration.department})` : ''}`);
                migratedCount++;
            } catch (error) {
                console.error(`✗ Error migrating user ${user.email}:`, error.message);
                errorCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('MIGRATION SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total users:     ${users.length}`);
        console.log(`Migrated:        ${migratedCount}`);
        console.log(`Skipped:         ${skippedCount}`);
        console.log(`Errors:          ${errorCount}`);
        console.log('='.repeat(50) + '\n');

        if (errorCount > 0) {
            console.log('⚠ Migration completed with errors. Please review the logs above.');
        } else {
            console.log('✓ Migration completed successfully!');
        }

    } catch (error) {
        console.error('✗ Migration failed:', error);
        process.exit(1);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
}

// Run migration
console.log('='.repeat(50));
console.log('ROLE MIGRATION SCRIPT');
console.log('='.repeat(50));
console.log('This script will convert legacy roles to the new system:');
console.log('  manager       → staff (Management)');
console.log('  receptionist  → staff (Front Office)');
console.log('  housekeeping  → staff (Housekeeping)');
console.log('  maintenance   → staff (Maintenance)');
console.log('='.repeat(50) + '\n');

migrateRoles();
