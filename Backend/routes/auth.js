


const express= require("express");
const router = express.Router();

const { sendOTP,signup,logIn } = require("../Controllers/auth.js");



router.post("/send-otp", sendOTP);
router.post("/signup", signup);
router.post("/login", logIn); // Assuming login uses the same controller for now

module.exports = router;
