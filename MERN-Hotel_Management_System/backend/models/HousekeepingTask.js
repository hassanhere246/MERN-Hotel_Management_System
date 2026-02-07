const mongoose = require("mongoose");

const housekeepingTaskSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // housekeeping staff
    },

    taskType: {
      type: String,
      enum: ["cleaning", "restocking", "maintenance"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("HousekeepingTask", housekeepingTaskSchema);
