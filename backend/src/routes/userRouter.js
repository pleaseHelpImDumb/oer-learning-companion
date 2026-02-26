const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/jwtMiddleware.js");

const {
  login,
  register,
  chat,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController.js");

router.post("/login", login);
router.post("/register", register);

//router.post("/chat", chat);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/logout", authMiddleware, logout);

module.exports = router;
