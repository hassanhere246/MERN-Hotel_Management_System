const Feedback = require("../models/Feedback");

/* ============================
   SUBMIT FEEDBACK (Guest)
============================= */
exports.submitFeedback = async (req, res) => {
  try {
    const { bookingId, rating, comments } = req.body;

    const feedback = await Feedback.create({
      guestId: req.user.id, // Guest user
      bookingId,
      rating,
      comments,
    });

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   VIEW ALL FEEDBACK (Admin)
============================= */
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("guestId")
      .populate("bookingId");

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   VIEW FEEDBACK BY GUEST
============================= */
exports.getFeedbackByGuest = async (req, res) => {
  try {
    const feedback = await Feedback.find({ guestId: req.user.id })
      .populate("bookingId");

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
