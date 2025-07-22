const mongoose = require('mongoose');

const appointmentStatuses = [
  'scheduled',
  'completed',
  'cancelled',
  'rescheduled'
];

const cancellationReasons = [
  'patient',
  'doctor',
  'emergency',
  'other'
];

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  dateTime: {
    type: Date,
    required: [true, 'Appointment time is required'],
  },
  expireAt: {
    type: Date,
    default: function() {
      return new Date(this.dateTime.getTime() + 30 * 60 * 1000); // 30 min after appointment
    },
    index: { expires: 0 }
  },
  status: {
    type: String,
    enum: appointmentStatuses,
    default: 'scheduled',
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cancellation: {
    reason: {
      type: String,
      enum: cancellationReasons,
    },
  },
  isModified: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Appointment', appointmentSchema);
// This model handles appointment scheduling, status updates, and cancellation reasons.