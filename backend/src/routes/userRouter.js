const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/jwtMiddleware.js");

const {
  login,
  register,
  chat,
  logout,
} = require("../controllers/userController.js");

router.post("/login", login);
router.post("/register", register);

router.post("/chat", chat);

router.post("/logout", authMiddleware, logout);

module.exports = router;
