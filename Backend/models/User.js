const mongoose = require('mongoose');
const patient = require('./Patient');
const doctor = require('./Doctor');


const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
       required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']

    },
    lastName:{
        type:String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Exclude password from queries by default
    },
    role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  token: {
   type:String,
  },
  image: {
    type: String,
    required: true,
  },

  profile:{
    type:mongoose.Schema.Types.ObjectId,
    refPath: 'role',
  },

})

module.exports = mongoose.model('User', userSchema);