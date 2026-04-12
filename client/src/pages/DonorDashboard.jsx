import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import API from '../utils/api'
import DashboardLayout from '../components/DashboardLayout'
import {
  FaTint, FaHeartbeat, FaCalendarAlt, FaAward,
  FaToggleOn, FaToggleOff, FaPhone, FaMapMarkerAlt,
  FaCheckCircle, FaTimesCircle, FaHospital,
  FaArrowRight, FaUserFriends, FaBell,
  FaMedal, FaExclamationTriangle, FaClipboardList, FaUser,
  FaClock
} from 'react-icons/fa'

const UPAZILAS = [
  'Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Companiganj',
  'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur',
  'Kanaighat', 'Osmaninagar', 'South Surma', 'Balaganj', 'Zakiganj'
]

const DonorDashboard = () => {
  const { user, setUser } = useAuth()
  const [donorProfile, setDonorProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({
    phone: '',
    upazila: '',
    weight: '',
    medicalConditions: ''
  })
  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [nowTick, setNowTick] = useState(Date.now())

  useEffect(() => {
    fetchAll(true)

    const refreshInterval = setInterval(() => {
      fetchAll(false)
    }, 30000)

    const tickInterval = setInterval(() => {
      setNowTick(Date.now())
    }, 60000)

    const refreshOnFocus = () => fetchAll(false)
    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnFocus)

    return () => {
      clearInterval(refreshInterval)
      clearInterval(tickInterval)
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnFocus)
    }
  }, [])

  useEffect(() => {
    if (donorProfile && !editingProfile) {
      setProfileForm({
        phone: donorProfile.phone || '',
        upazila: donorProfile.upazila || '',
        weight: donorProfile.weight ?? '',
        medicalConditions: donorProfile.medicalConditions || ''
      })
    }
  }, [donorProfile, editingProfile])

  const fetchAll = async (showErrorToast = false) => {
    try {
      const [profileRes, requestsRes, notifRes] = await Promise.all([
        API.get('/donors/profile/me'),
        API.get('/requests?status=Pending'),
        API.get('/requests/notifications/my')
      ])
      setDonorProfile(profileRes.data)
      const myBloodGroup = profileRes.data?.bloodGroup
      const allRequests = requestsRes.data.requests || []
      const matchingRequests = myBloodGroup
        ? allRequests.filter(r => r.bloodGroup === myBloodGroup)
        : allRequests
      setRequests(matchingRequests.slice(0, 4))
      setNotifications(notifRes.data.notifications?.slice(0, 3) || [])
    } catch (err) {
      console.log(err)
      if (showErrorToast) {
        toast.error(err.response?.data?.message || 'Could not load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    setToggling(true)
    try {
      const { data } = await API.put('/donors/toggle-availability')
      setDonorProfile({ ...donorProfile, isAvailable: data.isAvailable })
      toast.success(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally {
      setToggling(false)
    }
  }

  const handleRespond = async (requestId, response) => {
    try {
      await API.put(`/requests/${requestId}/respond`, { response })
      toast.success(`You have ${response} this request`)
      fetchAll(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond')
    }
  }

  const handleProfileInput = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileCancel = () => {
    setEditingProfile(false)
    setProfileForm({
      phone: donorProfile?.phone || '',
      upazila: donorProfile?.upazila || '',
      weight: donorProfile?.weight ?? '',
      medicalConditions: donorProfile?.medicalConditions || ''
    })
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    if (!profileForm.phone.trim() || !profileForm.upazila.trim()) {
      toast.error('Phone and location are required')
      return
    }

    setSavingProfile(true)
    try {
      const payload = {
        phone: profileForm.phone.trim(),
        upazila: profileForm.upazila.trim(),
        medicalConditions: profileForm.medicalConditions.trim() || 'None'
      }

      if (profileForm.weight !== '') {
        payload.weight = Number(profileForm.weight)
      }

      const { data } = await API.put('/donors/profile/update', payload)
      setDonorProfile(data.donor)
      setUser((prev) => prev ? {
        ...prev,
        upazila: data.donor.upazila,
        phone: data.donor.phone
      } : prev)
      setEditingProfile(false)
      toast.success(data.message || 'Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const getDonorLevel = (donations) => {
    if (donations >= 20) return { label: 'Platinum', color: '#6b7280', icon: <FaMedal size={11}/> }
    if (donations >= 10) return { label: 'Gold', color: '#92400e', icon: <FaMedal size={11}/> }
    if (donations >= 5)  return { label: 'Silver', color: '#374151', icon: <FaMedal size={11}/> }
    return { label: 'Bronze', color: '#7f1d1d', icon: <FaMedal size={11}/> }
  }

  const formatNotificationDateTime = (date) => {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return 'Invalid date'

    return parsed.toLocaleString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const activeBloodGroup = donorProfile?.bloodGroup || user?.bloodGroup

  const emergencyRequests = requests.filter(r =>
    r.urgencyLevel === 'Emergency' &&
    r.bloodGroup === activeBloodGroup
  )

  const daysSinceLastDonation = donorProfile?.lastDonationDate
    ? Math.floor((nowTick - new Date(donorProfile.lastDonationDate)) / (1000 * 60 * 60 * 24))
    : null

  const isEligible = daysSinceLastDonation === null || daysSinceLastDonation >= 90
  const daysUntilEligible = !isEligible ? 90 - daysSinceLastDonation : 0

  if (loading) return (
    <DashboardLayout title="Donor Dashboard" subtitle="Track your donation journey">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <FaTint size={32} color="#dc2626" style={{ marginBottom: '12px' }}/>
          <div style={{ color: '#4B5563', fontSize: '14px' }}>Loading your dashboard...</div>
        </div>
      </div>
    </DashboardLayout>
  )

  const level = getDonorLevel(donorProfile?.totalDonations || 0)

  return (
    <DashboardLayout
      title="Donor Dashboard"
      subtitle="রক্ত দিন, জীবন বাঁচান — Track your donation journey"
    >

      {/* ── EMERGENCY BANNER ── */}
      {emergencyRequests.length > 0 && (
        <div style={{
          background: '#FEE2E2',
          borderRadius: '12px', padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '24px',
          border: '1px solid #FECACA'
        }}>
          <div style={{
            width: '36px', height: '36px', background: '#dc2626',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, animation: 'pulse 2s infinite'
          }}>
            <FaTint color="#fff" size={16}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#7F1D1D', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaExclamationTriangle size={12}/>
              Emergency! {emergencyRequests.length} urgent request(s) matching your blood group {activeBloodGroup}
            </div>
            <div style={{ fontSize: '12px', color: '#4B5563' }}>
              {emergencyRequests[0]?.hospital} · {emergencyRequests[0]?.upazila}
            </div>
          </div>
          <Link to="/requests" style={{
            background: '#dc2626', color: '#fff',
            padding: '8px 16px', borderRadius: '8px',
            fontSize: '13px', fontWeight: '700', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0
          }}>
            Respond Now <FaArrowRight size={11}/>
          </Link>
        </div>
      )}

      {/* ── WELCOME CARD ── */}
      <div style={{
        background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
        borderRadius: '14px', padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '20px',
        flexWrap: 'wrap', gap: '16px',
        border: '1px solid #FECACA'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#4B5563', marginBottom: '4px' }}>
            স্বাগতম, Welcome back
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#7F1D1D', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user?.name} <FaUserFriends size={18}/>
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              background: '#dc2626',
              color: '#fff', padding: '3px 12px',
              borderRadius: '99px', fontSize: '13px', fontWeight: '800'
            }}>
              {activeBloodGroup}
            </span>
            <span style={{ fontSize: '12px', color: '#4B5563' }}>
              <FaMapMarkerAlt size={10}/> {donorProfile?.upazila || user?.upazila}
            </span>
            <span style={{ fontSize: '12px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ color: level.color, display: 'inline-flex', alignItems: 'center' }}>{level.icon}</span> {level.label} Donor
            </span>
          </div>
        </div>

        {/* Availability toggle */}
        <div style={{
          background: '#fff',
          border: '1px solid #FECACA',
          borderRadius: '12px', padding: '16px 20px',
          textAlign: 'center', minWidth: '180px'
        }}>
          <div style={{ fontSize: '11px', color: '#4B5563', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Availability Status
          </div>
          <button onClick={handleToggle} disabled={toggling} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '0', margin: '0 auto'
          }}>
            {donorProfile?.isAvailable
              ? <FaToggleOn size={40} color="#16a34a"/>
              : <FaToggleOff size={40} color="#d1d5db"/>
            }
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#1F2937' }}>
                {donorProfile?.isAvailable ? 'Available' : 'Unavailable'}
              </div>
              <div style={{ fontSize: '10px', color: '#4B5563' }}>
                {donorProfile?.isAvailable ? 'Showing in search' : 'Hidden from search'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px', marginBottom: '24px'
      }}>
        {[
          {
            icon: <FaTint size={18}/>,
            num: donorProfile?.totalDonations || 0,
            label: 'Total donations',
            sub: 'রক্তদান',
            color: '#dc2626', bg: '#fef2f2'
          },
          {
            icon: <FaHeartbeat size={18}/>,
            num: (donorProfile?.totalDonations || 0) * 3,
            label: 'Lives saved',
            sub: 'জীবন বাঁচানো',
            color: '#166534', bg: '#dcfce7'
          },
          {
            icon: <FaCalendarAlt size={18}/>,
            num: donorProfile?.lastDonationDate
              ? `${daysSinceLastDonation}d`
              : 'N/A',
            label: donorProfile?.lastDonationDate
              ? new Date(donorProfile.lastDonationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'No donation yet',
            sub: 'শেষ দানের তারিখ',
            color: '#92400e', bg: '#fef3c7'
          },
          {
            icon: <FaAward size={18}/>,
            num: level.label,
            label: `${level.label} level`,
            sub: 'ডোনার লেভেল',
            color: '#7f1d1d', bg: '#fef2f2'
          }
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid #fecaca',
            borderRadius: '12px', padding: '18px',
            display: 'flex', alignItems: 'center', gap: '14px'
          }}>
            <div style={{
              width: '44px', height: '44px', background: s.bg,
              borderRadius: '12px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: s.color, flexShrink: 0
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#7F1D1D' }}>{s.num}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1F2937' }}>{s.label}</div>
            <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#4B5563' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Pending blood requests */}
        <div style={{
          background: '#fff', border: '1px solid #fecaca',
          borderRadius: '14px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #fef2f2',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D' }}>
                <FaTint size={13} style={{ marginRight: '6px' }}/> Blood Requests
              </div>
              <div style={{ fontSize: '11px', color: '#4B5563', fontStyle: 'italic' }}>
                রক্তের অনুরোধ
              </div>
            </div>
            <Link to="/requests" style={{
              fontSize: '12px', color: '#dc2626',
              fontWeight: '700', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              View all <FaArrowRight size={10}/>
            </Link>
          </div>

          <div style={{ padding: '12px' }}>
            {!isEligible && requests.length > 0 && (
              <div style={{
                background: '#FEF3C7', border: '1px solid #FDE68A',
                borderRadius: '10px', padding: '10px 14px',
                marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <FaClock size={14} color="#92400e"/>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e' }}>
                    Not eligible yet — {daysUntilEligible} day{daysUntilEligible !== 1 ? 's' : ''} remaining
                  </div>
                  <div style={{ fontSize: '11px', color: '#78350f' }}>
                    You must wait 90 days between donations. You can view requests but cannot accept yet.
                  </div>
                </div>
              </div>
            )}
            {requests.length > 0 ? requests.map((req) => (
              <div key={req._id} style={{
                padding: '12px', borderRadius: '10px',
                border: `1px solid ${req.urgencyLevel === 'Emergency' ? '#fecaca' : '#f0f0f0'}`,
                background: req.urgencyLevel === 'Emergency' ? '#fff8f8' : '#fff',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '2px' }}>
                      {req.patientName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaHospital size={9} color="#dc2626"/> {req.hospital}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      background: '#dc2626', color: '#fff',
                      padding: '2px 8px', borderRadius: '99px',
                      fontSize: '12px', fontWeight: '900'
                    }}>{req.bloodGroup}</span>
                    <span style={{
                      background: req.urgencyLevel === 'Emergency' ? '#7f1d1d' : req.urgencyLevel === 'Urgent' ? '#fef3c7' : '#f0fdf4',
                      color: req.urgencyLevel === 'Emergency' ? '#fef2f2' : req.urgencyLevel === 'Urgent' ? '#92400e' : '#166534',
                      padding: '2px 8px', borderRadius: '99px',
                      fontSize: '10px', fontWeight: '700'
                    }}>{req.urgencyLevel}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {isEligible ? (
                    <>
                      <button onClick={() => handleRespond(req._id, 'Accepted')} style={{
                        flex: 1, background: '#dc2626', color: '#fff',
                        border: 'none', padding: '7px', borderRadius: '6px',
                        fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                      }}>
                        <FaCheckCircle size={11}/> Accept
                      </button>
                      <button onClick={() => handleRespond(req._id, 'Declined')} style={{
                        flex: 1, background: '#fff8f8', color: '#9ca3af',
                        border: '1px solid #fecaca', padding: '7px', borderRadius: '6px',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                      }}>
                        <FaTimesCircle size={11}/> Decline
                      </button>
                    </>
                  ) : (
                    <button disabled style={{
                      flex: 1, background: '#f3f4f6', color: '#9ca3af',
                      border: '1px solid #e5e7eb', padding: '7px', borderRadius: '6px',
                      fontSize: '12px', fontWeight: '600', cursor: 'not-allowed',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px'
                    }}>
                      <span style={{ color: '#111827', fontSize: '11px', fontWeight: '700' }}>
                        আপনার হাতে আবার জেগে উঠুক একটি নতুন জীবন
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaClock size={11}/> Eligible in {daysUntilEligible} day{daysUntilEligible !== 1 ? 's' : ''}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                No pending requests right now
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div style={{
          background: '#fff', border: '1px solid #fecaca',
          borderRadius: '14px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #fef2f2',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D' }}>
                <FaBell size={13} style={{ marginRight: '6px' }}/> Notifications
              </div>
              <div style={{ fontSize: '11px', color: '#4B5563', fontStyle: 'italic' }}>
                বিজ্ঞপ্তি
              </div>
            </div>
            <Link to="/notifications" style={{
              fontSize: '12px', color: '#dc2626',
              fontWeight: '700', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              View all <FaArrowRight size={10}/>
            </Link>
          </div>

          <div style={{ padding: '12px' }}>
            {notifications.length > 0 ? notifications.map((n) => (
              <div key={n._id} style={{
                padding: '12px', borderRadius: '10px',
                background: n.isRead ? '#fff' : '#fff8f8',
                border: `1px solid ${n.isRead ? '#f0f0f0' : '#fecaca'}`,
                marginBottom: '8px',
                display: 'flex', gap: '10px', alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: n.isRead ? '#e5e7eb' : '#dc2626',
                  marginTop: '5px', flexShrink: 0
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '2px' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#4B5563', lineHeight: '1.4' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '4px' }}>
                    {formatNotificationDateTime(n.createdAt)}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                No notifications yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DONOR PROFILE CARD ── */}
      {donorProfile && (
        <div style={{
          background: '#fff', border: '1px solid #fecaca',
          borderRadius: '14px', padding: '24px', marginBottom: '20px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D', marginBottom: '4px' }}>
            <FaUser size={13} style={{ marginRight: '6px' }}/> Donor Profile
          </div>
          <div style={{ fontSize: '11px', color: '#4B5563', fontStyle: 'italic', marginBottom: '20px' }}>
            আপনার প্রোফাইল
          </div>

          {!editingProfile ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                  { label: 'Blood group', value: donorProfile.bloodGroup, icon: <FaTint size={14}/>, color: '#dc2626' },
                  { label: 'Phone', value: donorProfile.phone, icon: <FaPhone size={14}/>, color: '#7f1d1d' },
                  { label: 'Location', value: donorProfile.upazila, icon: <FaMapMarkerAlt size={14}/>, color: '#dc2626' },
                  { label: 'Gender', value: donorProfile.gender || 'N/A', icon: <FaUserFriends size={14}/>, color: '#7f1d1d' },
                  { label: 'Weight (kg)', value: donorProfile.weight ?? 'N/A', icon: <FaHeartbeat size={14}/>, color: '#dc2626' },
                  { label: 'Medical', value: donorProfile.medicalConditions || 'None', icon: <FaClipboardList size={14}/>, color: '#7f1d1d' }
                ].map((item) => (
                  <div key={item.label} style={{
                    background: '#fff8f8', border: '1px solid #fecaca',
                    borderRadius: '10px', padding: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: item.color }}>
                      {item.icon}
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af' }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditingProfile(true)}
                  style={{
                    background: '#dc2626', color: '#fff',
                    border: 'none', borderRadius: '8px',
                    padding: '10px 16px', fontSize: '13px',
                    fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  Edit Profile
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px' }}>
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileInput}
                    placeholder="e.g. 01XXXXXXXXX"
                    style={{
                      width: '100%', border: '1px solid #fecaca', borderRadius: '8px',
                      padding: '10px 12px', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px' }}>
                    Upazila / Location
                  </label>
                  <select
                    name="upazila"
                    value={profileForm.upazila}
                    onChange={handleProfileInput}
                    style={{
                      width: '100%', border: '1px solid #fecaca', borderRadius: '8px',
                      padding: '10px 12px', fontSize: '13px', outline: 'none'
                    }}
                  >
                    <option value="">Select your upazila</option>
                    {UPAZILAS.map((upazila) => (
                      <option key={upazila} value={upazila}>{upazila}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px' }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="weight"
                    value={profileForm.weight}
                    onChange={handleProfileInput}
                    placeholder="e.g. 60"
                    style={{
                      width: '100%', border: '1px solid #fecaca', borderRadius: '8px',
                      padding: '10px 12px', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px' }}>
                    Medical Conditions
                  </label>
                  <input
                    name="medicalConditions"
                    value={profileForm.medicalConditions}
                    onChange={handleProfileInput}
                    placeholder="None"
                    style={{
                      width: '100%', border: '1px solid #fecaca', borderRadius: '8px',
                      padding: '10px 12px', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleProfileCancel}
                  disabled={savingProfile}
                  style={{
                    background: '#fff8f8', color: '#7f1d1d', border: '1px solid #fecaca',
                    borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
                    fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{
                    background: '#dc2626', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
                    fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── DONATION HISTORY ── */}
      <div style={{
        background: '#fff', border: '1px solid #fecaca',
        borderRadius: '14px', overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #fef2f2',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D' }}>
              <FaClipboardList size={13} style={{ marginRight: '6px' }}/> Donation History
            </div>
            <div style={{ fontSize: '11px', color: '#4B5563', fontStyle: 'italic' }}>
              রক্তদানের ইতিহাস
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {donorProfile?.donationHistory?.length > 0 ? (
            <div>
              {donorProfile.donationHistory.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 0',
                  borderBottom: i < donorProfile.donationHistory.length - 1 ? '1px solid #fef2f2' : 'none'
                }}>
                  <div style={{
                    width: '38px', height: '38px', background: '#fef2f2',
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                  }}>
                    <FaTint color="#dc2626" size={16}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>
                      {d.hospital || 'Hospital not specified'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>
                        <FaCalendarAlt size={10}/>
                        {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span style={{ background: '#dc2626', color: '#fff', padding: '1px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '900' }}>
                        {d.bloodGroup}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    background: '#dcfce7', color: '#166534',
                    border: '1px solid #86efac',
                    padding: '3px 10px', borderRadius: '99px',
                    fontSize: '11px', fontWeight: '700'
                  }}>
                    Completed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: '#4B5563' }}>
              <FaTint size={28} color="#fecaca" style={{ marginBottom: '10px' }}/>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#7F1D1D', marginBottom: '4px' }}>
                No donations yet
              </div>
              <div style={{ fontSize: '13px', color: '#4B5563', marginBottom: '16px' }}>
                Start your donation journey today!
              </div>
              <Link to="/requests" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#dc2626', color: '#fff',
                padding: '9px 20px', borderRadius: '8px',
                fontSize: '13px', fontWeight: '700', textDecoration: 'none'
              }}>
                <FaTint size={12}/> Find a Request
              </Link>
            </div>
          )}
        </div>
      </div>

    </DashboardLayout>
  )
}

export default DonorDashboard


