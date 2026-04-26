const express = require("express");
const router = express.Router();

const { chat, getChatHistory } = require("../controllers/aiController.js");

router.post("/chat", chat);
router.get("/history", getChatHistory);

module.exports = router;
