const router = require("express").Router();
const controller = require("../controllers/settingsController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get("/", protect, controller.getSettings);
router.put("/", protect, authorizeRoles("admin", "staff"), controller.updateSettings);

module.exports = router;
