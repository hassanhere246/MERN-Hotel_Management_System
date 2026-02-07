const Settings = require("../models/Settings");

/* ============================
   GET SETTINGS
============================= */
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   UPDATE SETTINGS (Admin)
============================= */
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        req.body,
        { new: true }
      );
    }

    res.json({
      message: "System settings updated",
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
