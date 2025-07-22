const bcrypt = require('bcryptjs');

const jwt = require("jsonwebtoken");
const { check, validationResult } = require("email-validator");
require("dotenv").config();
const User = require("../models/User");


// Middleware to authenticate the user using JWT
exports.auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        const token =
            (authHeader && authHeader.replace(/bearer\s+/i, "")) ||
            req.cookies?.token ||
            req.body?.token;

        if (!token) {
            return res.status(401).json({ error: "Please authenticate using a valid token" });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (e) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid",
            });
        }

        next();
    } catch (e) {
        console.log(e);
        return res.status(401).json({
            success: false,
            message: `Something went wrong while validating the token`,
        });
    }
};


// Middleware to check if the user is an admin

exports.isPatient = async (req, res, next) => {
    try{
        const user = req.user;

        if(user.role !== "patient"){
            return res.status(403).json({
                success: false,
                message: "Access denied, you are not a patient"
            });
        }

        // If the user is a patient, proceed to the next middleware or route handler
        next();


    }catch(e){
        console.error(e);
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
            
    }
}



// Middleware to check if the user is a doctor
exports.isDoctor = async (req, res, next) => {
    try{
        const user = req.user;

        if(user.role !== "doctor"){
            return res.status(403).json({
                success: false,
                message: "Access denied, you are not a doctor"
            });
        }

        // If the user is a doctor, proceed to the next middleware or route handler
        next(); 
    }
    catch(e){
     console.error(e);
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
           
     
    }
}


// Middleware to check if the user is an admin
exports.isAdmin = async (req, res, next) => {
    try{
        const user = req.user;

        if(!user.role !== "admin"){
            return res.status(403).json({
                success: false,
                message: "Access denied, you are not an admin"
            });
        }

        // If the user is an admin, proceed to the next middleware or route handler
        next();
    }catch(e){
        console.error(e);
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
}

