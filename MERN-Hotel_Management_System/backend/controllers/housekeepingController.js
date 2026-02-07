const HousekeepingTask = require("../models/HousekeepingTask");
const Room = require("../models/Room");

/* ============================
   ASSIGN HOUSEKEEPING TASK
============================= */
exports.assignTask = async (req, res) => {
  try {
    const { roomId, assignedTo, taskType, scheduledAt } = req.body;

    const task = await HousekeepingTask.create({
      roomId,
      assignedTo,
      taskType,
      scheduledAt,
    });

    // If cleaning task → update room status
    if (taskType === "cleaning") {
      await Room.findByIdAndUpdate(roomId, { status: "cleaning" });
    }

    res.status(201).json({
      message: "Housekeeping task assigned",
      task,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   UPDATE TASK STATUS
============================= */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const task = await HousekeepingTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (status) task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;

    if (status === "completed") {
      task.completedAt = new Date();
      await Room.findByIdAndUpdate(task.roomId, { status: "available" });
    }

    await task.save();

    res.json({
      message: "Task status updated",
      task,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================
   GET TASKS (OPTIONAL)
============================= */
exports.getAllTasks = async (req, res) => {
  const tasks = await HousekeepingTask.find()
    .populate("roomId")
    .populate("assignedTo");

  res.json(tasks);
};
