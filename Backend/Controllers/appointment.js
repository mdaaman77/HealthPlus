const appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const mongoose = require('mongoose');


// Controller for creating an appointmentS

exports.createAppointment = async (req, res) => {
    try{
 
    const {userId,email} = req.user.id;
    const { doctorId, date, timeSlot , reason } = req.body;

    // Validate the request body
    if (!doctorId || !date || !timeSlot) {
        return res.status(400).json({ message: "Doctor ID, date, and time are required" });
    }
    // Check if the doctor exists
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });   
    }


    //date and time is greater than current date and time
    const currentDate = new Date();
    const combined = new Date(`${date}T${timeSlot}:00.000Z`);

    console.log("Combined Date:", combined);
    console.log("Current Date:", currentDate);

    if (combined < currentDate) {
        return res.status(400).json({ message: "Appointment date and time must be in the future" });   
    }

   console.log("curr date> selected date");

    //check doctor availability at that day only
    const unavailableDates = await Doctor.find({ _id: doctorId }, 'unavailableDates').exec();
    if(unavailableDates.length != 0){
    const isAvailable = doctor.unavailableDates.some(unavailableDate => {
        return unavailableDate.toISOString().split('T')[0] === date;
    });
   

    if (isAvailable) {
        return res.status(400).json({ message: "Doctor is not available on this date" });   
    }
    }
 console.log("doctor not add unvailable date");
      const startTime = new Date(combined.getTime() - 30 * 60 * 1000); // 30 minutes before
         const lastTime = new Date(combined.getTime() + 30 * 60 * 1000); // 30 minutes after
    //check if there is already an appointment for that doctor on that date and time
    const existingAppointment = await appointment.findOne({
        doctor: doctorId,
        dateTime: {
            $gte: startTime,
            $lte: lastTime,
        },
    });


    if (existingAppointment) {
        return res.status(400).json({ message: "Appointment already exists for this doctor on this date and time" });   
    }
    
 console.log("doctor avialiable in this data");

 const patient = await Patient.findOne({email:email});
    // Create a new appointment
    const newAppointment = await appointment.create({
        patient: patient._id,
        doctor: doctorId,
        dateTime: combined,
        status: 'scheduled',
        notes: reason,
        isModified: false,
    });
    console.log("new appointment created",newAppointment); 

    // Add the appointment to the doctor's appointments array
     doctor.appointments.push(newAppointment._id);
    await doctor.save();
console.log("doctor appointment updated",doctor.appointments);

    // Add the appointment to the patient's appointments array
    
    if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
    }
    patient.appointments.push(newAppointment._id);
    await patient.save();
console.log("patient appointment updated",patient.appointments);
    // Return the created appointment
    return res.status(201).json({  

        success: true,
        message: "Appointment created successfully",
        appointment: newAppointment
        
    })

    }catch(e){
        console.log("Error creating appointment:", e.message);
        console.error("Error creating appointment:", e.message);
        return res.status(500).json({ success: false, message: "Error creating appointment" });

    }
}


//get appointment details by appointment ID

exports.getAppointmentDetails = async (req, res) => {
    try {

        const appointmentId = req.params.id;
        console.log("Appointment ID:", appointmentId);
        // Validate the appointment ID
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }

        // Find the appointment by ID
        const appointmentDetails = await appointment.findById(appointmentId)
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName email').exec();;

        if (!appointmentDetails) {
            return res.status(404).json({ message: "Appointment not found" });
        }
console.log("Appointment Details:", appointmentDetails);
        return res.status(200).json({
            success: true,
            appointment: appointmentDetails
        });

    } catch (error) {
        console.error("Error fetching appointment details:", error.message);
        return res.status(500).json({ success: false, message: "Error fetching appointment details" });
    }
}   



// Controller for canceling an appointment
exports.cancelAppointment = async (req, res) => {   
    try {
        const appointmentId = req.params.id;

        // Validate the appointment ID
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }

        // Find the appointment by ID
        const appointmentToCancel = await appointment.findById(appointmentId)
            .populate('doctor', 'firstName lastName email')     
            .populate('patient', 'firstName lastName email').exec();;
        if (!appointmentToCancel) {
            return res.status(404).json({ message: "Appointment not found" });
        }       
        // Check if the appointment is already canceled
        if (appointmentToCancel.status === 'cancelled') {
            return res.status(400).json({ message: "Appointment is already canceled" });
        }
        // Update the appointment status to 'cancelled'
        appointmentToCancel.status = 'cancelled';
        appointmentToCancel.cancellation.reason = req.body.reason || 'patient'; // Default reason is 'patient'
        await appointmentToCancel.save();   

        // Remove the appointment from the doctor's appointments array
        const doctor = await Doctor.findById(appointmentToCancel.doctor);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }   
        const doctorIndex = doctor.appointments.indexOf(appointmentId);
        if (doctorIndex !== -1) {   
            doctor.appointments.splice(doctorIndex, 1); // Remove the appointment
        }
        await doctor.save();

        // Remove the appointment from the patient's appointments array
        const patient = await Patient.findById(appointmentToCancel.patient);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        const patientIndex = patient.appointments.indexOf(appointmentId);
        if (patientIndex !== -1) {
            patient.appointments.splice(patientIndex, 1); // Remove the appointment
        }   
        await patient.save();

        // Return the canceled appointment
        return res.status(200).json({   
            success: true,
            message: "Appointment canceled successfully",
            appointment: appointmentToCancel
        }); 

    } catch (error) {
        console.error("Error canceling appointment:", error.message);   
        return res.status(500).json({ success: false, message: "Error canceling appointment" });
    }
}



