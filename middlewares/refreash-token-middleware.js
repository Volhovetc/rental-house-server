const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  try {
    console.log("Cookies: ", req);
    console.log("Signed Cookies: ");
    next();
  } catch (err) {
    res.status(500).json({ type: "error", value: "Ошибка сервера" });
  }
};
