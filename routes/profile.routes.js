const { Router } = require("express");
const router = Router();
const Users = require("../models/Users");
const authMiddleware = require("../middlewares/auth-middleware");

// /api/profile/
router.get("/data", authMiddleware, async (req, res) => {
  try {
    const User = await Users.findOne({ _id: req.body._id });
    if (!User)
      return res
        .status(404)
        .json({ type: "error", value: "Пользователь не найден" });

    const dto = DTO(User);
    res.status(200).json({ type: "success", value: { ...dto } });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;

const DTO = (useser) => {
  const { name, surname, lastname, phoneNumber, role } = user;
  return {
    name: name,
    surname: surname,
    lastname: lastname,
    phoneNumber: phoneNumber,
    role: role,
  };
};