// Controller for modify  by removing previous appointment with  rescheduling
exports.modifyAppointment = async (req, res) => {
    try {
        const { appointmentId, newDate, newTimeSlot } = req.body;

        // Validate the request body
        if (!appointmentId || !newDate || !newTimeSlot) {
            return res.status(400).json({ message: "Appointment ID, new date, and new time slot are required" });
        }

        // Check if the appointment exists
        const appointmentToModify = await appointment.findById(appointmentId);
        if (!appointmentToModify) {
            return res.status(404).json({ message: "Appointment not found" });
        }       
        // Check if the new date and time are in the future
        const currentDate = new Date();
        const newDateTime = new Date(`${newDate}T${newTimeSlot}:00.000Z`);
        if (newDateTime < currentDate) {    
            return res.status(400).json({ message: "New appointment date and time must be in the future" });
        }   
        // Check if the doctor is available on the new date
        const doctor = await Doctor.findById(appointmentToModify.doctor);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }           
        const isAvailable = doctor.unavailableDates.some(unavailableDate => {
            return unavailableDate.toISOString().split('T')[0] === newDate;
        }); 
        if (isAvailable) {
            return res.status(400).json({ message: "Doctor is not available on the new date" });
        }
        // Check if there is already an appointment for the doctor on the new date and time
        const existingAppointment = await appointment.findOne({
            doctor: appointmentToModify.doctor,
            dateTime: newDateTime,
        });

        if (existingAppointment) {
            return res.status(400).json({ message: "Appointment already exists for this doctor on the new date and time" });
        }
        // Update the appointment with the new date and time
        appointmentToModify.dateTime = newDateTime;
        appointmentToModify.status = 'rescheduled';
        appointmentToModify.isModified = true; // Mark as modified
        await appointmentToModify.save();
        // Remove the previous appointment from the doctor's appointments array and add the modified appointment
        const doctorIndex = doctor.appointments.indexOf(appointmentId);
        if (doctorIndex !== -1) {
            doctor.appointments.splice(doctorIndex, 1); // Remove the old appointment
        }       
        doctor.appointments.push(appointmentToModify._id); // Add the modified appointment
        await doctor.save();
        // Remove the previous appointment from the patient's appointments array and add the modified appointment
        const patient = await Patient.findById(appointmentToModify.patient);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }           
        const patientIndex = patient.appointments.indexOf(appointmentId);
        if (patientIndex !== -1) {
            patient.appointments.splice(patientIndex, 1); // Remove the old appointment
        }   
        patient.appointments.push(appointmentToModify._id); // Add the modified appointment
        await patient.save();


        // Return the modified appointment
        return res.status(200).json({
            success: true,
            message: "Appointment modified successfully",
            appointment: appointmentToModify
        });

    } catch (error) {
        console.error("Error modifying appointment:", error.message);   
        return res.status(500).json({ success: false, message: "Error modifying appointment" });
    }
}


// Controller for getting all appointments of a patient
exports.getPatientAppointments = async (req, res) => {  
    try {
        const userId = req.user.id;

        // Find the patient by ID and populate their appointments
        const patient = await Patient.findById(userId)
            .populate('appointments').exec();;
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }   
        // Return the patient's appointments
        return res.status(200).json({
            success: true,
            appointments: patient.appointments
        }); 
    } catch (error) {
        console.error("Error fetching patient appointments:", error.message);   
        return res.status(500).json({ success: false, message: "Error fetching patient appointments" });
    }
}   

// Controller for getting all appointments of a doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the doctor by ID and populate their appointments
        const doctor = await Doctor.findById(userId)
            .populate('appointments').exec();;
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }   
        // Return the doctor's appointments
        return res.status(200).json({
            success: true,
            appointments: doctor.appointments
        }); 
    } catch (error) {
        console.error("Error fetching doctor appointments:", error.message);   
        return res.status(500).json({ success: false, message: "Error fetching doctor appointments" });
    }
}


// Controller for getting all appointments
exports.getAllAppointments = async (req, res) => {  
    try {
        // Find all appointments and populate patient and doctor details
        const allAppointments = await appointment.find({})
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName email').exec();;

        if (!allAppointments || allAppointments.length === 0) {
            return res.status(404).json({ message: "No appointments found" });
        }

        // Return all appointments
        return res.status(200).json({
            success: true,
            appointments: allAppointments
        });

    } catch (error) {
        console.error("Error fetching all appointments:", error.message);
        return res.status(500).json({ success: false, message: "Error fetching all appointments" });
    }
}


