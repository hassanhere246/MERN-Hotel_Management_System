const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const StaffProfile = require('../models/StaffProfile');
const GuestProfile = require('../models/GuestProfile');

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const users = await User.find();
        console.log(`Checking ${users.length} users...`);

        let deletedCount = 0;

        for (const user of users) {
            // Admin is seeded differently, skip it if you want, or check it too
            let profile;
            if (user.role === 'guest') {
                profile = await GuestProfile.findOne({ userId: user._id });
            } else {
                profile = await StaffProfile.findOne({ userId: user._id });
            }

            if (!profile) {
                console.log(`User ${user.email} (${user.role}) has NO profile. Deleting...`);
                await User.findByIdAndDelete(user._id);
                deletedCount++;
            }
        }

        console.log(`Cleanup complete. Deleted ${deletedCount} orphaned users.`);
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
};

cleanup();
