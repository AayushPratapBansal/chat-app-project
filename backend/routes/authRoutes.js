const express = require("express");
const {
  registerUser,
  loginUser,
} = require("../config/controllers/authController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
