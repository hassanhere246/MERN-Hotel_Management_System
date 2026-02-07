const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const GuestProfile = require('../models/GuestProfile');
const StaffProfile = require('../models/StaffProfile');

const resetDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        await User.deleteMany({});
        await GuestProfile.deleteMany({});
        await StaffProfile.deleteMany({});

        console.log('All users and profiles cleared. Database is clean.');
        process.exit();
    } catch (error) {
        console.error('Error clearing DB:', error);
        process.exit(1);
    }
};

resetDb();
