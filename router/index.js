const { Router } = require("express");
const userController = require("../controllers/user-controllers");
const adminController = require("../controllers/admin-controller");
const router = new Router();
const { check } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware");
const refreashTokenMiddleware = require("../middlewares/refreash-token-middleware");

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

router.post(
  "/brief",
  refreashTokenMiddleware,
  authMiddleware,
  userController.brief
);
router.get("/profile", authMiddleware, userController.profile);
router.get("/users", authMiddleware, userController.users);
router.post("/tasks", authMiddleware, userController.addtask);
router.get("/tasks", authMiddleware, userController.gettasks);
router.put("/tasks", authMiddleware, userController.updatetask);
router.delete(
  "/tasks/:id",
  authMiddleware,
  adminMiddleware,
  adminController.deletetask
);
module.exports = router;
