const jwt = require("jsonwebtoken");
require("dotenv").config();
const Users = require("../models/Users");
module.exports = async function (req, res, next) {
  try {
    const tokens = JSON.parse(req.cookies.tokens);
    if (!tokens)
      return res
        .status(401)
        .json({ type: "error", value: "Авторизация не пройдена" });

    const accessToken = tokens.accessToken;
    const refreshToken = tokens.refreshToken;

    if (!accessToken)
      return res
        .status(401)
        .json({ type: "error", value: "Авторизация не пройдена" });
    if (!refreshToken)
      return res
        .status(401)
        .json({ type: "error", value: "Авторизация не пройдена" });

    const decodedTokenAccess = jwt.verify(
      accessToken,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          return undefined;
        }
        return decoded;
      }
    );
    const decodedTokenRefresh = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          return undefined;
        }
        return decoded;
      }
    );

    if (decodedTokenAccess) {
      const candidate = await Users.findOne({ _id: decodedTokenAccess.userId });
      if (candidate) {
        req.body._id = candidate._id;
        req.body.role = candidate.role;
        return next();
      }
      if (!candidate) {
        return res
          .status(401)
          .json({ type: "error", value: "Авторизация не пройдена" });
      }
    }
    if (!decodedTokenAccess && decodedTokenRefresh) {
      const candidate = await Users.findOne({
        _id: decodedTokenRefresh.userId,
      });
      if (!candidate) {
        return res
          .status(401)
          .json({ type: "error", value: "Авторизация не пройдена" });
      }
      if (candidate.tokenRefresh !== refreshToken) {
        return res
          .status(401)
          .json({ type: "error", value: "Авторизация не пройдена" });
      }
      const newAccessToken = jwt.sign(
        { userId: candidate._id, role: candidate.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      const newRefreshToken = jwt.sign(
        { userId: candidate._id, role: candidate.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      const options = {
        path: "/",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      };
      const tokens = JSON.stringify({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
      res.cookie("tokens", tokens, options);
      await Users.findOneAndUpdate(
        { _id: decodedTokenRefresh.userId },
        { tokenRefresh: newRefreshToken }
      );
      req.body._id = candidate._id;
      req.body.role = candidate.role;
      return next();
    }
    if (!decodedTokenRefresh)
      return res
        .status(401)
        .json({ type: "error", value: "Авторизация не пройдена" });
  } catch (err) {
    res.status(500).json({ type: "error", value: "err" });
  }
};
