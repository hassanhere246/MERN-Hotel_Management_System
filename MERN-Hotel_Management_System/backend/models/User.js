const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true, // hashed password
    },

    role: {
      type: String,
      enum: ["admin", "staff", "manager", "guest"],
      default: "guest",
    },

    department: {
      type: String,
      enum: ["Management", "Front Office", "Housekeeping", "Maintenance", "Kitchen", "Security", "Other"],
    },

    profilePhoto: {
      type: String,
      default: "", // URL or file path
    },

    contactInfo: {
      phone: String,
      address: String,
    },

    preferences: {
      language: { type: String, default: "en" },
      notifications: {
        newReservations: { type: Boolean, default: true },
        checkInReminders: { type: Boolean, default: true },
        maintenanceAlerts: { type: Boolean, default: true },
        monthlyReports: { type: Boolean, default: true },
      },
      theme: { type: String, default: "light" },
      currency: { type: String, default: "USD" },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "deactivated"],
      default: "pending",
    },
  },
  { timestamps: true } // createdAt & updatedAt
);

module.exports = mongoose.model("User", userSchema);
