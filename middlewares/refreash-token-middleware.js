const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  try {
    const a = JSON.parse(req.cookies);
    const b = JSON.parse(req.signedCookies);
    console.log("Cookies: ", a);
    console.log("Signed Cookies: ", b);
    next();
  } catch (err) {
    res.status(500).json({ type: "error", value: "Ошибка сервера" });
  }
};
