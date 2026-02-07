const Invoice = require("../models/Invoice");
const Reservation = require("../models/Reservation");
const Room = require("../models/Room");

// GENERATE INVOICE (Usually on Checkout)
exports.generateInvoice = async (req, res) => {
  const { reservationId, services } = req.body;

  const reservation = await Reservation.findById(reservationId).populate("roomId");
  if (!reservation) return res.status(404).json({ message: "Reservation not found" });

  const nights =
    (new Date(reservation.checkOutDate) -
      new Date(reservation.checkInDate)) /
    (1000 * 60 * 60 * 24);

  const roomCharges = nights * reservation.roomId.price;

  const servicesTotal = services.reduce(
    (sum, s) => sum + s.amount,
    0
  );

  const totalAmount = roomCharges + servicesTotal;

  const invoice = await Invoice.create({
    reservationId,
    guestId: reservation.guestId,
    roomCharges,
    additionalServicesCharges: services,
    totalAmount,
  });

  res.status(201).json(invoice);
};

// UPDATE PAYMENT STATUS
exports.updatePaymentStatus = async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: req.body.paymentStatus },
    { new: true }
  );
  res.json(invoice);
};

// GET BILLING HISTORY (Guest/Admin)
exports.getBillingHistory = async (req, res) => {
  const invoices = await Invoice.find({ guestId: req.params.guestId })
    .populate("reservationId")
    .populate("additionalServicesCharges.serviceId");

  res.json(invoices);
};
// GET ALL INVOICES (Admin)
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("reservationId")
      .populate("guestId")
      .populate({
        path: "reservationId",
        populate: { path: "roomId" }
      })
      .populate("additionalServicesCharges.serviceId")
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE INVOICE (Admin only)
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
