const MaintenanceRequest = require("../models/MaintenanceRequest");
const Room = require("../models/Room");

/* ============================
   CREATE MAINTENANCE REQUEST
============================= */
exports.createRequest = async (req, res) => {
  try {
    const { roomId, issueDescription, priority } = req.body;

    const request = await MaintenanceRequest.create({
      roomId,
      reportedBy: req.user.id, // from auth middleware
      issueDescription,
      priority: priority || "Normal"
    });

    await Room.findByIdAndUpdate(roomId, {
      status: "maintenance",
    });

    res.status(201).json({
      message: "Maintenance request created",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   UPDATE MAINTENANCE STATUS
============================= */
exports.updateStatus = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request)
      return res.status(404).json({ message: "Request not found" });

    request.status = req.body.status;

    if (req.body.status === "resolved") {
      request.resolvedAt = new Date();
      await Room.findByIdAndUpdate(request.roomId, {
        status: "cleaning",
      });
    }

    await request.save();

    res.json({
      message: "Maintenance status updated",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   GET REQUESTS (OPTIONAL)
============================= */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate("roomId")
      .populate("reportedBy")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
