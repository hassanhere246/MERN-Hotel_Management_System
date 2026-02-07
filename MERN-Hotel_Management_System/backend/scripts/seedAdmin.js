const User = require("../models/User");
const StaffProfile = require("../models/StaffProfile");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
    try {
        const adminEmail = "admin@gmail.com";
        const adminPassword = "admin123";

        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            console.log("Admin not found. Creating default admin...");

            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            const admin = await User.create({
                name: "System Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                status: "approved",
                preferences: {
                    theme: "dark"
                },
                department: "Management"
            });

            // Ensure profile exists
            const profileExists = await StaffProfile.findOne({ userId: admin._id });
            if (!profileExists) {
                await StaffProfile.create({
                    userId: admin._id,
                    role: "admin",
                    department: "Management"
                });
            }

            console.log("Default admin created successfully.");
        } else {
            // Ensure existing admin is approved and has a profile
            let updated = false;
            if (adminExists.status !== 'approved') {
                adminExists.status = 'approved';
                updated = true;
            }
            if (!adminExists.role || adminExists.role !== 'admin') {
                adminExists.role = 'admin';
                updated = true;
            }
            if (updated) {
                await adminExists.save();
                console.log("Existing admin record updated (Status/Role).");
            }

            const profileExists = await StaffProfile.findOne({ userId: adminExists._id });
            if (!profileExists) {
                await StaffProfile.create({
                    userId: adminExists._id,
                    role: "admin",
                    department: adminExists.department || "Management"
                });
                console.log("Profile created for existing admin.");
            }
        }
    } catch (error) {
        console.error("Error seeding admin:", error.message);
    }
};

module.exports = seedAdmin;
