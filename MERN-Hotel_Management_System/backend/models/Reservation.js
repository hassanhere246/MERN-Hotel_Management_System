const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuestProfile",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    checkInDate: {
      type: Date,
      required: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["confirmed", "checked-in", "checked-out", "canceled"],
      default: "confirmed",
    },

    totalAmount: {
      type:  Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
