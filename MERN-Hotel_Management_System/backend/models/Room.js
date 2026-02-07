const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: ["single", "double", "suite"],
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "occupied", "cleaning", "maintenance"],
      default: "available",
    },

    price: {
      type: Number,
      required: true,
    },

    amenities: [String],

    floor: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
