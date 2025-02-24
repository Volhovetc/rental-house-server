const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  try {
    const authorizationHeader = req.headers.Authorization;
    if (!authorizationHeader)
      return res
        .status(401)
        .json({ type: "error", value: "Авторизация не пройдена" });
    const accessToken = req.headers.authorization.split(" ")[1];
    if (!accessToken)
      return res
        .status(401)
        .json({ type: "error", value: "Авторизация не пройдена" });
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.body._id = decodedToken.userId;
    next();
  } catch (err) {
    res.status(500).json({ type: "error", value: "Ошибка сервера" });
  }
};
