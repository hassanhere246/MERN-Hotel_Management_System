const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("admin", "staff"), invoiceController.generateInvoice);
router.get("/", protect, authorizeRoles("admin", "staff"), invoiceController.getAllInvoices);
router.put("/:id/payment", protect, authorizeRoles("admin", "staff"), invoiceController.updatePaymentStatus);
router.get("/guest/:guestId", protect, invoiceController.getBillingHistory); // Logic should check permissions
router.delete("/:id", protect, authorizeRoles("admin", "staff"), invoiceController.deleteInvoice);

module.exports = router;
