const router = require("express").Router();
const controller = require("../controllers/maintenanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("admin", "staff"), controller.createRequest);
router.put("/:id/status", protect, authorizeRoles("admin", "staff"), controller.updateStatus);
router.get("/", protect, authorizeRoles("admin", "staff"), controller.getAllRequests);

module.exports = router;
