const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get("/revenue", protect, authorizeRoles("admin", "staff"), reportController.getRevenueReport);
router.get("/analytics", protect, authorizeRoles("admin", "staff"), reportController.getAnalytics);
router.get("/dashboard-overview", protect, authorizeRoles("admin", "staff"), reportController.getDashboardOverview);

module.exports = router;
