const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['blood_request', 'request_accepted', 'request_fulfilled', 'general'],
    default: 'general'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  bloodRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)