const Reservation = require("../models/Reservation");
const Room = require("../models/Room");
const Invoice = require("../models/Invoice");
const HousekeepingTask = require("../models/HousekeepingTask");
const GuestProfile = require("../models/GuestProfile");
const User = require("../models/User");

/* ============================
   CREATE BOOKING (RESERVATION)
============================= */
exports.createBooking = async (req, res) => {
  try {
    let { guestId, roomId, checkInDate, checkOutDate, totalAmount } = req.body;

    // 0️⃣ Basic Validation
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    if (checkIn < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: "Check-in date cannot be in the past" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Total amount must be a positive number" });
    }

    // 1️⃣ Resolve GuestProfile if guestId is a User ID
    const guestUser = await User.findById(guestId);
    if (guestUser) {
      const profile = await GuestProfile.findOne({ userId: guestId });
      if (!profile) {
        return res.status(404).json({ message: "This user does not have a guest profile. Please create one first." });
      }
      guestId = profile._id;
    } else {
      // Check if it's already a valid GuestProfile ID
      const profile = await GuestProfile.findById(guestId);
      if (!profile) {
        return res.status(404).json({ message: "Invalid Guest ID or User ID provided." });
      }
    }

    // 2️⃣ Check room availability for date range
    const conflict = await Reservation.findOne({
      roomId,
      status: { $ne: "canceled" },
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    if (conflict) {
      return res.status(400).json({
        message: "Room is already booked for selected dates",
      });
    }

    // 3️⃣ Create booking
    const booking = await Reservation.create({
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      totalAmount,
      status: "confirmed",
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   UPDATE BOOKING
============================= */
exports.updateBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, status } = req.body;
    const booking = await Reservation.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // 1️⃣ Validate Dates if they are changing
    const newCheckIn = checkInDate ? new Date(checkInDate) : new Date(booking.checkInDate);
    const newCheckOut = checkOutDate ? new Date(checkOutDate) : new Date(booking.checkOutDate);

    if (newCheckOut <= newCheckIn) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    // 2️⃣ Availability Check if Room or Dates are changing
    const targetRoomId = roomId || booking.roomId;
    if (roomId || checkInDate || checkOutDate) {
      const conflict = await Reservation.findOne({
        _id: { $ne: booking._id },
        roomId: targetRoomId,
        status: { $ne: "canceled" },
        $or: [
          {
            checkInDate: { $lt: newCheckOut },
            checkOutDate: { $gt: newCheckIn },
          },
        ],
      });

      if (conflict) {
        return res.status(400).json({ message: "Room is already booked for these dates" });
      }
    }

    // 3️⃣ Handle Room Status Changes if Status changes or Room changes
    const oldRoomId = booking.roomId;

    // Update booking data
    Object.assign(booking, req.body);
    await booking.save();

    // If room changed, handle old and new room statuses
    if (roomId && roomId.toString() !== oldRoomId.toString()) {
      // Old room becomes available
      await Room.findByIdAndUpdate(oldRoomId, { status: 'available' });
      // New room status based on booking status
      const newRoomStatus = booking.status === 'checked-in' ? 'occupied' : 'available';
      await Room.findByIdAndUpdate(roomId, { status: newRoomStatus });
    }

    res.json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   CANCEL BOOKING
============================= */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Reservation.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    booking.status = "canceled";
    await booking.save();

    // Free room if canceled before check-in
    await Room.findByIdAndUpdate(booking.roomId, {
      status: "available",
    });

    res.json({
      message: "Booking canceled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   CHECK-IN
============================= */
exports.checkIn = async (req, res) => {
  try {
    const booking = await Reservation.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: `Only confirmed bookings can be checked in. Current status: ${booking.status}`,
      });
    }

    // Double check room status
    const room = await Room.findById(booking.roomId);
    if (room.status === "occupied") {
      return res.status(400).json({ message: "Room is currently occupied" });
    }

    booking.status = "checked-in";
    await booking.save();

    await Room.findByIdAndUpdate(booking.roomId, {
      status: "occupied",
    });

    res.json({
      message: "Guest checked in successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   CHECK-OUT
============================= */
exports.checkOut = async (req, res) => {
  try {
    const booking = await Reservation.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "checked-in") {
      return res.status(400).json({
        message: "Guest must be checked-in before checkout",
      });
    }

    booking.status = "checked-out";
    await booking.save();

    await Room.findByIdAndUpdate(booking.roomId, {
      status: "cleaning",
    });

    // Create Invoice automatically on Check-out
    await Invoice.create({
      reservationId: booking._id,
      guestId: booking.guestId,
      roomCharges: booking.totalAmount,
      additionalServicesCharges: [],
      totalAmount: booking.totalAmount,
      paymentStatus: "pending",
      issuedAt: new Date()
    });

    // Create Housekeeping Task automatically
    await HousekeepingTask.create({
      roomId: booking.roomId,
      taskType: "cleaning",
      status: "pending",
      scheduledAt: new Date()
    });

    res.json({
      message: "Guest checked out, invoice generated, and cleaning task created.",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   GET BOOKINGS (ADMIN / STAFF)
============================= */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Reservation.find()
      .populate("guestId")
      .populate("roomId");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   GET BOOKINGS BY GUEST
============================= */
exports.getBookingsByGuest = async (req, res) => {
  try {
    const bookings = await Reservation.find({
      guestId: req.params.guestId,
    }).populate("roomId");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
