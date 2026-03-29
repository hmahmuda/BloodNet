const express = require('express')
const router = express.Router()
const {
  createBloodRequest,
  getAllRequests,
  getRequestById,
  getMyRequests,
  respondToRequest,
  updateRequestStatus,
  getMyNotifications,
  markNotificationsRead
} = require('../controllers/bloodRequestController')
const { protect } = require('../middleware/authMiddleware')

// Public routes
router.get('/', getAllRequests)
router.get('/:id', getRequestById)

// Protected routes
router.post('/', protect, createBloodRequest)
router.get('/my/requests', protect, getMyRequests)
router.put('/:id/respond', protect, respondToRequest)
router.put('/:id/status', protect, updateRequestStatus)

// Notification routes
router.get('/notifications/my', protect, getMyNotifications)
router.put('/notifications/read', protect, markNotificationsRead)

module.exports = router