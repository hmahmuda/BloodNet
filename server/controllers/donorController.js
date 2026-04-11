const Donor = require('../models/Donor')

// Helper — check if 90 days have passed since last donation
const isEligibleToDonate = (lastDonationDate) => {
  if (!lastDonationDate) return true
  const today = new Date()
  const last = new Date(lastDonationDate)
  const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24))
  return diffDays >= 90
}

// CREATE donor profile (after registration)
const createDonorProfile = async (req, res) => {
  try {
    const { bloodGroup, upazila, phone, dateOfBirth, gender, weight } = req.body

    // Check if donor profile already exists
    const existing = await Donor.findOne({ user: req.user.id })
    if (existing) {
      return res.status(400).json({ message: 'Donor profile already exists' })
    }

    const donor = await Donor.create({
      user: req.user.id,
      bloodGroup,
      upazila,
      phone,
      dateOfBirth,
      gender,
      weight
    })

    res.status(201).json({
      message: 'Donor profile created successfully!',
      donor
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET my donor profile
const getMyProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id })
      .populate('user', 'name email')

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' })
    }

    // Auto check eligibility based on last donation
    const eligible = isEligibleToDonate(donor.lastDonationDate)
    if (!eligible && donor.isAvailable) {
      donor.isAvailable = false
      await donor.save()
    } else if (eligible && !donor.isAvailable) {
      donor.isAvailable = true
      await donor.save()
    }

    res.status(200).json(donor)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE donor profile
const updateDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id })

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' })
    }

    const { upazila, phone, weight, medicalConditions } = req.body

    if (typeof upazila === 'string' && upazila.trim()) {
      donor.upazila = upazila.trim()
    }

    if (typeof phone === 'string' && phone.trim()) {
      donor.phone = phone.trim()
    }

    if (weight !== undefined && weight !== null && weight !== '') {
      const normalizedWeight = Number(weight)
      if (Number.isNaN(normalizedWeight) || normalizedWeight <= 0) {
        return res.status(400).json({ message: 'Weight must be a positive number' })
      }
      donor.weight = normalizedWeight
    }

    if (typeof medicalConditions === 'string') {
      donor.medicalConditions = medicalConditions.trim() || 'None'
    }

    await donor.save()

    res.status(200).json({
      message: 'Profile updated successfully!',
      donor
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// TOGGLE availability
const toggleAvailability = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id })

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' })
    }

    // Check 90 day rule before allowing available
    if (!donor.isAvailable) {
      const eligible = isEligibleToDonate(donor.lastDonationDate)
      if (!eligible) {
        return res.status(400).json({
          message: 'You cannot mark yourself available — 90 days have not passed since your last donation'
        })
      }
    }

    donor.isAvailable = !donor.isAvailable
    await donor.save()

    res.status(200).json({
      message: `You are now ${donor.isAvailable ? 'Available ✅' : 'Unavailable ❌'}`,
      isAvailable: donor.isAvailable
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// SEARCH donors by blood group and upazila
const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, upazila } = req.query

    // Build the search filter
    const filter = { isAvailable: true }

    // Case-insensitive blood group search
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup.toUpperCase()
    }

    // Exclude donors who have donated within the last 90 days
    const donationCycleDays = 90
    const cycleDate = new Date(Date.now() - donationCycleDays * 24 * 60 * 60 * 1000)

    // Auto-restore donors whose 90-day cooldown has passed
    await Donor.updateMany(
      { isAvailable: false, lastDonationDate: { $ne: null, $lte: cycleDate } },
      { isAvailable: true }
    )

    filter.$or = [
      { lastDonationDate: null },
      { lastDonationDate: { $lte: cycleDate } }
    ]

    // Case-insensitive upazila search
    if (upazila) {
      filter.upazila = { $regex: upazila, $options: 'i' }
    }

    const donors = await Donor.find(filter)
      .populate('user', 'name email')
      .sort({ updatedAt: -1 })

    res.status(200).json({
      count: donors.length,
      donors
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET single donor by ID
const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id)
      .populate('user', 'name email')

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' })
    }

    res.status(200).json(donor)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ADD donation to history
const addDonationRecord = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id })

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' })
    }

    const { hospital, notes } = req.body

    donor.donationHistory.push({
      date: new Date(),
      hospital,
      bloodGroup: donor.bloodGroup,
      notes
    })

    donor.lastDonationDate = new Date()
    donor.totalDonations += 1
    donor.isAvailable = false

    await donor.save()

    res.status(200).json({
      message: 'Donation recorded successfully! 🩸',
      donor
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  createDonorProfile,
  getMyProfile,
  updateDonorProfile,
  toggleAvailability,
  searchDonors,
  getDonorById,
  addDonationRecord
}