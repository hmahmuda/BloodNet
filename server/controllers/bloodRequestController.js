const BloodRequest = require('../models/BloodRequest')
const Donor = require('../models/Donor')
const Notification = require('../models/Notification')

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

    // Create the blood request
    const bloodRequest = await BloodRequest.create({
      requester: req.user.id,
      patientName,
      bloodGroup,
      unitsNeeded,
      hospital,
      upazila,
      urgencyLevel,
      contactNumber,
      additionalNotes
    })

    // Find all matching available donors in the same upazila
    const matchingDonors = await Donor.find({
      bloodGroup,
      upazila,
      isAvailable: true
    }).populate('user')

    // Send notification to each matching donor
    const notifications = matchingDonors.map(donor => ({
      recipient: donor.user._id,
      type: 'blood_request',
      title: urgencyLevel === 'Emergency'
        ? '🚨 EMERGENCY Blood Request!'
        : '🩸 Blood Request in Your Area',
      message: `${patientName} needs ${unitsNeeded} unit(s) of ${bloodGroup} blood at ${hospital}, ${upazila}. Contact: ${contactNumber}`,
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

    bloodRequest.status = status
    await bloodRequest.save()

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
  markNotificationsRead
}