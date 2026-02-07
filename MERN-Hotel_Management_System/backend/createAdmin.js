const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminExists = await User.findOne({ email: 'admin@gmail.com' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'admin',
            status: 'approved',
            contactInfo: { phone: '1234567890' }
        });

        console.log('Admin User Created Successfully');
        console.log('Email: admin@gmail.com');
        console.log('Password: admin123');

        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
