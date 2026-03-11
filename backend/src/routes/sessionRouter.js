const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/jwtMiddleware.js");

const { startSession } = require("../controllers/sessionController.js");

router.post("/start", startSession); //already auth in server.js for ANYTHING session

module.exports = router;
