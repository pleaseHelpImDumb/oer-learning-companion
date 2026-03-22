const express = require("express");
const router = express.Router();

const {
  startSession,
  getActiveSession,
  pauseSession,
  resumeSession,
  completeSession,
  cancelSession,
} = require("../controllers/sessionController.js");

// routes/sessionRoutes.js
router.post("/start", startSession);
router.get("/active", getActiveSession);
router.post("/:id/pause", pauseSession);
router.post("/:id/resume", resumeSession);
router.post("/:id/complete", completeSession); // finish with rewards
router.post("/:id/cancel", cancelSession); // end early, no rewards

module.exports = router;
