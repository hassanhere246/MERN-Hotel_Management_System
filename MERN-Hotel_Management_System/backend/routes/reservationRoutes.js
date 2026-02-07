const express = require("express");
const router = express.Router();
const {
    createBooking,
    updateBooking,
    cancelBooking,
    checkIn,
    checkOut,
    getAllBookings,
    getBookingsByGuest
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, createBooking); // All logged in users can book
router.get("/", protect, authorizeRoles("admin", "staff"), getAllBookings);
router.get("/guest/:guestId", protect, getBookingsByGuest); // Controller should check if guestId matches req.user.id or if staff

router.put("/:id", protect, authorizeRoles("admin", "staff"), updateBooking);
router.put("/:id/cancel", protect, cancelBooking); // Logic in controller should check ownership for guests
router.put("/:id/checkin", protect, authorizeRoles("admin", "staff"), checkIn);
router.put("/:id/checkout", protect, authorizeRoles("admin", "staff"), checkOut);


module.exports = router;
