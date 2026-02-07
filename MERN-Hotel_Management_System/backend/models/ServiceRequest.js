const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
    {
        guestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation",
            required: true,
        },

        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "completed", "cancelled"],
            default: "pending",
        },

        notes: {
            type: String,
            trim: true,
        },

        requestedAt: {
            type: Date,
            default: Date.now,
        },

        completedAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
