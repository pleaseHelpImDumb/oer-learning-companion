const express = require("express");
const router = express.Router();

const { chat } = require("../controllers/aiController.js");

router.post("/chat", chat);

module.exports = router;
