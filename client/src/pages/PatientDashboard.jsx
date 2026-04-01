import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../utils/api'
import DashboardLayout from '../components/DashboardLayout'
import {
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaHospital,
  FaMapMarkerAlt,
  FaPlus,
  FaBell,
  FaTint
} from 'react-icons/fa'

const PatientDashboard = () => {
  const [myRequests, setMyRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [requestsRes, notificationsRes] = await Promise.all([
        API.get('/requests/my/requests'),
        API.get('/requests/notifications/my')
      ])

      setMyRequests(requestsRes.data.requests || [])
      setNotifications(notificationsRes.data.notifications?.slice(0, 5) || [])
    } catch (err) {
      toast.error('Failed to load patient dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (requestId, status) => {
    try {
      await API.put(`/requests/${requestId}/status`, { status })
      toast.success(`Request marked as ${status}`)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update request status')
    }
  }

  const pending = myRequests.filter((r) => r.status === 'Pending').length
  const accepted = myRequests.filter((r) => r.status === 'Accepted').length
  const fulfilled = myRequests.filter((r) => r.status === 'Fulfilled').length
  const emergency = myRequests.filter((r) => r.urgencyLevel === 'Emergency').length

  const badgeStyle = (status) => {
    if (status === 'Fulfilled') return { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' }
    if (status === 'Accepted') return { bg: '#E0F2FE', color: '#075985', border: '#7DD3FC' }
    if (status === 'Cancelled') return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' }
    return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' }
  }

  if (loading) {
    return (
      <DashboardLayout title="Patient Dashboard" subtitle="Track your blood requests">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ textAlign: 'center' }}>
            <FaTint size={32} color="#DC2626" style={{ marginBottom: '12px' }} />
            <div style={{ color: '#4B5563', fontSize: '14px' }}>Loading your patient dashboard...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Patient Dashboard" subtitle="রক্তের অনুরোধ ব্যবস্থাপনা">
      <div style={{
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        border: '1px solid #FECACA',
        borderRadius: '14px',
        padding: '22px 26px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#4B5563' }}>Patient Portal</div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#7F1D1D' }}>Track and manage your blood requests</h2>
        </div>
        <Link
          to="/requests"
          style={{
            background: '#fff',
            color: '#DC2626',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '800',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaPlus size={12} /> New Request
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { icon: <FaClipboardList size={17} />, num: myRequests.length, label: 'Total Requests', color: '#7F1D1D', bg: '#FEF2F2' },
          { icon: <FaClock size={17} />, num: pending, label: 'Pending', color: '#92400E', bg: '#FEF3C7' },
          { icon: <FaCheckCircle size={17} />, num: fulfilled, label: 'Fulfilled', color: '#166534', bg: '#DCFCE7' },
          { icon: <FaExclamationTriangle size={17} />, num: emergency, label: 'Emergency', color: '#B91C1C', bg: '#FEF2F2' }
        ].map((item) => (
          <div key={item.label} style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: '21px', fontWeight: '900', color: '#7F1D1D' }}>{item.num}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
        <div style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #FEF2F2' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D' }}>My Blood Requests</div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FFF7F8' }}>
                  {['Patient', 'Blood', 'Hospital', 'Urgency', 'Status', 'Action'].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', color: '#7F1D1D', borderBottom: '1px solid #FEF2F2' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myRequests.length > 0 ? myRequests.map((request) => {
                  const st = badgeStyle(request.status)
                  const canUpdate = request.status === 'Pending' || request.status === 'Accepted'
                  return (
                    <tr key={request._id} style={{ borderBottom: '1px solid #FEF2F2' }}>
                      <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>{request.patientName}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: '#DC2626', color: '#fff', fontSize: '11px', fontWeight: '800', borderRadius: '99px', padding: '2px 8px' }}>{request.bloodGroup}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#4B5563' }}>
                        <FaHospital size={10} color="#DC2626" style={{ marginRight: '4px' }} />
                        {request.hospital}
                        <div style={{ fontSize: '10px' }}>
                          <FaMapMarkerAlt size={9} color="#DC2626" style={{ marginRight: '3px' }} />
                          {request.upazila}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '700', color: '#4B5563' }}>{request.urgencyLevel}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: '11px', fontWeight: '700', borderRadius: '99px', padding: '2px 8px' }}>
                          {request.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {canUpdate ? (
                          <select
                            defaultValue={request.status}
                            onChange={(e) => updateStatus(request._id, e.target.value)}
                            style={{ padding: '6px 8px', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '11px' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Fulfilled">Fulfilled</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#6B7280' }}>Locked</span>
                        )}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
                      No requests created yet. Create one from the Request Board.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #FEF2F2', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBell size={13} color="#DC2626" />
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D' }}>Recent Notifications</div>
          </div>

          <div style={{ padding: '12px' }}>
            {notifications.length > 0 ? notifications.map((n) => (
              <div key={n._id} style={{ border: '1px solid #FECACA', background: n.isRead ? '#fff' : '#FFF7F8', borderRadius: '10px', padding: '10px', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1F2937', marginBottom: '3px' }}>{n.title}</div>
                <div style={{ fontSize: '11px', color: '#4B5563', lineHeight: '1.4' }}>{n.message}</div>
              </div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>No notifications yet</div>
            )}
          </div>
        </div>
      </div>

      {accepted > 0 && (
        <div style={{ marginTop: '16px', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '10px', padding: '12px 14px', color: '#166534', fontSize: '13px', fontWeight: '700' }}>
          Good news: {accepted} request(s) already accepted by donors.
        </div>
      )}
    </DashboardLayout>
  )
}

export default PatientDashboard
