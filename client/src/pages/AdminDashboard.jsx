import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import API from '../utils/api'
import DashboardLayout from '../components/DashboardLayout'
import {
  FaTint, FaUserFriends, FaClipboardList,
  FaBoxes, FaCheckCircle, FaTimesCircle,
  FaExclamationTriangle, FaToggleOn, FaToggleOff,
  FaHospital, FaMapMarkerAlt, FaSync, FaPlus,
  FaChartBar, FaCog
} from 'react-icons/fa'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const UPAZILAS = [
  'Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Companiganj',
  'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur',
  'Kanaighat', 'Osmaninagar', 'South Surma', 'Balaganj', 'Zakiganj'
]
const HOSPITALS = [
  'MAG Osmani Medical College Hospital',
  'North East Medical College Hospital',
  'Mount Adora Hospital',
  'Sylhet Women\'s Medical College',
  'Ibn Sina Hospital Sylhet',
  'Jalalabad Ragib-Rabeya Medical'
]

const AdminDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [stats, setStats]           = useState(null)
  const [users, setUsers]           = useState([])
  const [requests, setRequests]     = useState([])
  const [inventory, setInventory]   = useState([])
  const [activeTab, setActiveTab]   = useState('overview')
  const [loading, setLoading]       = useState(true)
  const [showAddInv, setShowAddInv] = useState(false)

  const [invForm, setInvForm] = useState({
    hospital: '', upazila: '', bloodGroup: '',
    units: '', expiryDate: ''
  })

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    if (location.pathname === '/admin/users') {
      setActiveTab('users')
      return
    }
    if (location.pathname === '/admin/requests') {
      setActiveTab('requests')
      return
    }
    if (location.pathname === '/admin/inventory') {
      setActiveTab('inventory')
      return
    }
    setActiveTab('overview')
  }, [location.pathname])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'overview') {
      navigate('/admin')
      return
    }
    navigate(`/admin/${tab}`)
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, requestsRes, invRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/requests'),
        API.get('/admin/inventory')
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data.users || [])
      setRequests(requestsRes.data.requests || [])
      setInventory(invRes.data.inventory || [])
    } catch (err) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const toggleUser = async (userId) => {
    try {
      const { data } = await API.put(`/admin/users/${userId}/toggle`)
      toast.success(data.message)
      fetchAll()
    } catch (err) {
      toast.error('Failed to update user')
    }
  }

  const updateRequestStatus = async (id, status) => {
    try {
      await API.put(`/admin/requests/${id}/status`, { status })
      toast.success(`Request marked as ${status}`)
      fetchAll()
    } catch (err) {
      toast.error('Failed to update request')
    }
  }

  const handleAddInventory = async (e) => {
    e.preventDefault()
    try {
      await API.post('/admin/inventory', invForm)
      toast.success('Inventory added successfully!')
      setShowAddInv(false)
      setInvForm({ hospital: '', upazila: '', bloodGroup: '', units: '', expiryDate: '' })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add inventory')
    }
  }

  const getStatusStyle = (status) => {
    if (status === 'Fulfilled') return { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' }
    if (status === 'Accepted')  return { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' }
    if (status === 'Cancelled') return { bg: '#FEF2F2', color: '#7F1D1D', border: '#FECACA' }
    return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' }
  }

  const getStatusIcon = (status) => {
    if (status === 'Fulfilled' || status === 'Accepted' || status === 'Available' || status === 'Active') {
      return <FaCheckCircle size={11} />
    }
    if (status === 'Cancelled' || status === 'Inactive' || status === 'Critical' || status === 'Expired') {
      return <FaTimesCircle size={11} />
    }
    return <FaExclamationTriangle size={11} />
  }

  const getInvStyle = (status) => {
    if (status === 'Available') return { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' }
    if (status === 'Low')       return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' }
    if (status === 'Critical')  return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }
    return { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #FECACA', borderRadius: '8px',
    fontSize: '13px', color: '#1F2937',
    background: '#FFFFFF', outline: 'none'
  }

  const focusIn  = e => { e.target.style.borderColor = '#DC2626'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)' }
  const focusOut = e => { e.target.style.borderColor = '#FECACA'; e.target.style.boxShadow = 'none' }

  const tabs = [
    { value: 'overview',  label: 'Overview',  icon: <FaChartBar size={12}/>, count: null },
    { value: 'users',     label: 'Donors',    icon: <FaUserFriends size={12}/>, count: users.length },
    { value: 'requests',  label: 'Requests',  icon: <FaTint size={12}/>, count: requests.length },
    { value: 'inventory', label: 'Inventory', icon: <FaBoxes size={12}/>, count: inventory.length }
  ]

  if (loading) return (
    <DashboardLayout title="Admin Dashboard" subtitle="System administration">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <FaTint size={32} color="#DC2626" style={{ marginBottom: '12px' }}/>
          <div style={{ color: '#4B5563', fontSize: '14px' }}>Loading admin data...</div>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="ব্লাডনেট পরিচালনা — Comprehensive system overview"
    >

      {/* ── WELCOME BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        border: '1px solid #FECACA',
        borderRadius: '14px', padding: '22px 28px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '20px',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#4B5563', marginBottom: '2px', fontStyle: 'italic' }}>
            স্বাগতম — System Administration
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#7F1D1D', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCog size={18}/> Admin Panel — {user?.name}
          </h2>
        </div>
        <button onClick={fetchAll} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#FFFFFF',
          color: '#DC2626', border: '1.5px solid #FECACA',
          padding: '9px 18px', borderRadius: '8px',
          fontSize: '13px', fontWeight: '700', cursor: 'pointer'
        }}>
          <FaSync size={12}/> Refresh Data
        </button>
      </div>

      {/* ── STATS CARDS ── */}
      {stats && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px', marginBottom: '20px'
        }}>
          {[
            { icon: <FaUserFriends size={18}/>, num: stats.totalDonors, label: 'Total donors', sub: 'মোট দাতা', bg: '#FEF2F2', color: '#DC2626' },
            { icon: <FaTint size={18}/>, num: stats.availableDonors, label: 'Available donors', sub: 'উপলব্ধ দাতা', bg: '#DCFCE7', color: '#166534' },
            { icon: <FaClipboardList size={18}/>, num: stats.totalRequests, label: 'Total requests', sub: 'মোট অনুরোধ', bg: '#FEF2F2', color: '#7F1D1D' },
            { icon: <FaCheckCircle size={18}/>, num: stats.fulfilledRequests, label: 'Fulfilled', sub: 'পূরণ হয়েছে', bg: '#DCFCE7', color: '#166534' },
            { icon: <FaExclamationTriangle size={18}/>, num: stats.emergencyRequests, label: 'Emergency', sub: 'জরুরি', bg: '#FEF2F2', color: '#DC2626' },
            { icon: <FaClipboardList size={18}/>, num: stats.pendingRequests, label: 'Pending', sub: 'অপেক্ষমান', bg: '#FEF3C7', color: '#92400E' },
            { icon: <FaBoxes size={18}/>, num: inventory.length, label: 'Inventory items', sub: 'ইনভেন্টরি', bg: '#FEF2F2', color: '#7F1D1D' },
            { icon: <FaUserFriends size={18}/>, num: stats.totalUsers, label: 'Total users', sub: 'মোট ব্যবহারকারী', bg: '#FEF2F2', color: '#DC2626' }
          ].map((s, i) => (
            <div key={i} style={{
              background: '#FFFFFF', border: '1px solid #FECACA',
              borderRadius: '12px', padding: '16px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '42px', height: '42px', background: s.bg,
                borderRadius: '10px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: s.color, flexShrink: 0
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#7F1D1D' }}>{s.num}</div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#1F2937' }}>{s.label}</div>
                <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#4B5563' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BLOOD GROUP BREAKDOWN ── */}
      {stats?.bloodGroupStats?.length > 0 && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #FECACA',
          borderRadius: '14px', padding: '20px 24px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTint size={16}/> Donor Blood Group Distribution
          </div>
          <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#4B5563', marginBottom: '16px' }}>
            রক্তের গ্রুপ অনুযায়ী দাতার সংখ্যা
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
            {BLOOD_GROUPS.map((bg) => {
              const found = stats.bloodGroupStats.find(s => s._id === bg)
              const count = found?.count || 0
              const max   = Math.max(...stats.bloodGroupStats.map(s => s.count), 1)
              const pct   = Math.round((count / max) * 100)
              return (
                <div key={bg} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#7F1D1D', marginBottom: '6px' }}>
                    {bg}
                  </div>
                  <div style={{
                    height: '60px', background: '#FEF2F2',
                    borderRadius: '6px', position: 'relative',
                    overflow: 'hidden', marginBottom: '6px'
                  }}>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: `${pct}%`, background: '#DC2626',
                      borderRadius: '4px', transition: 'height .3s ease',
                      minHeight: count > 0 ? '4px' : '0'
                    }}/>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#DC2626' }}>{count}</div>
                  <div style={{ fontSize: '10px', color: '#4B5563' }}>donors</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      <div style={{
        display: 'flex', gap: '4px', background: '#FFFFFF',
        border: '1px solid #FECACA', borderRadius: '12px',
        padding: '6px', marginBottom: '20px'
      }}>
        {tabs.map((tab) => (
          <button key={tab.value} onClick={() => handleTabChange(tab.value)} style={{
            flex: 1, padding: '10px 8px', borderRadius: '8px',
            border: 'none', cursor: 'pointer',
            background: activeTab === tab.value ? '#DC2626' : 'transparent',
            color: activeTab === tab.value ? '#FFFFFF' : '#4B5563',
            fontSize: '13px', fontWeight: '700', transition: 'all .2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}>
            {tab.icon} {tab.label}
            {tab.count !== null && (
              <span style={{
                background: activeTab === tab.value ? 'rgba(255,255,255,0.25)' : '#FEF2F2',
                color: activeTab === tab.value ? '#FFFFFF' : '#DC2626',
                padding: '1px 7px', borderRadius: '99px',
                fontSize: '11px', fontWeight: '800'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #FECACA',
          borderRadius: '14px', padding: '24px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D', marginBottom: '4px' }}>
            📋 Quick Actions
          </div>
          <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#4B5563', marginBottom: '20px' }}>
            দ্রুত পদক্ষেপ
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { icon: <FaUserFriends size={24} color='#DC2626'/>, title: 'Manage Donors', desc: 'View, activate or deactivate donor accounts', tab: 'users' },
              { icon: <FaTint size={24} color='#DC2626'/>, title: 'Manage Requests', desc: 'View all blood requests and update their status', tab: 'requests' },
              { icon: <FaBoxes size={24} color='#DC2626'/>, title: 'Blood Inventory', desc: 'Track and manage blood stock across hospitals', tab: 'inventory' }
            ].map((a) => (
              <div key={a.title} onClick={() => handleTabChange(a.tab)}
                style={{
                  background: '#FFF7F8', border: '1px solid #FECACA',
                  borderRadius: '12px', padding: '18px 20px',
                  cursor: 'pointer', transition: 'all .2s',
                  display: 'flex', alignItems: 'flex-start', gap: '14px'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.background = '#FEF2F2' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#FECACA'; e.currentTarget.style.background = '#FFF7F8' }}
              >
                <div style={{
                  width: '44px', height: '44px',
                  background: '#FEF2F2', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#7F1D1D', marginBottom: '4px' }}>{a.title}</div>
                  <div style={{ fontSize: '12px', color: '#4B5563' }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #FECACA',
          borderRadius: '14px', overflow: 'hidden'
        }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #FEF2F2' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaUserFriends size={14}/> All Users
            </div>
            <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#4B5563' }}>
              সকল ব্যবহারকারী — {users.length} total
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FFF7F8' }}>
                  {['Name', 'Email', 'Role', 'Blood Group', 'Upazila', 'Status', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: '800',
                      color: '#7F1D1D', textTransform: 'uppercase',
                      letterSpacing: '.06em', borderBottom: '1px solid #FEF2F2'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{
                    background: i % 2 === 0 ? '#FFFFFF' : '#FFF7F8',
                    borderBottom: '1px solid #FEF2F2'
                  }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', background: '#FEF2F2',
                          borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '13px',
                          fontWeight: '800', color: '#DC2626', flexShrink: 0
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4B5563' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: u.role === 'admin' ? '#7F1D1D' : '#FEF2F2',
                        color: u.role === 'admin' ? '#FECACA' : '#7F1D1D',
                        padding: '2px 10px', borderRadius: '99px',
                        fontSize: '11px', fontWeight: '700',
                        textTransform: 'capitalize'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.bloodGroup ? (
                        <span style={{
                          background: '#DC2626', color: '#FFFFFF',
                          padding: '2px 10px', borderRadius: '99px',
                          fontSize: '12px', fontWeight: '900'
                        }}>
                          {u.bloodGroup}
                        </span>
                      ) : (
                        <span style={{ color: '#4B5563', fontSize: '12px' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4B5563' }}>
                      <FaMapMarkerAlt size={10} color="#DC2626" style={{ marginRight: '4px' }}/>
                      {u.upazila}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: u.isActive ? '#DCFCE7' : '#FEF2F2',
                        color: u.isActive ? '#166534' : '#DC2626',
                        border: `1px solid ${u.isActive ? '#86EFAC' : '#FECACA'}`,
                        padding: '2px 10px', borderRadius: '99px',
                        fontSize: '11px', fontWeight: '700',
                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                      }}>
                        {getStatusIcon(u.isActive ? 'Active' : 'Inactive')}
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => toggleUser(u._id)} style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: u.isActive ? '#FEF2F2' : '#DCFCE7',
                        color: u.isActive ? '#DC2626' : '#166534',
                        border: `1px solid ${u.isActive ? '#FECACA' : '#86EFAC'}`,
                        padding: '6px 12px', borderRadius: '6px',
                        fontSize: '11px', fontWeight: '700', cursor: 'pointer'
                      }}>
                        {u.isActive
                          ? <><FaToggleOff size={12}/> Deactivate</>
                          : <><FaToggleOn size={12}/> Activate</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REQUESTS TAB ── */}
      {activeTab === 'requests' && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #FECACA',
          borderRadius: '14px', overflow: 'hidden'
        }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #FEF2F2' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaTint size={14}/> All Blood Requests
            </div>
            <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#4B5563' }}>
              সকল রক্তের অনুরোধ — {requests.length} total
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FFF7F8' }}>
                  {['Patient', 'Blood', 'Hospital', 'Upazila', 'Urgency', 'Status', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: '800',
                      color: '#7F1D1D', textTransform: 'uppercase',
                      letterSpacing: '.06em', borderBottom: '1px solid #FEF2F2'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => {
                  const st = getStatusStyle(req.status)
                  return (
                    <tr key={req._id} style={{
                      background: i % 2 === 0 ? '#FFFFFF' : '#FFF7F8',
                      borderBottom: '1px solid #FEF2F2'
                    }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>
                        {req.patientName}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: '#DC2626', color: '#FFFFFF',
                          padding: '3px 10px', borderRadius: '99px',
                          fontSize: '12px', fontWeight: '900'
                        }}>
                          {req.bloodGroup}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4B5563' }}>
                        <FaHospital size={10} color="#DC2626" style={{ marginRight: '4px' }}/>
                        {req.hospital?.substring(0, 20)}...
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4B5563' }}>
                        {req.upazila}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: req.urgencyLevel === 'Emergency' ? '#7F1D1D' : req.urgencyLevel === 'Urgent' ? '#FEF3C7' : '#DCFCE7',
                          color: req.urgencyLevel === 'Emergency' ? '#FECACA' : req.urgencyLevel === 'Urgent' ? '#92400E' : '#166534',
                          padding: '2px 10px', borderRadius: '99px',
                          fontSize: '11px', fontWeight: '700'
                        }}>
                          {req.urgencyLevel}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: st.bg, color: st.color,
                          border: `1px solid ${st.border}`,
                          padding: '2px 10px', borderRadius: '99px',
                          fontSize: '11px', fontWeight: '700',
                          display: 'inline-flex', alignItems: 'center', gap: '5px'
                        }}>
                          {getStatusIcon(req.status)}
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          defaultValue={req.status}
                          onChange={e => updateRequestStatus(req._id, e.target.value)}
                          style={{
                            padding: '6px 10px', border: '1.5px solid #FECACA',
                            borderRadius: '6px', fontSize: '12px',
                            color: '#1F2937', background: '#FFFFFF',
                            outline: 'none', cursor: 'pointer'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Fulfilled">Fulfilled</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INVENTORY TAB ── */}
      {activeTab === 'inventory' && (
        <div>
          {/* Add inventory button */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px'
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaBoxes size={14}/> Blood Inventory
              </div>
              <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#4B5563' }}>
                রক্তের মজুদ — Track blood stock across Sylhet hospitals
              </div>
            </div>
            <button onClick={() => setShowAddInv(!showAddInv)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: showAddInv ? '#FEF2F2' : '#DC2626',
              color: showAddInv ? '#DC2626' : '#FFFFFF',
              border: showAddInv ? '1.5px solid #FECACA' : 'none',
              padding: '10px 20px', borderRadius: '10px',
              fontSize: '13px', fontWeight: '800', cursor: 'pointer'
            }}>
              <FaPlus size={12}/>
              {showAddInv ? 'Cancel' : 'Add Blood Stock'}
            </button>
          </div>

          {/* Add inventory form */}
          {showAddInv && (
            <div style={{
              background: '#FFFFFF', border: '1.5px solid #FECACA',
              borderRadius: '14px', padding: '24px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#7F1D1D', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPlus size={14}/> Add Blood Stock
              </div>
              <form onSubmit={handleAddInventory}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7F1D1D', marginBottom: '5px', textTransform: 'uppercase' }}>Hospital</label>
                    <select value={invForm.hospital} onChange={e => setInvForm({ ...invForm, hospital: e.target.value })} required style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                      <option value="">Select hospital</option>
                      {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7F1D1D', marginBottom: '5px', textTransform: 'uppercase' }}>Upazila</label>
                    <select value={invForm.upazila} onChange={e => setInvForm({ ...invForm, upazila: e.target.value })} required style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                      <option value="">Select upazila</option>
                      {UPAZILAS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7F1D1D', marginBottom: '5px', textTransform: 'uppercase' }}>Blood group</label>
                    <select value={invForm.bloodGroup} onChange={e => setInvForm({ ...invForm, bloodGroup: e.target.value })} required style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                      <option value="">Select group</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7F1D1D', marginBottom: '5px', textTransform: 'uppercase' }}>Units</label>
                    <input type="number" min="1" placeholder="Number of units" value={invForm.units} onChange={e => setInvForm({ ...invForm, units: e.target.value })} required style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7F1D1D', marginBottom: '5px', textTransform: 'uppercase' }}>Expiry date</label>
                    <input type="date" value={invForm.expiryDate} onChange={e => setInvForm({ ...invForm, expiryDate: e.target.value })} required style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" style={{
                      width: '100%', background: '#DC2626', color: '#FFFFFF',
                      border: 'none', padding: '10px', borderRadius: '8px',
                      fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}>
                      <FaPlus size={12}/> Add to Inventory
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Inventory table */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #FECACA',
            borderRadius: '14px', overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FFF7F8' }}>
                    {['Hospital', 'Upazila', 'Blood Group', 'Units', 'Status', 'Expiry Date', 'Last Updated'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: '11px', fontWeight: '800',
                        color: '#7F1D1D', textTransform: 'uppercase',
                        letterSpacing: '.06em', borderBottom: '1px solid #FEF2F2'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventory.length > 0 ? inventory.map((inv, i) => {
                    const st = getInvStyle(inv.status)
                    return (
                      <tr key={inv._id} style={{
                        background: i % 2 === 0 ? '#FFFFFF' : '#FFF7F8',
                        borderBottom: '1px solid #FEF2F2'
                      }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>
                            <FaHospital size={10} color="#DC2626" style={{ marginRight: '6px' }}/>
                            {inv.hospital?.substring(0, 25)}...
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4B5563' }}>
                          {inv.upazila}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: '#DC2626', color: '#FFFFFF',
                            padding: '3px 12px', borderRadius: '99px',
                            fontSize: '13px', fontWeight: '900'
                          }}>
                            {inv.bloodGroup}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '800', color: '#1F2937' }}>
                          {inv.units} <span style={{ fontSize: '11px', color: '#4B5563', fontWeight: '500' }}>units</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: st.bg, color: st.color,
                            border: `1px solid ${st.border}`,
                            padding: '3px 10px', borderRadius: '99px',
                            fontSize: '11px', fontWeight: '700',
                            display: 'inline-flex', alignItems: 'center', gap: '5px'
                          }}>
                            {getStatusIcon(inv.status)}
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4B5563' }}>
                          {new Date(inv.expiryDate).toLocaleDateString('en-BD')}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '11px', color: '#4B5563' }}>
                          {new Date(inv.updatedAt).toLocaleDateString('en-BD')}
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#4B5563', fontSize: '14px' }}>
                        No inventory items yet. Add blood stock above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  )
}

export default AdminDashboard
