const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/jwtMiddleware.js");

const {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  onboard,
  getCurrentUser,
  incrementBreakCount,
  getWeekStats,
  getUserSessions,
  getUserSessionsEOD,
  consumeToken24hrs,
  getUserStats,
} = require("../controllers/userController.js");

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/onboard", authMiddleware, onboard);
router.post("/logout", logout);
router.get("/profile", authMiddleware, getCurrentUser);

router.post("/add-break", authMiddleware, incrementBreakCount);

router.get("/week-stats", authMiddleware, getWeekStats);

router.get("/sessions", authMiddleware, getUserSessions);
router.get("/sessions24hrs", authMiddleware, getUserSessionsEOD);
router.post("/consume-token-24hrs", authMiddleware, consumeToken24hrs);

router.get("/stats", authMiddleware, getUserStats);

module.exports = router;
