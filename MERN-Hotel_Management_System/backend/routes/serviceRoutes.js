const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Admin / Manager / Staff only
router.post("/", protect, authorizeRoles("admin", "staff"), serviceController.createService);
router.put("/:id", protect, authorizeRoles("admin", "staff"), serviceController.updateService);
router.delete("/:id", protect, authorizeRoles("admin", "staff"), serviceController.deleteService);

// Public / Auth users
router.get("/", protect, serviceController.getAllServices);
router.get("/:id", protect, serviceController.getServiceById);

module.exports = router;
