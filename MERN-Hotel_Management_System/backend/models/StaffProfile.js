const mongoose = require("mongoose");

const staffProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["admin", "staff", "manager", "guest"],
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    workSchedule: {
      shift: String, // Morning / Evening / Night
      workingDays: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StaffProfile", staffProfileSchema);
