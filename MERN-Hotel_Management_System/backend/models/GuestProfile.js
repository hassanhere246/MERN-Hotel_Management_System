const mongoose = require("mongoose");

const guestProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    personalInfo: {
      cnicOrPassport: String,
      nationality: String,
      dateOfBirth: Date,
    },

    contactDetails: {
      emergencyContact: String,
      phone: String,
    },

    preferences: {
      roomType: String,
      smoking: { type: Boolean, default: false },
    },

    stayHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuestProfile", guestProfileSchema);
