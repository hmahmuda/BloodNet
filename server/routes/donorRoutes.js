const express = require('express')
const router = express.Router()
const {
  createDonorProfile,
  getMyProfile,
  updateDonorProfile,
  toggleAvailability,
  searchDonors,
  getDonorById,
  addDonationRecord
} = require('../controllers/donorController')
const { protect } = require('../middleware/authMiddleware')

// Public routes
router.get('/search', searchDonors)
router.get('/:id', getDonorById)

// Protected routes (must be logged in)
router.post('/profile', protect, createDonorProfile)
router.get('/profile/me', protect, getMyProfile)
router.put('/profile/update', protect, updateDonorProfile)
router.put('/toggle-availability', protect, toggleAvailability)
router.post('/add-donation', protect, addDonationRecord)

module.exports = router