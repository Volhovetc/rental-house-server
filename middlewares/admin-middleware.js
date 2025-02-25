const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  try {
    const accessToken = req.header("Authorization").split(" ")[1];
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    const userRole = decodedToken.role;
    if (userRole !== "admin")
      return res
        .status(403)
        .json({ type: "error", value: "У вас недостаточно прав" });

    next();
  } catch (err) {
    res.status(500).json({ type: "error", value: "Ошибка сервера" });
  }
};
