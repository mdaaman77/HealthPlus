const mongoose = require('mongoose');
const Appointment = require('./Appointment'); 

const doctorSchema = new mongoose.Schema({
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true,
        maxlength: [100, 'Specialization cannot exceed 100 characters']
    },
    experience: {
        type: Number,
        //required: [true, 'Experience is required'],
        min: [0, 'Experience cannot be negative']
    },
    consultationFee: {
        type: Number,
        required: [true, 'Consultation fee is required'],
        min: [0, 'Consultation fee cannot be negative']
    },
    availability: {
        type: Boolean,
        default: true
    },
    unavailableDates: [Date],
   // Professional Metrics
  patientSatisfaction: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.5
  },

  languages: [{
    type: String,
    enum: ['English', 'Urdu', 'Tamil', 'Hindi', 'Mathli', 'Kannad']
  }],

   qualifications: {
   
      type: String,
      required: true
    
  },

   license: {
      type: String,
      required: [true, 'License number is required'],
     // unique: true
  },
gender: {
    type: String,
  },
   phoneNo:{
        type: String,
      //  required: [true, 'Phone number is required'],
       // unique: true,
        trim: true,
        match: [/^\d{10}$/, 'Please enter a valid phone number']
,
    },
  
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }],


},
{
    timestamps: true    
})


doctorSchema.pre('save', function (next) {
  const now = new Date();
  this.unavailableDates = this.unavailableDates.filter(date => date > now);
  next();
});


module.exports = mongoose.model('Doctor', doctorSchema);
// This schema defines the structure for a Doctor document in MongoDB using Mongoose.