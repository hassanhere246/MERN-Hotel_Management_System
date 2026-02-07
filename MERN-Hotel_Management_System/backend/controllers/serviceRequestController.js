const ServiceRequest = require("../models/ServiceRequest");
const Service = require("../models/Service");

/* ============================
   CREATE SERVICE REQUEST (Guest)
============================= */
exports.createRequest = async (req, res) => {
    try {
        const { bookingId, serviceId, notes } = req.body;

        const request = await ServiceRequest.create({
            guestId: req.user.id,
            bookingId,
            serviceId,
            notes,
        });

        const populatedRequest = await ServiceRequest.findById(request._id)
            .populate("serviceId", "name price");

        res.status(201).json({
            message: "Service requested successfully",
            request: populatedRequest,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ============================
   GET MY REQUESTS (Guest)
============================= */
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ guestId: req.user.id })
            .populate("serviceId", "name price")
            .populate("bookingId", "bookingReference")
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ============================
   GET ALL REQUESTS (Staff/Admin)
============================= */
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find()
            .populate("guestId", "name email")
            .populate("serviceId", "name price")
            .populate("bookingId", "bookingReference")
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ============================
   UPDATE STATUS (Staff/Admin)
============================= */
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updateData = { status };

        if (status === "completed") {
            updateData.completedAt = Date.now();
        }

        const request = await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate("serviceId", "name");

        if (!request)
            return res.status(404).json({ message: "Request not found" });

        res.json({
            message: `Request marked as ${status}`,
            request,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
