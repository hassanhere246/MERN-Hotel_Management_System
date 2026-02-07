const router = require("express").Router();
const controller = require("../controllers/housekeepingController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("admin", "staff"), controller.assignTask);
router.put("/:id/status", protect, authorizeRoles("admin", "staff"), controller.updateTaskStatus);
router.get("/", protect, authorizeRoles("admin", "staff"), controller.getAllTasks);

module.exports = router;
