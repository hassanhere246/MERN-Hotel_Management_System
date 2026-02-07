const invoiceSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomCharges: Number,
  additionalServicesCharges: Number,
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['pending','paid'], default: 'pending' },
  issuedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
