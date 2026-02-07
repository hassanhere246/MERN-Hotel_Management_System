const User = require("../models/User");
const GuestProfile = require("../models/GuestProfile");
const StaffProfile = require("../models/StaffProfile");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");

// ADMIN CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, status, contactInfo } = req.body;

    // Validation
    if (!name || name.length < 2) return res.status(400).json({ message: "Name must be at least 2 characters" });
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Invalid email format" });
    if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    // Strict production check for admin email
    if (email.toLowerCase() === "admin@gmail.com") {
      return res.status(403).json({ message: "This email is reserved for the system admin." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User with this email already exists" });

    const finalRole = (role || 'guest').toLowerCase();
    const finalStatus = status || 'approved'; // Admin-created users are approved by default

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      status: finalStatus,
      contactInfo: contactInfo || {}
    });

    // Create profile based on role
    try {
      if (user.role === 'guest') {
        await GuestProfile.create({ userId: user._id });
      } else {
        await StaffProfile.create({
          userId: user._id,
          role: user.role,
          department: department || 'General',
          contactInfo: contactInfo || {}
        });
      }
    } catch (profileError) {
      // Rollback: Delete user if profile creation fails
      await User.findByIdAndDelete(user._id);
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    // Audit Log
    await AuditLog.create({
      action: 'USER_CREATED',
      performedBy: req.user.id,
      targetUser: user._id,
      details: `User created by Admin: ${user.name} (${user.role})`
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ME (Logged-in User)
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

// UPDATE PROFILE (Logged-in User)
exports.updateProfile = async (req, res) => {
  try {
    const { name, contactInfo, preferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (contactInfo) user.contactInfo = { ...user.contactInfo, ...contactInfo };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPLOAD PROFILE PHOTO
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profilePhoto = req.file.path.replace(/\\/g, "/"); // Normalize path
    await user.save();

    res.json({
      message: "Profile photo uploaded successfully",
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL USERS (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    console.log(`Debug: Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  let profile = null;

  if (user.role === "guest") {
    profile = await GuestProfile.findOne({ userId: user._id });
  } else {
    profile = await StaffProfile.findOne({ userId: user._id });
  }

  res.json({ user, profile });
};

// UPDATE USER ROLE (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Handle Profile Migration if role changed
    if (role && role !== oldRole) {
      if (oldRole === 'guest') {
        await GuestProfile.findOneAndDelete({ userId: user._id });
      } else {
        await StaffProfile.findOneAndDelete({ userId: user._id });
      }

      if (user.role === 'guest') {
        await GuestProfile.create({ userId: user._id });
      } else {
        await StaffProfile.create({
          userId: user._id,
          role: user.role,
          department: 'General' // Default for standalone role update
        });
      }
    }

    // Audit Log with detail shift
    await AuditLog.create({
      action: 'ROLE_CHANGED',
      performedBy: req.user?.id,
      targetUser: user._id,
      details: `Role changed from ${oldRole} to ${role}`
    });

    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldRole = user.role;

    if (user.role === "guest") {
      await GuestProfile.findOneAndDelete({ userId: user._id });
    } else {
      await StaffProfile.findOneAndDelete({ userId: user._id });
    }

    await user.deleteOne();

    // Audit Log
    await AuditLog.create({
      action: 'USER_DELETED',
      performedBy: req.user?.id,
      targetUser: user._id,
      details: `User with role ${oldRole} deleted`
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER STATUS (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending", "deactivated"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    if (!user) return res.status(404).json({ message: "User not found" });

    // Audit Log with previous/new status
    await AuditLog.create({
      action: 'STATUS_CHANGED',
      performedBy: req.user?.id,
      targetUser: user._id,
      details: `Status updated. Old: ${oldStatus} -> New: ${status}`
    });

    res.json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, contactInfo, department, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldRole = user.role;

    const changes = {};
    if (name && name !== user.name) {
      changes.name = { old: user.name, new: name };
      user.name = name;
    }
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email is already taken" });
      changes.email = { old: user.email, new: email };
      user.email = email;
    }
    if (role && role !== user.role) {
      changes.role = { old: user.role, new: role };
      user.role = role;
    }
    if (status && status !== user.status) {
      changes.status = { old: user.status, new: status };
      user.status = status;
    }
    if (contactInfo) user.contactInfo = { ...user.contactInfo, ...contactInfo };

    await user.save();

    // Handle Profile Migration if role changed
    if (role && role !== oldRole) {
      if (oldRole === 'guest') {
        await GuestProfile.findOneAndDelete({ userId: user._id });
      } else {
        await StaffProfile.findOneAndDelete({ userId: user._id });
      }

      if (user.role === 'guest') {
        await GuestProfile.create({ userId: user._id });
      } else {
        await StaffProfile.create({
          userId: user._id,
          role: user.role,
          status: user.status,
          department: department || 'General',
          contactInfo: contactInfo || {}
        });
      }
    } else if (user.role !== 'guest' && department) {
      // Sync department if role didn't change but department was provided
      await StaffProfile.findOneAndUpdate(
        { userId: user._id },
        { department, role: user.role }
      );
    }

    // Audit Log if sensitive changes occurred
    if (Object.keys(changes).length > 0) {
      await AuditLog.create({
        action: 'USER_UPDATED',
        performedBy: req.user?.id,
        targetUser: user._id,
        details: `User updated. Changes: ${JSON.stringify(changes)}`
      });
    }

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
