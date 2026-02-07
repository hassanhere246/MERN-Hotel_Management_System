const bookingSchema = new mongoose.Schema({
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: Date,
  checkOutDate: Date,
  status: { type: String, enum: ['confirmed','checked-in','checked-out','canceled'], default: 'confirmed' },
  totalAmount: Number
});

module.exports = mongoose.model('Booking', bookingSchema);
