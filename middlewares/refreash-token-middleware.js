const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  try {
    const a = req.cookies;
    const b = req.signedCookies;
    console.log("Cookies: ", a);
    console.log("Signed Cookies: ", b);
    next();
  } catch (err) {
    res.status(500).json({ type: "error", value: "Ошибка сервера" });
  }
};
