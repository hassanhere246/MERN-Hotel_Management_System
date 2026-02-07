const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/me", protect, userController.getMe);
router.put("/profile", protect, userController.updateProfile);
router.put("/change-password", protect, userController.changePassword);
router.post("/profile-photo", protect, upload.single("profilePhoto"), userController.uploadProfilePhoto);
router.post("/", protect, authorizeRoles("admin"), userController.createUser);
router.get("/", protect, authorizeRoles("admin", "staff"), userController.getAllUsers);
router.get("/:id", protect, userController.getUserById);
router.put("/:id/role", protect, authorizeRoles("admin"), userController.updateUserRole);
router.put("/:id/status", protect, authorizeRoles("admin"), userController.updateUserStatus);
router.put("/:id", protect, authorizeRoles("admin", "staff"), userController.updateUser);
router.delete("/:id", protect, authorizeRoles("admin"), userController.deleteUser);

module.exports = router;
