

const express = require("express");
const router = express.Router();
const { getProfile, updateDoctorProfile } = require("../Controllers/profile.js");
const {  getAppointmentDetails, cancelAppointment, getDoctorAppointments } = require("../Controllers/appointment.js");
const { auth, isDoctor } =require("../middlewares/auth.js"); 


// Route to get doctor profile
router.get("/profile", auth, isDoctor, getProfile);
// Route to update doctor profile
router.post("/profile", auth, isDoctor, updateDoctorProfile);
// Route to get appointment details
router.get("/appointment/:id", auth, isDoctor, getAppointmentDetails);
// Route to cancel an appointment
router.delete("/appointment/:id", auth, isDoctor, cancelAppointment);
// Route to get all appointments of a doctor
router.get("/all/appointments", auth, isDoctor, getDoctorAppointments);
// Export the router
module.exports = router;