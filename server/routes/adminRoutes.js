const express = require('express')
const router = express.Router()
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllBloodRequests,
  adminUpdateRequestStatus,
  addInventory,
  getInventory,
  updateInventory
} = require('../controllers/adminController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

// All admin routes are protected + admin only
router.use(protect, adminOnly)

// Dashboard
router.get('/stats', getDashboardStats)

// Users
router.get('/users', getAllUsers)
router.put('/users/:id/toggle', toggleUserStatus)

// Blood requests
router.get('/requests', getAllBloodRequests)
router.put('/requests/:id/status', adminUpdateRequestStatus)

// Inventory
router.get('/inventory', getInventory)
router.post('/inventory', addInventory)
router.put('/inventory/:id', updateInventory)

module.exports = router