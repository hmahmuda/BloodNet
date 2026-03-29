const mongoose = require('mongoose')

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  upazila: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  donationHistory: [
    {
      date: { type: Date },
      hospital: { type: String },
      bloodGroup: { type: String },
      notes: { type: String }
    }
  ],
  weight: {
    type: Number,
    default: null
  },
  medicalConditions: {
    type: String,
    default: 'None'
  }
}, { timestamps: true })

module.exports = mongoose.model('Donor', donorSchema)