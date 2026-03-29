const User = require('../models/User')
const Donor = require('../models/Donor')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })
}

// REGISTER
const register = async (req, res) => {
  let user

  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      bloodGroup,
      upazila,
      dateOfBirth,
      gender,
    } = req.body
    const userRole = role || 'donor'

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    if (userRole === 'donor' && (!bloodGroup || !dateOfBirth || !gender)) {
      return res.status(400).json({
        message: 'Blood group, date of birth, and gender are required for donor registration'
      })
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create the user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: userRole,
      bloodGroup,
      upazila
    })

    let isAvailable = user.isAvailable

    if (userRole === 'donor') {
      const donor = await Donor.create({
        user: user._id,
        bloodGroup,
        upazila,
        phone,
        dateOfBirth,
        gender,
      })

      isAvailable = donor.isAvailable
    }

    // Send back the token
    res.status(201).json({
      message: 'Registration successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        upazila: user.upazila,
        isAvailable
      }
    })

  } catch (error) {
    if (user) {
      await User.findByIdAndDelete(user._id).catch(() => null)
    }
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Send back the token
    res.status(200).json({
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        upazila: user.upazila,
        isAvailable: user.isAvailable
      }
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET LOGGED IN USER PROFILE
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { register, login, getMe }