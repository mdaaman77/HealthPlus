





const express = require("express");
const router = express.Router();
const {getProfile, updatePatientProfile,getDoctorProfile} = require("../Controllers/profile.js");
const {createAppointment,getAppointmentDetails,cancelAppointment,modifyAppointment,getPatientAppointments}= require("../Controllers/appointment.js");

const {auth,isPatient} = require("../middlewares/auth.js");


// Route to get patient profile
router.get("/profile", auth, isPatient, getProfile);
// Route to update patient profile
router.post("/profile", auth, isPatient, updatePatientProfile);
// Route to create an appointment
router.post("/createAppointment", auth, isPatient, createAppointment);
// Route to get appointment details'
router.get("/appointmentDetail/:id", auth, isPatient, getAppointmentDetails);
// Route to cancel an appointment
router.delete("/appointment/:id", auth, cancelAppointment);
// Route to modify an appointment
router.post("/appointment/:id", auth, isPatient, modifyAppointment);
// Route to get all appointments of a patient
router.get("/all/appointments", auth, isPatient, getPatientAppointments);
// Route to get details of a doctor
router.get("/doctor/:id", auth, isPatient, getDoctorProfile); // Uncomment if needed


// Export the router

module.exports = router;
