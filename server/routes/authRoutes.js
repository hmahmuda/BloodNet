const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// Public routes
router.post('/register', register)
router.post('/login', login)

// Protected route (must be logged in)
router.get('/me', protect, getMe)

module.exports = router