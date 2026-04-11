const mongoose = require('mongoose')

const bloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  unitsNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  hospital: {
    type: String,
    required: true,
    trim: true
  },
  upazila: {
    type: String,
    default: ''
  },
  urgencyLevel: {
    type: String,
    enum: ['Normal', 'Urgent', 'Emergency'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Fulfilled', 'Cancelled'],
    default: 'Pending'
  },
  contactNumber: {
    type: String,
    required: true
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  respondedDonors: [
    {
      donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor'
      },
      response: {
        type: String,
        enum: ['Accepted', 'Declined'],
      },
      respondedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('BloodRequest', bloodRequestSchema)