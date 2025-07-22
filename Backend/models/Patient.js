const mongoose = require('mongoose');
const Appointment = require('./Appointment'); // Assuming you have an Appointment model

const patientSchema = new mongoose.Schema({
    dateOfBirth:{
        type: Date,      
    },
    bloodGroup:{
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    height:{
        type: Number,
      //  required: true,
    },
    weight:{
        type: Number,
      //  required: true,
    },

    gender: {
    type: String,
  },
   phoneNo:{
        type: Number,
        trim: true,
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
      }],
      
})

module.exports = mongoose.model('Patient', patientSchema);
