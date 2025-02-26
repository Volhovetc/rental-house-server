const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  try {
    const userRole = req.body.role;

    if (userRole !== "admin")
      return res
        .status(403)
        .json({ type: "error", value: "У вас недостаточно прав" });

    next();
  } catch (err) {
    res.status(500).json({ type: "error", value: "Ошибка сервера" });
  }
};
