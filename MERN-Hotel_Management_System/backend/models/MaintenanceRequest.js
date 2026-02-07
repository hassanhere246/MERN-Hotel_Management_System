const mongoose = require("mongoose");

const maintenanceRequestSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // staff or guest
      required: true,
    },

    issueDescription: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Normal", "High"],
      default: "Normal"
    },

    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },

    resolvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
