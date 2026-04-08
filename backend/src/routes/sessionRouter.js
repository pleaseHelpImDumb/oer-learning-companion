const express = require("express");
const router = express.Router();

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
} = require("../controllers/sessionController.js");

// routes/sessionRoutes.js
router.post("/start", startSession);
router.get("/active", getActiveSession);
router.post("/:id/pause", pauseSession);
router.post("/:id/resume", resumeSession);
router.post("/:id/complete", completeSession); // finish with rewards
router.post("/:id/cancel", cancelSession); // end early, no rewards

router.post("/:id/notes", setSessionNotes); // set notes
router.get("/:id/notes", getSessionNotes); // get notes

router.post("/:id/break", createWellnessCheck); // wellness check

module.exports = router;
