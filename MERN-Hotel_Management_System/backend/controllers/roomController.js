const Room = require("../models/Room");
const Reservation = require("../models/Reservation");

// ADD ROOM (Admin)
exports.addRoom = async (req, res) => {
  try {
    const { roomNumber, type, price, floor, beds } = req.body;

    // Validation
    if (!roomNumber) return res.status(400).json({ message: "Room number is required" });
    if (!type || !['single', 'double', 'suite', 'deluxe'].includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Valid room type is required" });
    }
    if (!price || price <= 0) return res.status(400).json({ message: "Price must be a positive number" });
    if (floor < 0) return res.status(400).json({ message: "Floor cannot be negative" });
    if (beds <= 0) return res.status(400).json({ message: "Beds must be at least 1" });

    // Uniqueness check
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) return res.status(400).json({ message: "Room number already exists" });

    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE ROOM
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, type, price, floor, beds, status } = req.body;

    // Validation
    if (type && !['single', 'double', 'suite', 'deluxe'].includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Invalid room type" });
    }
    if (price && price <= 0) return res.status(400).json({ message: "Price must be a positive number" });
    if (floor && floor < 0) return res.status(400).json({ message: "Floor cannot be negative" });
    if (beds && beds <= 0) return res.status(400).json({ message: "Beds must be at least 1" });
    if (status && !['available', 'occupied', 'cleaning', 'maintenance'].includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Uniqueness check if roomNumber is changing
    if (roomNumber && roomNumber !== room.roomNumber) {
      const roomExists = await Room.findOne({ roomNumber });
      if (roomExists) return res.status(400).json({ message: "Room number already exists" });
    }

    Object.assign(room, req.body);
    await room.save();
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE ROOM
exports.deleteRoom = async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ message: "Room deleted successfully" });
};

// GET ALL ROOMS
exports.getRooms = async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
};

// CHECK ROOM AVAILABILITY
exports.checkAvailability = async (req, res) => {
  const { checkInDate, checkOutDate } = req.query;

  const bookedRooms = await Reservation.find({
    status: { $ne: "canceled" },
    $or: [
      {
        checkInDate: { $lt: new Date(checkOutDate) },
        checkOutDate: { $gt: new Date(checkInDate) },
      },
    ],
  }).select("roomId");

  const bookedRoomIds = bookedRooms.map(r => r.roomId);

  const availableRooms = await Room.find({
    _id: { $nin: bookedRoomIds },
    status: { $in: ["available", "cleaning"] },
  });

  res.json(availableRooms);
};

// UPDATE ROOM STATUS
exports.updateRoomStatus = async (req, res) => {
  const { status } = req.body;

  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(room);
};
