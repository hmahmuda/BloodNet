import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import API from '../utils/api'
import {
  FaTint, FaHospital, FaMapMarkerAlt, FaPhone,
  FaExclamationTriangle, FaClock, FaCheckCircle,
  FaArrowRight, FaFilter, FaPlus, FaTimes
} from 'react-icons/fa'

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
  'Jalalabad Ragib-Rabeya Medical',
  'Other'
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const BloodRequestPage = () => {
  const { user } = useAuth()
  const [requests, setRequests]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [filterGroup, setFilterGroup] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')

  const [form, setForm] = useState({
    patientName: '', bloodGroup: '', unitsNeeded: 1,
    hospital: '', upazila: '', urgencyLevel: 'Normal',
    contactNumber: '', additionalNotes: ''
  })

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      let url = '/requests?status=Pending'
      // Donors should only see requests matching their blood group
      if (user?.role === 'donor' && user?.bloodGroup) {
        url += `&bloodGroup=${encodeURIComponent(user.bloodGroup)}`
      }
      const { data } = await API.get(url)
      setRequests(data.requests || [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to post a request'); return }
    setSubmitting(true)
    try {
      const { data } = await API.post('/requests', form)
      toast.success(`Request posted! ${data.alertsSent} donors notified 🩸`)
      setShowForm(false)
      setForm({
        patientName: '', bloodGroup: '', unitsNeeded: 1,
        hospital: '', upazila: '', urgencyLevel: 'Normal',
        contactNumber: '', additionalNotes: ''
      })
      fetchRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post request')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #FECACA', borderRadius: '8px',
    fontSize: '14px', color: '#1F2937',
    background: '#FFFFFF', outline: 'none'
  }

  const focusIn  = e => { e.target.style.borderColor = '#DC2626'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)' }
  const focusOut = e => { e.target.style.borderColor = '#FECACA'; e.target.style.boxShadow = 'none' }

  const getUrgencyStyle = (level) => {
    if (level === 'Emergency') return { bg: '#7F1D1D', color: '#FECACA', border: '#991B1B' }
    if (level === 'Urgent')    return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' }
    return { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' }
  }

  const formatRequestDateTime = (date) => {
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

  const filteredRequests = requests.filter(r => {
    if (filterGroup   && r.bloodGroup   !== filterGroup)   return false
    if (filterUrgency && r.urgencyLevel !== filterUrgency) return false
    return true
  })

  const emergencyCount = requests.filter(r => r.urgencyLevel === 'Emergency').length

  return (
    <div style={{ background: '#FFF7F8', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        padding: '48px 24px 80px', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626', padding: '5px 14px',
            borderRadius: '99px', fontSize: '12px', fontWeight: '600',
            marginBottom: '16px'
          }}>
            <FaExclamationTriangle size={11}/> Blood Requests
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#7F1D1D', marginBottom: '10px' }}>
            Blood Request Board
          </h1>
          <div style={{ fontSize: '16px', fontStyle: 'italic', color: '#000000', marginBottom: '6px' }}>
            রক্তের অনুরোধ — জরুরি সাহায্য করুন
          </div>
          <p style={{ fontSize: '14px', color: '#000000' }}>
            View all active blood requests across Sylhet. Post a request or respond to help save a life.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

        {/* ── STATS + POST BUTTON (floating) ── */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #FECACA',
          borderRadius: '16px', padding: '20px 24px',
          transform: 'translateY(-44px)',
          boxShadow: '0 8px 32px rgba(127,29,29,0.10)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
        }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { num: requests.length, label: 'Total requests', color: '#7F1D1D' },
              { num: emergencyCount, label: 'Emergency', color: '#DC2626' },
              { num: requests.filter(r => r.urgencyLevel === 'Urgent').length, label: 'Urgent', color: '#92400E' },
              { num: requests.filter(r => r.urgencyLevel === 'Normal').length, label: 'Normal', color: '#166534' }
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: s.color }}>{s.num}</div>
                <div style={{ fontSize: '11px', color: '#4B5563', fontWeight: '600' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {user ? (
            <button onClick={() => setShowForm(!showForm)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: showForm ? '#FEF2F2' : '#DC2626',
              color: showForm ? '#DC2626' : '#FFFFFF',
              border: showForm ? '1.5px solid #FECACA' : 'none',
              padding: '11px 22px', borderRadius: '10px',
              fontSize: '14px', fontWeight: '800', cursor: 'pointer',
              transition: 'all .2s'
            }}>
              {showForm ? <><FaTimes size={13}/> Cancel</> : <><FaPlus size={13}/> Post Blood Request</>}
            </button>
          ) : (
            <Link to="/login" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#DC2626', color: '#FFFFFF',
              padding: '11px 22px', borderRadius: '10px',
              fontSize: '14px', fontWeight: '800', textDecoration: 'none'
            }}>
              <FaTint size={13}/> Login to Post Request
            </Link>
          )}
        </div>

        {/* ── REQUEST FORM ── */}
        {showForm && (
          <div style={{
            background: '#FFFFFF', border: '1.5px solid #FECACA',
            borderRadius: '16px', padding: '28px',
            marginTop: '-24px', marginBottom: '24px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#7F1D1D', marginBottom: '4px' }}>
                🩸 Post a Blood Request
              </h3>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#4B5563' }}>
                রক্তের অনুরোধ পোস্ট করুন — All matching donors in your area will be notified
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                {/* Patient name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Patient name
                  </label>
                  <input name="patientName" placeholder="Full name of patient"
                    value={form.patientName} onChange={handleChange} required
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                </div>

                {/* Contact number */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Contact number
                  </label>
                  <input name="contactNumber" placeholder="01XXXXXXXXX"
                    value={form.contactNumber} onChange={handleChange} required
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                </div>

                {/* Blood group */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Blood group needed
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
                    {BLOOD_GROUPS.map(bg => (
                      <div key={bg} onClick={() => setForm({ ...form, bloodGroup: bg })}
                        style={{
                          padding: '10px 6px', cursor: 'pointer', textAlign: 'center',
                          border: `2px solid ${form.bloodGroup === bg ? '#DC2626' : '#FECACA'}`,
                          borderRadius: '8px',
                          background: form.bloodGroup === bg ? '#DC2626' : '#FFFFFF',
                          transition: 'all .15s'
                        }}>
                        <div style={{ fontSize: '14px', fontWeight: '900', color: form.bloodGroup === bg ? '#FFFFFF' : '#7F1D1D' }}>
                          {bg}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  {/* Units needed */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Units needed
                    </label>
                    <input name="unitsNeeded" type="number" min="1" max="10"
                      value={form.unitsNeeded} onChange={handleChange} required
                      style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>

                  {/* Urgency level */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Urgency level
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' }}>
                      {[
                        { value: 'Normal', emoji: '🟢', color: '#166534', bg: '#DCFCE7', border: '#86EFAC' },
                        { value: 'Urgent', emoji: '🟡', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
                        { value: 'Emergency', emoji: '🔴', color: '#FFFFFF', bg: '#7F1D1D', border: '#991B1B' }
                      ].map(u => (
                        <div key={u.value} onClick={() => setForm({ ...form, urgencyLevel: u.value })}
                          style={{
                            padding: '9px 6px', cursor: 'pointer', textAlign: 'center',
                            border: `2px solid ${form.urgencyLevel === u.value ? u.border : '#FECACA'}`,
                            borderRadius: '8px',
                            background: form.urgencyLevel === u.value ? u.bg : '#FFFFFF',
                            transition: 'all .15s'
                          }}>
                          <div style={{ fontSize: '14px', marginBottom: '2px' }}>{u.emoji}</div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: form.urgencyLevel === u.value ? u.color : '#4B5563' }}>
                            {u.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hospital */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Hospital
                  </label>
                  <select name="hospital" value={form.hospital} onChange={handleChange} required
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                    <option value="">Select hospital</option>
                    {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Upazila */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Upazila
                  </label>
                  <select name="upazila" value={form.upazila} onChange={handleChange} required
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                    <option value="">Select upazila</option>
                    <option value="All">🔴 All Upazilas (Emergency — notify all areas)</option>
                    {UPAZILAS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                {/* Notes */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#7F1D1D', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Additional notes (optional)
                  </label>
                  <textarea name="additionalNotes" placeholder="Any additional information about the request..."
                    value={form.additionalNotes} onChange={handleChange} rows={3}
                    style={{ ...inputStyle, resize: 'none' }} onFocus={focusIn} onBlur={focusOut}/>
                </div>

              </div>

              {/* Submit */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={submitting || !form.bloodGroup} style={{
                  flex: 1, background: (!form.bloodGroup || submitting) ? '#FECACA' : '#DC2626',
                  color: '#FFFFFF', border: 'none', padding: '13px',
                  borderRadius: '10px', fontSize: '15px', fontWeight: '800',
                  cursor: (!form.bloodGroup || submitting) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                  <FaTint size={15}/>
                  {submitting ? 'Posting request...' : 'Post Blood Request 🩸'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  background: '#FEF2F2', color: '#DC2626',
                  border: '1.5px solid #FECACA', padding: '13px 20px',
                  borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── FILTER BAR ── */}
        <div style={{
          display: 'flex', gap: '10px', alignItems: 'center',
          marginTop: showForm ? '0' : '-20px',
          marginBottom: '20px', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563', fontSize: '13px', fontWeight: '600' }}>
            <FaFilter size={12} color="#DC2626"/> Filter:
          </div>
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
            style={{
              padding: '7px 12px', border: '1.5px solid #FECACA',
              borderRadius: '8px', fontSize: '13px', color: '#1F2937',
              background: '#FFFFFF', outline: 'none', cursor: 'pointer'
            }}>
            <option value="">All blood groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}
            style={{
              padding: '7px 12px', border: '1.5px solid #FECACA',
              borderRadius: '8px', fontSize: '13px', color: '#1F2937',
              background: '#FFFFFF', outline: 'none', cursor: 'pointer'
            }}>
            <option value="">All urgency levels</option>
            <option value="Emergency">Emergency</option>
            <option value="Urgent">Urgent</option>
            <option value="Normal">Normal</option>
          </select>
          {(filterGroup || filterUrgency) && (
            <button onClick={() => { setFilterGroup(''); setFilterUrgency('') }} style={{
              background: '#FEF2F2', color: '#DC2626',
              border: '1px solid #FECACA', padding: '7px 12px',
              borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <FaTimes size={10}/> Clear
            </button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#4B5563', fontWeight: '600' }}>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── REQUEST CARDS ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <FaTint size={32} color="#FECACA" style={{ marginBottom: '12px' }}/>
            <div style={{ color: '#4B5563', fontSize: '14px' }}>Loading requests...</div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{
            background: '#FFFFFF', border: '1px solid #FECACA',
            borderRadius: '14px', padding: '60px', textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🩸</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#7F1D1D', marginBottom: '6px' }}>
              No active requests
            </h3>
            <p style={{ fontSize: '13px', color: '#4B5563', fontStyle: 'italic' }}>
              কোনো সক্রিয় অনুরোধ নেই — Check back later or post a new request
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
            {filteredRequests.map((req) => {
              const urgStyle = getUrgencyStyle(req.urgencyLevel)
              return (
                <div key={req._id} style={{
                  background: '#FFFFFF',
                  border: `1px solid ${req.urgencyLevel === 'Emergency' ? '#FECACA' : '#FECACA'}`,
                  borderLeft: `4px solid ${req.urgencyLevel === 'Emergency' ? '#7F1D1D' : req.urgencyLevel === 'Urgent' ? '#F59E0B' : '#22C55E'}`,
                  borderRadius: '12px', padding: '20px 24px',
                  transition: 'all .2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>

                    {/* Blood group circle */}
                    <div style={{
                      width: '54px', height: '54px',
                      background: '#DC2626', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF' }}>
                        {req.bloodGroup}
                      </span>
                    </div>

                    {/* Main info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937' }}>
                          {req.patientName}
                        </h3>
                        <span style={{
                          background: urgStyle.bg, color: urgStyle.color,
                          border: `1px solid ${urgStyle.border}`,
                          padding: '2px 10px', borderRadius: '99px',
                          fontSize: '11px', fontWeight: '700'
                        }}>
                          {req.urgencyLevel === 'Emergency' ? '🚨' : req.urgencyLevel === 'Urgent' ? '⚠️' : '🟢'} {req.urgencyLevel}
                        </span>
                        <span style={{
                          background: '#FEF2F2', color: '#7F1D1D',
                          border: '1px solid #FECACA',
                          padding: '2px 10px', borderRadius: '99px',
                          fontSize: '11px', fontWeight: '600'
                        }}>
                          {req.unitsNeeded} unit{req.unitsNeeded > 1 ? 's' : ''} needed
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaHospital size={11} color="#DC2626"/> {req.hospital}
                        </span>
                        <span style={{ fontSize: '13px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaMapMarkerAlt size={11} color="#DC2626"/> {req.upazila}
                        </span>
                        <span style={{ fontSize: '13px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaClock size={11} color="#DC2626"/> {formatRequestDateTime(req.createdAt)}
                        </span>
                      </div>

                      {req.additionalNotes && (
                        <div style={{
                          marginTop: '8px', fontSize: '12px', color: '#4B5563',
                          background: '#FFF7F8', border: '1px solid #FEF2F2',
                          borderRadius: '6px', padding: '8px 12px',
                          fontStyle: 'italic'
                        }}>
                          {req.additionalNotes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <a href={`tel:${req.contactNumber}`} style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        background: '#DC2626', color: '#FFFFFF',
                        padding: '10px 18px', borderRadius: '8px',
                        fontSize: '13px', fontWeight: '700',
                        textDecoration: 'none', transition: 'background .2s'
                      }}
                        onMouseOver={e => e.currentTarget.style.background = '#7F1D1D'}
                        onMouseOut={e => e.currentTarget.style.background = '#DC2626'}
                      >
                        <FaPhone size={12}/> Call Now
                      </a>
                      <div style={{ fontSize: '11px', color: '#4B5563', textAlign: 'center' }}>
                        {req.contactNumber}
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default BloodRequestPage
