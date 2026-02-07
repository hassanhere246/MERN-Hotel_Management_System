const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const fixUserStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Update all existing users to be "approved" if they don't have a status
        // Alternatively, just approve everyone to restore access to existing accounts
        const result = await User.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'approved' } }
        );

        console.log(`${result.modifiedCount} users updated to 'approved' status.`);

        // Specifically ensure the main admin is approved if it was pending
        const adminResult = await User.updateMany(
            { role: 'admin' },
            { $set: { status: 'approved' } }
        );
        console.log(`Admin status check complete.`);

        process.exit();
    } catch (error) {
        console.error('Error fixing user statuses:', error);
        process.exit(1);
    }
};

fixUserStatus();
