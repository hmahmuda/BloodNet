const BloodRequest = require('../models/BloodRequest')
const Donor = require('../models/Donor')
const Notification = require('../models/Notification')

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const recordDonationForAcceptedDonor = async (bloodRequest) => {
  const acceptedDonorResponse = bloodRequest.respondedDonors.find(
    (response) => response.response === 'Accepted'
  )

  if (!acceptedDonorResponse?.donor) return

  const donor = await Donor.findById(acceptedDonorResponse.donor)
  if (!donor) return

  const alreadyRecorded = donor.donationHistory.some(
    (entry) => entry.bloodRequest && entry.bloodRequest.toString() === bloodRequest._id.toString()
  )

  if (alreadyRecorded) return

  donor.donationHistory.push({
    date: new Date(),
    hospital: bloodRequest.hospital,
    bloodGroup: bloodRequest.bloodGroup,
    notes: `Auto-recorded from fulfilled request: ${bloodRequest.patientName}`,
    bloodRequest: bloodRequest._id
  })

  donor.lastDonationDate = new Date()
  donor.totalDonations += 1
  donor.isAvailable = false

  await donor.save()
}

// CREATE a blood request + send alerts to matching donors
const createBloodRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospital,
      upazila,
      urgencyLevel,
      contactNumber,
      additionalNotes
    } = req.body

    const normalizedBloodGroup = typeof bloodGroup === 'string' ? bloodGroup.trim().toUpperCase() : bloodGroup
    const normalizedUpazila = (typeof upazila === 'string' && upazila.trim().toLowerCase() !== 'all') ? upazila.trim() : ''

    // Create the blood request
    const bloodRequest = await BloodRequest.create({
      requester: req.user.id,
      patientName: typeof patientName === 'string' ? patientName.trim() : patientName,
      bloodGroup: normalizedBloodGroup,
      unitsNeeded,
      hospital: typeof hospital === 'string' ? hospital.trim() : hospital,
      upazila: normalizedUpazila,
      urgencyLevel,
      contactNumber: typeof contactNumber === 'string' ? contactNumber.trim() : contactNumber,
      additionalNotes: typeof additionalNotes === 'string' ? additionalNotes.trim() : additionalNotes
    })

    // Find matching donors whose donation cycle is fulfilled (90-day cooldown)
    const donationCycleDays = 90
    const cycleDate = new Date(Date.now() - donationCycleDays * 24 * 60 * 60 * 1000)

    // Auto-restore donors whose 90-day cooldown has passed
    await Donor.updateMany(
      { isAvailable: false, lastDonationDate: { $ne: null, $lte: cycleDate } },
      { isAvailable: true }
    )

    const donorFilter = {
      bloodGroup: normalizedBloodGroup,
      isAvailable: true,
      $or: [
        { lastDonationDate: null },
        { lastDonationDate: { $lte: cycleDate } }
      ]
    }

    if (normalizedUpazila) {
      donorFilter.upazila = {
        $regex: `^${escapeRegex(normalizedUpazila)}$`,
        $options: 'i'
      }
    }

    const matchingDonors = await Donor.find(donorFilter).populate('user')

    // Send notification to each matching donor
    const notifications = matchingDonors
      .filter((donor) => donor?.user?._id)
      .map((donor) => ({
        recipient: donor.user._id,
        type: 'blood_request',
        title: urgencyLevel === 'Emergency'
          ? '🚨 EMERGENCY Blood Request!'
          : '🩸 Blood Request in Your Area',
        message: `${patientName} needs ${unitsNeeded} unit(s) of ${normalizedBloodGroup} blood at ${hospital}, ${normalizedUpazila}. Contact: ${contactNumber}`,
        bloodRequest: bloodRequest._id
      }))

    if (notifications.length > 0) {
      await Notification.insertMany(notifications)
    }

    res.status(201).json({
      message: 'Blood request created successfully!',
      bloodRequest,
      matchingDonorsFound: matchingDonors.length,
      alertsSent: notifications.length
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET all blood requests (public request board)
const getAllRequests = async (req, res) => {
  try {
    const { bloodGroup, upazila, urgencyLevel, status } = req.query

    const filter = {}
    if (bloodGroup) filter.bloodGroup = bloodGroup
    if (upazila) filter.upazila = upazila
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel
    if (status) filter.status = status

    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({
      count: requests.length,
      requests
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET single blood request
const getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name email phone')
      .populate('respondedDonors.donor')

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' })
    }

    res.status(200).json(request)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET my blood requests (requester sees their own requests)
const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user.id })
      .sort({ createdAt: -1 })

    res.status(200).json({
      count: requests.length,
      requests
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DONOR responds to a blood request (accept or decline)
const respondToRequest = async (req, res) => {
  try {
    const { response } = req.body

    if (!['Accepted', 'Declined'].includes(response)) {
      return res.status(400).json({ message: 'Response must be Accepted or Declined' })
    }

    const bloodRequest = await BloodRequest.findById(req.params.id)

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' })
    }

    // Find donor profile
    const donor = await Donor.findOne({ user: req.user.id })

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' })
    }

    // ISSUE 3 FIX: Validate that donor's blood group EXACTLY matches the request's blood group
    if (donor.bloodGroup !== bloodRequest.bloodGroup) {
      return res.status(400).json({ message: 'Your blood group does not match this request' })
    }

    // 90-day donation cooldown check
    if (donor.lastDonationDate) {
      const diffDays = Math.floor(
        (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays < 90) {
        return res.status(400).json({
          message: 'You cannot respond — 90 days have not passed since your last donation'
        })
      }
    }

    // Check if donor already responded
    const alreadyResponded = bloodRequest.respondedDonors.find(
      r => r.donor.toString() === donor._id.toString()
    )

    if (alreadyResponded) {
      return res.status(400).json({ message: 'You have already responded to this request' })
    }

    // Add donor response
    bloodRequest.respondedDonors.push({
      donor: donor._id,
      response,
      respondedAt: new Date()
    })

    // If accepted update request status
    if (response === 'Accepted') {
      bloodRequest.status = 'Accepted'
    }

    await bloodRequest.save()

    // Notify the requester
    await Notification.create({
      recipient: bloodRequest.requester,
      type: 'request_accepted',
      title: response === 'Accepted'
        ? '✅ A donor accepted your request!'
        : '❌ A donor declined your request',
      message: response === 'Accepted'
        ? `A matching donor has accepted your blood request for ${bloodRequest.patientName}. They will contact you soon.`
        : `A donor has declined your request. We are looking for other donors.`,
      bloodRequest: bloodRequest._id
    })

    res.status(200).json({
      message: `You have ${response} this blood request`,
      bloodRequest
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE request status (requester can mark as Fulfilled or Cancelled)
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body

    const bloodRequest = await BloodRequest.findById(req.params.id)

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' })
    }

    // Only the requester can update status
    if (bloodRequest.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const previousStatus = bloodRequest.status
    bloodRequest.status = status
    await bloodRequest.save()

    if (status === 'Fulfilled' && previousStatus !== 'Fulfilled') {
      await recordDonationForAcceptedDonor(bloodRequest)
    }

    res.status(200).json({
      message: `Request marked as ${status}`,
      bloodRequest
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET notifications for logged in user
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)

    // Count unread
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    })

    res.status(200).json({
      unreadCount,
      notifications
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// MARK notifications as read
const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    )

    res.status(200).json({ message: 'All notifications marked as read' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  createBloodRequest,
  getAllRequests,
  getRequestById,
  getMyRequests,
  respondToRequest,
  updateRequestStatus,
  getMyNotifications,
  markNotificationsRead,
  recordDonationForAcceptedDonor
}