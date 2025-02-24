const { Router } = require("express");
const userController = require("../controllers/user-controllers");
const router = new Router();
const { check } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");

router.post(
  "/signup",
  [check("email", "Некорректный email").isEmail()],
  userController.registration
);
router.post(
  "/signin",
  [check("email", "Некорректный email").isEmail()],
  userController.login
);
router.post("/brief", authMiddleware, userController.brief);
router.get("/profile", authMiddleware, userController.profile);
router.get("/users", authMiddleware, userController.users);

module.exports = router;
