const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
  hospital: {
    type: String,
    required: true,
    trim: true
  },
  upazila: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Available', 'Low', 'Critical', 'Expired'],
    default: 'Available'
  }
}, { timestamps: true })

module.exports = mongoose.model('Inventory', inventorySchema)