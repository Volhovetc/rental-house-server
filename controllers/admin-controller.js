const task = require("../models/task");

class AdminController {
  async deletetask(req, res) {
    try {
      const id = req.params.id;
      const deleteTask = await task.findOneAndDelete({ _id: id });
      if (!deleteTask)
        return res
          .status(404)
          .json({ type: "error", value: "Задача не найдена" });
      return res.status(200).json({
        type: "data",
        value: true,
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
}

module.exports = new AdminController();
