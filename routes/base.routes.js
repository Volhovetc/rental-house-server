require("dotenv").config();
const { Router } = require("express");
const router = Router();
const Users = require("../models/Users");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware");
// /api/base/
router.post("/data", authMiddleware, async (req, res) => {
  try {
    const User = await Users.findOne({ _id: req.body._id });
    if (!User)
      return res
        .status(404)
        .json({ type: "error", value: "Пользователь не найден" });

    const { name, surname, lastname, phoneNumber, _id } = req.body;
    await Users.findOneAndUpdate(
      { _id: _id },
      {
        ...User._doc,
        name: name,
        surname: surname,
        lastname: lastname,
        phoneNumber: phoneNumber,
      }
    );
    res.status(200).json({ type: "success", value: "Данные сохранены" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
