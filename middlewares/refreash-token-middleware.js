const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  try {
    console.log("Cookies: ", req.cookies);
    console.log("Signed Cookies: ", req.signedCookies);
    next();
  } catch (err) {
    res.status(500).json({ type: "error", value: "Ошибка сервера" });
  }
};
