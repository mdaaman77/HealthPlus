

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');



//controller for get patient profile

exports.getProfile = async (req, res) => {
    try {
        // Get the user ID from the request
        const userId = req.user.id;

        // Find the user by ID and populate their profile based on their role
        const user = await User.findById(userId).populate('profile').exec();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the user profile
        return res.status(200).json({
            success: true,
            user,
            message: "User profile retrieved successfully"

        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}


// Controller for updating patient profile
exports.updatePatientProfile = async (req, res) => {
    try {
        // Get the user ID from the request
        const userId = req.user.id;

        // Find the user by ID and update their profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    phoneNo: req.body.phone,
                    address: req.body.address,
                    gender: req.body,
                    height: req.body.height,
                    weight: req.body.weight,
                    dateOfBirth: req.body.dateOfBirth,

                }
            },
            { new: true, runValidators: true }
        ).populate('profile').exec();

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the updated user profile
        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "User profile updated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}


// Controller for updating doctor profile
exports.updateDoctorProfile = async (req, res) => {
    try {
        // Get the user ID from the request
        const userId = req.user.id;

        // Find the user by ID and update their profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {

                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    phoneNo: req.body.phone,
                    address: req.body.address,
                    specialization: req.body.specialization,
                    experience: req.body.experience,
                    qualifications: req.body.qualifications,
                    gender: req.body, gender,
                    PatientSatisfaction: req.body.PatientSatisfaction,
                    availability: req.body.availability,
                    $push: {
                        unavailableDates: {
                            $each: req.body.unavailableDates,
                        }

                    },
                }
            },
            { new: true, runValidators: true }
        ).populate('profile').exec();

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the updated user profile
        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Doctor profile updated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}


//get doctor profile when patient search for doctor
exports.getDoctorProfile = async (req, res) => {
    try {
        // Get the doctor ID from the request parameters
        const doctorId = req.params.id;

        // Find the doctor by ID and populate their profile
        const doctor = await User.findById(doctorId).populate('profile').exec();

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Return the doctor profile
        return res.status(200).json({
            success: true,
            doctor,
            message: "Doctor profile retrieved successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

