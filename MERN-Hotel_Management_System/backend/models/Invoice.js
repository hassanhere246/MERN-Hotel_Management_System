const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },

    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuestProfile",
      required: true,
    },

    roomCharges: {
      type: Number,
      required: true,
    },

    additionalServicesCharges: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
        quantity: Number,
        amount: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
