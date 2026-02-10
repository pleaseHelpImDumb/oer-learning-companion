const express = require("express");
const router = express.Router();

const { logon, register, chat } = require("../controllers/userController.js");

router.get("/logon", logon);

router.post("/register", register);

router.post("/chat", chat);

module.exports = router;
