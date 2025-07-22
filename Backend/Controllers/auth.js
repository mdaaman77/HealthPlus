const dotenv = require('dotenv');
dotenv.config();
// Import necessary modules
const mongoose = require('mongoose');
const mailSender = require('../utils/MailSender.js');

const OTPGenerator = require("otp-generator");
const express = require('express');
const User = require("../models/User.js");
const OTP = require("../models/OTP.js");
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const cookie = require("js-cookie");
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor.js');


// Controller for sending OTP
exports.sendOTP = async (req, res) => {
    try {

        // Validate the request body
        const { email } = req.body;
        // Check if email is provided
        if (email === undefined || email === null || email === "") {
            return res.status(400).json({ message: "Email Invalid" });
        }
        // Validate the email if already exists in the database
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({
                message: "User already exists with this email"
            })
        }

        // Generate a 6-digit OTP with only numbers

        var otp = OTPGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
       console.log("Generated OTP:", otp);
        // Check if the OTP already exists in the database
        // If it does, generate a new one until a unique OTP is found
        var result = await OTP.findOne({ otp:otp });
        if(result) console.log("otp not same");
        // Ensure the OTP is unique
        while (result) {
            otp = OTPGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
             //result = await OTP.findOne({ otp:otp });
        }

        console.log("createing otp");

        const otpData = await OTP.create({
            email: email,
            otp: otp
        });
console.log("otp sent successfully", otpData.otp);
        return res.status(200).json({
            message: "OTP sent successfully",
            otp: otpData.otp
        });

    } catch (e) {
        console.log("Error in OTP", e.message);
        console.error(e);
        // throw e;
        return res.status(500).json({
            success: false,
            message: `ERROR on sending OTP`,
        });
    }
}


//controller for signup

exports.signup = async (req, res) => {

    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            role,
            otp,
            specialization,
            consultationFee,
            qualifications,
            license,
        } = req.body;


        if (!firstName || !lastName || !email || !password || !confirmPassword || !role || !otp) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
       console.log("Received data:", req.body);
        // Validate the role 
        if (role == "doctor") {
            if (!specialization || !consultationFee || !qualifications || !license) {
                return res.status(400).json({
                    message: "All fields are required"
                });
            }
        }
        
        // Validate the email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }
        // Check if the password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }
        // Check if the user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }
console.log("Checking OTP for email:", email, "with OTP:", otp);
        // Check if the OTP is valid
   const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log("your otp db response",response);
    console.log("your DB OTP:", response[0].otp);
    
    if (!response.length) {
  res.status(400).json({
    success: false,
    message: "The OTP is not valid",
  });
  console.log("Returned for empty response");
  return;
}

if (otp !== response[0].otp) {
  res.status(400).json({
    success: false,
    message: "The OTP is not valid",
  });
  console.log("Returned for OTP mismatch");
  return;
}

console.log("OTP validated, proceeding to create user...");

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Hashed password:", hashedPassword);

//create a doctor or patient profile based on the role
        if (role == "doctor") {

            var newDoctor = await Doctor.create({
                specialization: specialization,
                consultationFee: consultationFee,
                experience: 0,
                availability: true,
                patientSatisfaction: 4.5,
                languages: ['English'],
                license: license,
                qualifications: qualifications,
                gender: null,
                phoneNo: null,
                unavailableDates: [],
                appointments: [],
                   // user: newUser._id, // Associate the doctor with the user
            })
        }
        else if (role == "patient") {
            // Create a patient profile if the user is a patient
            var newPatient = await Patient.create({
                dateOfBirth: null,
                bloodGroup: null,
                height: null,
                weight: null,
                gender: null,
                //user: newUser._id, // Associate the patient with the user
                appointments: [],
            })
        }

//create a new user
 const newUser = await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            role: role,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName + lastName}`,
            profile: role === 'doctor' ? newDoctor._id : newPatient._id, // Associate the profile with the user

            token: null, // Token will be generated during login
        })


console.log("New user created:", newUser);
       
        return res.status(201).json({
            success: true,
            newUser,
            message: "User created successfully"
        })


    } catch (e) {
        console.log("Error in signup", e.message);
        // Log the error for debugging purposes
        console.error(e);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        });

    }
}


//login controller


 exports.logIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        //
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        //
        const user = await User.findOne({ email: email }).select("+password").populate("profile").exec();;

        if (!user) {
            return res.status(400).json({
                message: "User does not exist with this email"
            });
        }
        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        //
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };
        // Generate a token for the user

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 24 * 60 * 60,
        });
        user.token = token;
        await user.save();

        // Set the token in a cookie and send the response
        
         const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

console.log("Login Succesfully" , user);
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });




    }catch(e){

console.log("Error in login", e);
    return res.status(500).json({
      success: false,
      message: "not login caught error",
    });

    }


    }

