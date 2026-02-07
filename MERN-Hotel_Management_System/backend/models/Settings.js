const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    roomRates: {
      type: Object, // { single: 5000, double: 8000 }
      default: {},
    },

    taxes: {
      type: Number, // percentage
      default: 0,
    },

    policies: {
      cancellationPolicy: String,
      checkInTime: String,
      checkOutTime: String,
    },

    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
