const User = require('../models/User')
const Donor = require('../models/Donor')
const BloodRequest = require('../models/BloodRequest')
const Inventory = require('../models/Inventory')

// GET dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments()
    const availableDonors = await Donor.countDocuments({ isAvailable: true })
    const totalRequests = await BloodRequest.countDocuments()
    const pendingRequests = await BloodRequest.countDocuments({ status: 'Pending' })
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'Fulfilled' })
    const emergencyRequests = await BloodRequest.countDocuments({ urgencyLevel: 'Emergency' })
    const totalUsers = await User.countDocuments()

    // Blood group breakdown of donors
    const bloodGroupStats = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Monthly donations (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRequests = await BloodRequest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    res.status(200).json({
      totalDonors,
      availableDonors,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      emergencyRequests,
      totalUsers,
      bloodGroupStats,
      monthlyRequests
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })

    res.status(200).json({
      count: users.length,
      users
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ACTIVATE or DEACTIVATE a user
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Admin cannot deactivate themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' })
    }

    user.isActive = !user.isActive
    await user.save()

    res.status(200).json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET all blood requests (admin view)
const getAllBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('requester', 'name email phone')
      .sort({ createdAt: -1 })

    res.status(200).json({
      count: requests.length,
      requests
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE any blood request status (admin only)
const adminUpdateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body

    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    res.status(200).json({
      message: `Request status updated to ${status}`,
      request
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ADD blood inventory
// Helper — calculate status from units and expiry
const calculateStatus = (units, expiryDate) => {
  if (new Date() > new Date(expiryDate)) return 'Expired'
  if (units === 0) return 'Critical'
  if (units <= 5) return 'Low'
  return 'Available'
}

// ADD blood inventory
const addInventory = async (req, res) => {
  try {
    const { hospital, upazila, bloodGroup, units, expiryDate } = req.body

    const status = calculateStatus(units, expiryDate)

    const inventory = await Inventory.create({
      hospital,
      upazila,
      bloodGroup,
      units,
      expiryDate,
      status,
      addedBy: req.user.id
    })

    res.status(201).json({
      message: 'Inventory added successfully!',
      inventory
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET all inventory
const getInventory = async (req, res) => {
  try {
    const { hospital, bloodGroup, status } = req.query

    const filter = {}
    if (hospital) filter.hospital = hospital
    if (bloodGroup) filter.bloodGroup = bloodGroup
    if (status) filter.status = status

    const inventory = await Inventory.find(filter)
      .sort({ status: 1, units: 1 })

    // Summary by blood group
    const summary = await Inventory.aggregate([
      { $match: { status: { $ne: 'Expired' } } },
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$units' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.status(200).json({
      count: inventory.length,
      summary,
      inventory
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE inventory units
const updateInventory = async (req, res) => {
  try {
    const { units } = req.body

    const existing = await Inventory.findById(req.params.id)

    if (!existing) {
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    const status = calculateStatus(units, existing.expiryDate)

    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { units, status },
      { new: true }
    )

    res.status(200).json({
      message: 'Inventory updated successfully!',
      inventory
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllBloodRequests,
  adminUpdateRequestStatus,
  addInventory,
  getInventory,
  updateInventory
}