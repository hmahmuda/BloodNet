import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import API from '../utils/api'
import DashboardLayout from '../components/DashboardLayout'
import {
  FaBell, FaTint, FaCheckCircle, FaTimesCircle,
  FaHospital, FaMapMarkerAlt, FaClock, FaCheck
} from 'react-icons/fa'

const NotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [marking, setMarking]             = useState(false)
  const [filter, setFilter]               = useState('all')

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/requests/notifications/my')
      setNotifications(data.notifications || [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    setMarking(true)
    try {
      await API.put('/requests/notifications/read')
      toast.success('All notifications marked as read')
      fetchNotifications()
    } catch (err) {
      toast.error('Failed to mark as read')
    } finally {
      setMarking(false)
    }
  }

  const handleRespond = async (requestId, response) => {
    try {
      await API.put(`/requests/${requestId}/respond`, { response })
      toast.success(`You have ${response} this blood request`)
      fetchNotifications()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond')
    }
  }

  const getTimeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000)
    if (mins < 1)   return 'Just now'
    if (mins < 60)  return `${mins} minute${mins > 1 ? 's' : ''} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const getNotifIcon = (type) => {
    if (type === 'blood_request') {
      return { icon: <FaTint size={18} color="#DC2626"/>, bg: '#FEF2F2', border: '#FECACA' }
    }
    if (type === 'request_accepted' || type === 'request_fulfilled') {
      return { icon: <FaCheckCircle size={18} color="#166534"/>, bg: '#DCFCE7', border: '#86EFAC' }
    }
    return { icon: <FaBell size={18} color="#DC2626"/>, bg: '#FEF2F2', border: '#FECACA' }
  }

  const unreadCount  = notifications.filter(n => !n.isRead).length
  const filtered     = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : filter === 'read'
      ? notifications.filter(n => n.isRead)
      : notifications

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="বিজ্ঞপ্তি — Stay updated with blood requests and alerts"
    >

      {/* ── HEADER CARD ── */}
      <div style={{
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        border: '1px solid #FECACA',
        borderRadius: '14px', padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '20px',
        flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#4B5563', marginBottom: '4px', fontStyle: 'italic' }}>
            বিজ্ঞপ্তি কেন্দ্র
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#7F1D1D', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBell size={18}/> Notification Center
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#FFFFFF',
              color: '#7F1D1D', padding: '3px 12px',
              border: '1px solid #FECACA',
              borderRadius: '99px', fontSize: '12px', fontWeight: '700'
            }}>
              {notifications.length} total
            </span>
            {unreadCount > 0 && (
              <span style={{
                background: '#FECACA', color: '#7F1D1D',
                padding: '3px 12px', borderRadius: '99px',
                fontSize: '12px', fontWeight: '800'
              }}>
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={marking} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#FFFFFF',
            color: '#DC2626',
            border: '1.5px solid #FECACA',
            padding: '10px 20px', borderRadius: '10px',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer'
          }}>
            <FaCheck size={12}/>
            {marking ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* ── STATS ROW ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px', marginBottom: '20px'
      }}>
        {[
          { num: notifications.length, label: 'Total notifications', sub: 'মোট বিজ্ঞপ্তি', bg: '#FEF2F2', color: '#7F1D1D' },
          { num: unreadCount, label: 'Unread', sub: 'অপঠিত', bg: '#FEF2F2', color: '#DC2626' },
          { num: notifications.length - unreadCount, label: 'Read', sub: 'পঠিত', bg: '#DCFCE7', color: '#166534' }
        ].map((s, i) => (
          <div key={i} style={{
            background: '#FFFFFF', border: '1px solid #FECACA',
            borderRadius: '12px', padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '14px'
          }}>
            <div style={{
              width: '44px', height: '44px', background: s.bg,
              borderRadius: '12px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <FaBell size={18} color={s.color}/>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: s.color }}>{s.num}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#1F2937' }}>{s.label}</div>
              <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#4B5563' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER TABS ── */}
      <div style={{
        display: 'flex', gap: '8px',
        marginBottom: '20px',
        background: '#FFFFFF',
        border: '1px solid #FECACA',
        borderRadius: '10px', padding: '6px'
      }}>
        {[
          { value: 'all',    label: 'All',    count: notifications.length },
          { value: 'unread', label: 'Unread', count: unreadCount },
          { value: 'read',   label: 'Read',   count: notifications.length - unreadCount }
        ].map((tab) => (
          <button key={tab.value} onClick={() => setFilter(tab.value)} style={{
            flex: 1, padding: '9px 16px', borderRadius: '8px',
            border: 'none', cursor: 'pointer',
            background: filter === tab.value ? '#DC2626' : 'transparent',
            color: filter === tab.value ? '#FFFFFF' : '#4B5563',
            fontSize: '13px', fontWeight: '700',
            transition: 'all .2s',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px'
          }}>
            {tab.label}
            <span style={{
              background: filter === tab.value ? 'rgba(255,255,255,0.25)' : '#FEF2F2',
              color: filter === tab.value ? '#FFFFFF' : '#DC2626',
              padding: '1px 7px', borderRadius: '99px',
              fontSize: '11px', fontWeight: '800'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── NOTIFICATIONS LIST ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <FaBell size={32} color="#FECACA" style={{ marginBottom: '12px' }}/>
          <div style={{ color: '#4B5563', fontSize: '14px' }}>
            Loading notifications...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#FFFFFF', border: '1px solid #FECACA',
          borderRadius: '14px', padding: '60px 40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '72px', height: '72px', background: '#FEF2F2',
            borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <FaBell size={28} color="#FECACA"/>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#7F1D1D', marginBottom: '8px' }}>
            No notifications
          </h3>
          <p style={{ fontSize: '13px', color: '#4B5563', fontStyle: 'italic' }}>
            কোনো বিজ্ঞপ্তি নেই — You're all caught up!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((notif) => {
            const style = getNotifIcon(notif.type)
            const isBloodRequest = notif.type === 'blood_request'

            return (
              <div key={notif._id} style={{
                background: notif.isRead ? '#FFFFFF' : '#FFF7F8',
                border: `1px solid ${notif.isRead ? '#FECACA' : '#DC2626'}`,
                borderLeft: `4px solid ${notif.isRead ? '#FECACA' : '#DC2626'}`,
                borderRadius: '12px', padding: '18px 20px',
                transition: 'all .2s'
              }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>

                  {/* Icon */}
                  <div style={{
                    width: '44px', height: '44px',
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                  }}>
                    {style.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>

                    {/* Title row */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: '6px',
                      flexWrap: 'wrap', gap: '6px'
                    }}>
                      <div style={{
                        fontSize: '14px', fontWeight: '800',
                        color: '#1F2937', flex: 1
                      }}>
                        {notif.title}
                        {!notif.isRead && (
                          <span style={{
                            display: 'inline-block',
                            width: '8px', height: '8px',
                            background: '#DC2626', borderRadius: '50%',
                            marginLeft: '8px', verticalAlign: 'middle'
                          }}/>
                        )}
                      </div>
                      <div style={{
                        fontSize: '11px', color: '#4B5563',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        flexShrink: 0
                      }}>
                        <FaClock size={9} color="#DC2626"/>
                        {getTimeAgo(notif.createdAt)}
                      </div>
                    </div>

                    {/* Message */}
                    <p style={{
                      fontSize: '13px', color: '#4B5563',
                      lineHeight: '1.5', marginBottom: '12px'
                    }}>
                      {notif.message}
                    </p>

                    {/* Tags row */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: isBloodRequest && notif.bloodRequest ? '12px' : '0' }}>
                      <span style={{
                        background: '#FEF2F2', color: '#7F1D1D',
                        border: '1px solid #FECACA',
                        padding: '2px 10px', borderRadius: '99px',
                        fontSize: '11px', fontWeight: '700',
                        textTransform: 'capitalize'
                      }}>
                        {notif.type.replace('_', ' ')}
                      </span>
                      {notif.isRead ? (
                        <span style={{
                          background: '#DCFCE7', color: '#166534',
                          border: '1px solid #86EFAC',
                          padding: '2px 10px', borderRadius: '99px',
                          fontSize: '11px', fontWeight: '600',
                          display: 'inline-flex', alignItems: 'center', gap: '5px'
                        }}>
                          <FaCheck size={10}/> Read
                        </span>
                      ) : (
                        <span style={{
                          background: '#FEF2F2', color: '#DC2626',
                          border: '1px solid #FECACA',
                          padding: '2px 10px', borderRadius: '99px',
                          fontSize: '11px', fontWeight: '700',
                          display: 'inline-flex', alignItems: 'center', gap: '5px'
                        }}>
                          <FaBell size={9}/> Unread
                        </span>
                      )}
                    </div>

                    {/* Action buttons for blood requests */}
                    {isBloodRequest && notif.bloodRequest && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button onClick={() => handleRespond(notif.bloodRequest, 'Accepted')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#DC2626', color: '#FFFFFF',
                            border: 'none', padding: '9px 18px',
                            borderRadius: '8px', fontSize: '13px',
                            fontWeight: '700', cursor: 'pointer',
                            transition: 'background .2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#7F1D1D'}
                          onMouseOut={e => e.currentTarget.style.background = '#DC2626'}
                        >
                          <FaCheckCircle size={12}/> Accept
                        </button>
                        <button onClick={() => handleRespond(notif.bloodRequest, 'Declined')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#FEF2F2', color: '#DC2626',
                            border: '1.5px solid #FECACA',
                            padding: '9px 18px', borderRadius: '8px',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                          }}
                        >
                          <FaTimesCircle size={12}/> Decline
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </DashboardLayout>
  )
}

export default NotificationsPage


