const express = require("express");
const router = express.Router();
const controller = require("../controllers/serviceRequestController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Guest routes
router.post("/", protect, authorizeRoles("guest"), controller.createRequest);
router.get("/my", protect, authorizeRoles("guest"), controller.getMyRequests);

// Staff/Admin routes
router.get("/", protect, authorizeRoles("admin", "staff"), controller.getAllRequests);
router.patch("/:id/status", protect, authorizeRoles("admin", "staff"), controller.updateStatus);

module.exports = router;
