const Service = require("../models/Service");

/* ============================
   CREATE SERVICE
   (Admin / Manager)
============================= */
exports.createService = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const service = await Service.create({
      name,
      description,
      price,
    });

    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   GET ALL SERVICES
============================= */
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   GET SERVICE BY ID
============================= */
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service)
      return res.status(404).json({ message: "Service not found" });

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   UPDATE SERVICE
============================= */
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!service)
      return res.status(404).json({ message: "Service not found" });

    res.json({
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   DELETE SERVICE
============================= */
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service)
      return res.status(404).json({ message: "Service not found" });

    res.json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
