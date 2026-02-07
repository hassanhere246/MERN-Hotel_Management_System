const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("admin", "staff"), roomController.addRoom);
router.get("/", roomController.getRooms); // Public - allow guests to view rooms
router.get("/availability", protect, roomController.checkAvailability);
router.put("/:id", protect, authorizeRoles("admin", "staff"), roomController.updateRoom);
router.put("/:id/status", protect, authorizeRoles("admin", "staff"), roomController.updateRoomStatus);
router.delete("/:id", protect, authorizeRoles("admin", "staff"), roomController.deleteRoom);

module.exports = router;
