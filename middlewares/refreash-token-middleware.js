const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
module.exports = function (req, res, next) {
  try {
    next();
  } catch (err) {
    res.status(500).json({ type: "error", value: "Ошибка сервера" });
  }
};
