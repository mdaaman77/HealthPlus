const express = require('express');
const app = express(); 

const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');

//connect DB
const DB = require("./config/database");
DB.connect((err) => {
  console.log(err);
});

app.use(express.json());
app.use(cookieParser());



app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/doctor", doctorRoutes);    
app.use("/api/v1/patient", patientRoutes);

const whitelist = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN : "*";
  // ? JSON.parse(process.env.CORS_ORIGIN)
  

app.use(cors({
    origin: whitelist,
    credentials: true, 
    maxAge: 14400
}));




//defult route 
app.get("/", (req, res) => {
  res.json({ message: "Welcome to my API" });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
