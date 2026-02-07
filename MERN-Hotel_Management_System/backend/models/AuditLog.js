const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            enum: [
                "USER_CREATED",
                "USER_UPDATED",
                "USER_DELETED",
                "ROLE_CHANGED",
                "STATUS_CHANGED",
                "LOGIN_ATTEMPT",
            ],
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Might be null for public registration
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        details: {
            type: String,
            required: true,
        },
        ipAddress: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
