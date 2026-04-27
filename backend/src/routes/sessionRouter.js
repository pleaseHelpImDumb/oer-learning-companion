const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/jwtMiddleware.js");

const {
  startSession,
  getActiveSession,
  pauseSession,
  resumeSession,
  completeSession,
  cancelSession,
  setSessionNotes,
  getSessionNotes,
  createWellnessCheck,
  spendToken,
} = require("../controllers/sessionController.js");

// routes/sessionRoutes.js
router.post("/start", startSession); // start a session
router.get("/active", getActiveSession); // get active session (called when going to dashboard) (also cancels any old >12hr sessions)
router.post("/:id/pause", pauseSession); // pause session
router.post("/:id/resume", resumeSession); // resume session
router.post("/:id/complete", completeSession); // finish with rewards
router.post("/:id/cancel", cancelSession); // end early, no rewards

router.post("/:id/notes", setSessionNotes); // set notes
router.get("/:id/notes", getSessionNotes); // get notes

router.post("/:id/break", createWellnessCheck); // wellness check

router.post("/:id/consume-token", authMiddleware, spendToken);

module.exports = router;
