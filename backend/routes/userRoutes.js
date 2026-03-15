const express = require("express");
const { getAllUsers } = require("../config/controllers/userController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, getAllUsers);

module.exports = router;
