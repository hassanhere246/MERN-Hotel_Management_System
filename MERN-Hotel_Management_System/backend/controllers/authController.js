const User = require("../models/User");
const GuestProfile = require("../models/GuestProfile");
const StaffProfile = require("../models/StaffProfile");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        // Validation
        if (!name || name.length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters" });
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "User with this email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine role and status
        // If an admin is creating the user (auth header present), allow role/status
        let finalRole = 'guest';
        let finalStatus = 'pending'; // Changed to pending for approval system requirement

        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded && decoded.role === 'admin') {
                    finalRole = (role || 'guest').toLowerCase();
                    // If admin is creating, default to approved or body choice
                    finalStatus = status || 'approved';
                }
            } catch (err) {
                // Token invalid or expired, proceed as public registration
            }
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: finalRole,
            status: finalStatus
        });

        // Create profile based on role
        try {
            if (user.role === 'guest') {
                await GuestProfile.create({ userId: user._id });
            } else {
                await StaffProfile.create({
                    userId: user._id,
                    role: user.role,
                    department: req.body.department || 'General'
                });
            }
        } catch (profileError) {
            // Rollback: Delete user if profile creation fails
            await User.findByIdAndDelete(user._id);
            throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        // Audit Log
        const isSelf = finalRole === 'guest' && finalStatus === 'pending';
        await AuditLog.create({
            action: 'USER_CREATED',
            performedBy: finalRole === 'admin' ? user._id : null,
            targetUser: user._id,
            details: isSelf ? 'SELF_REGISTERED' : `User created via admin with role: ${user.role} and status: ${user.status}`
        });

        // Token generation
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for email: ${email}`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found with email: ${email}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Password mismatch for user: ${email}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check status
        if (user.status === 'deactivated') {
            await AuditLog.create({
                action: 'LOGIN_ATTEMPT',
                targetUser: user._id,
                details: 'Login blocked: Account is deactivated'
            });
            return res.status(403).json({ message: "Account is deactivated. Please contact admin." });
        }
        if (user.status === 'pending') {
            return res.status(403).json({ message: "Account is pending approval." });
        }
        if (user.status === "rejected") {
            return res.status(403).json({ message: "Your account access has been restricted. Please contact support." });
        }

        console.log(`Login successful for user: ${email}`);
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Success Audit
        await AuditLog.create({
            action: 'LOGIN_ATTEMPT',
            performedBy: user._id,
            targetUser: user._id,
            details: 'Successful login'
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LOGOUT (Frontend token removal)
exports.logout = async (req, res) => {
    res.json({ message: "Logout successful" });
};
