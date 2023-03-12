const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

router
  .route("/:searchQuery")
  .get(authController.protect, userController.getAllUsers);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);

module.exports = router;
