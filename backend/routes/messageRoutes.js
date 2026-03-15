const express = require("express");
const { getMessages } = require("../config/controllers/messageController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, getMessages);

module.exports = router;
