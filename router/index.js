const { Router } = require("express");
const userController = require("../controllers/user-controllers");
const router = new Router();
const { check } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");

router.get("/validationToken", authMiddleware, userController.validationToken);
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
router.post("/tasks", authMiddleware, userController.addtask);
router.get("/tasks", authMiddleware, userController.gettasks);

module.exports = router;
