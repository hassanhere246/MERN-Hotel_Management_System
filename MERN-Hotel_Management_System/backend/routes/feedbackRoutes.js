const router = require("express").Router();
const controller = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("guest"), controller.submitFeedback);
router.get("/", protect, authorizeRoles("admin", "staff"), controller.getAllFeedback);
router.get("/my", protect, authorizeRoles("guest"), controller.getFeedbackByGuest);

module.exports = router;
