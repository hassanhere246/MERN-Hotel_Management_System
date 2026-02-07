const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');
const GuestProfile = require('./models/GuestProfile');
const StaffProfile = require('./models/StaffProfile');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await GuestProfile.deleteMany({});
        await StaffProfile.deleteMany({});
        console.log('Database Cleared');

        const hashedPassword = await bcrypt.hash('123456', 10);

        const users = [
            { name: 'Admin User', email: 'admin@gmail.com', role: 'admin', department: 'Management' },
            { name: 'Manager User', email: 'manager@gmail.com', role: 'manager', department: 'Management' },
            { name: 'Receptionist User', email: 'receptionist@gmail.com', role: 'staff', department: 'Front Office' },
            { name: 'Housekeeping User', email: 'housekeeping@gmail.com', role: 'staff', department: 'Housekeeping' },
            { name: 'Guest User', email: 'guest@gmail.com', role: 'guest', department: 'N/A' }
        ];

        for (const u of users) {
            const user = await User.create({
                name: u.name,
                email: u.email,
                password: hashedPassword,
                role: u.role,
                status: (u.role === 'admin' || u.role === 'guest') ? 'approved' : 'pending',
                contactInfo: { phone: '1234567890' }
            });

            if (u.role === 'guest') {
                await GuestProfile.create({ userId: user._id });
            } else {
                // All staff/admin/manager get a profile
                await StaffProfile.create({
                    userId: user._id,
                    role: u.role,
                    department: u.department,
                    workSchedule: {
                        shift: 'Morning',
                        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
                    }
                });
            }
            console.log(`Created ${u.role}: ${u.email}`);
        }

        console.log('-----------------------------------');
        console.log('SEEDING COMPLETE');
        console.log('Password for all users: 123456');
        console.log('-----------------------------------');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedUsers();
