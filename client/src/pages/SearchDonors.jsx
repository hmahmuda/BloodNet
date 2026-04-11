import { useState, useEffect } from 'react'
import API from '../utils/api'
import { toast } from 'react-toastify'
import {
  FaSearch, FaTint, FaMapMarkerAlt, FaPhone,
  FaFilter, FaUserFriends, FaAward, FaTimes
} from 'react-icons/fa'

const UPAZILAS = [
  'Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Companiganj',
  'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur',
  'Kanaighat', 'Osmaninagar', 'South Surma', 'Balaganj', 'Zakiganj'
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const SearchDonors = () => {
  const [donors, setDonors]           = useState([])
  const [loading, setLoading]         = useState(false)
  const [searched, setSearched]       = useState(false)
  const [bloodGroup, setBloodGroup]   = useState('')
  const [upazila, setUpazila]         = useState('')
  const [totalDonors, setTotalDonors] = useState(0)

  // Load all available donors on first visit
  useEffect(() => {
    fetchDonors('', '')
  }, [])

  const fetchDonors = async (bg, uz) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (bg) params.append('bloodGroup', bg)
      if (uz) params.append('upazila', uz)
      const { data } = await API.get(`/donors/search?${params.toString()}`)
      setDonors(data.donors || [])
      setTotalDonors(data.count || 0)
      setSearched(true)
      if (data.count === 0) {
        toast.info('No donors found matching your criteria')
      }
    } catch (err) {
      console.error('Search error:', err)
      toast.error(err.response?.data?.message || 'Error searching for donors')
      setDonors([])
      setTotalDonors(0)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDonors(bloodGroup, upazila)
  }

  const handleClear = () => {
    setBloodGroup('')
    setUpazila('')
    fetchDonors('', '')
  }

  const getDaysSince = (date) => {
    if (!date) return 'Never donated'
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const getDonorLevel = (donations) => {
    if (donations >= 20) return { label: 'Platinum', emoji: '💎' }
    if (donations >= 10) return { label: 'Gold', emoji: '🥇' }
    if (donations >= 5)  return { label: 'Silver', emoji: '🥈' }
    if (donations >= 1)  return { label: 'Bronze', emoji: '🥉' }
    return null
  }

  const handleContactDonor = (phone, donorName) => {
    if (!phone) {
      toast.error('Phone number not available')
      return
    }
    toast.info(`${donorName}'s phone: ${phone}`, {
      position: 'top-center',
      autoClose: false
    })
  }

  return (
    <div style={{ background: '#FFF7F8', minHeight: '100vh' }}>

      {/* ── HERO HEADER ── */}
      <section style={{
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        padding: '48px 24px 80px',
        textAlign: 'center'
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
            <FaSearch size={11}/> Donor Search
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#7F1D1D', marginBottom: '10px' }}>
            Find Blood Donors
          </h1>
          <div style={{ fontSize: '16px', fontStyle: 'italic', color: '#000000', marginBottom: '6px' }}>
            রক্তদাতা খুঁজুন
          </div>
          <p style={{ fontSize: '14px', color: '#000000', marginBottom: '0' }}>
            Search available donors across all 13 upazilas of Sylhet by blood group and location
          </p>
        </div>
      </section>

      {/* ── SEARCH FORM (floating over hero) ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          background: '#FFFFFF', border: '1px solid #FECACA',
          borderRadius: '16px', padding: '24px 28px',
          transform: 'translateY(-44px)',
          boxShadow: '0 8px 32px rgba(127,29,29,0.10)'
        }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '12px', alignItems: 'end' }}>

              {/* Blood group */}
              <div>
                <label style={{
                  display: 'block', fontSize: '12px',
                  fontWeight: '700', color: '#7F1D1D',
                  marginBottom: '6px', textTransform: 'uppercase',
                  letterSpacing: '.06em'
                }}>
                  Blood group — রক্তের গ্রুপ
                </label>
                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px',
                    border: '1.5px solid #FECACA', borderRadius: '8px',
                    fontSize: '14px', color: '#1F2937',
                    background: '#FFFFFF', outline: 'none', cursor: 'pointer'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#DC2626'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#FECACA'; e.target.style.boxShadow = 'none' }}
                >
                  <option value="">All blood groups</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              {/* Upazila */}
              <div>
                <label style={{
                  display: 'block', fontSize: '12px',
                  fontWeight: '700', color: '#7F1D1D',
                  marginBottom: '6px', textTransform: 'uppercase',
                  letterSpacing: '.06em'
                }}>
                  Upazila — উপজেলা
                </label>
                <select value={upazila} onChange={e => setUpazila(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px',
                    border: '1.5px solid #FECACA', borderRadius: '8px',
                    fontSize: '14px', color: '#1F2937',
                    background: '#FFFFFF', outline: 'none', cursor: 'pointer'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#DC2626'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#FECACA'; e.target.style.boxShadow = 'none' }}
                >
                  <option value="">All upazilas</option>
                  {UPAZILAS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {/* Search button */}
              <button type="submit" style={{
                background: '#DC2626', color: '#FFFFFF',
                border: 'none', padding: '11px 24px',
                borderRadius: '8px', fontSize: '14px',
                fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                whiteSpace: 'nowrap', height: '44px'
              }}
                onMouseOver={e => e.currentTarget.style.background = '#7F1D1D'}
                onMouseOut={e => e.currentTarget.style.background = '#DC2626'}
              >
                <FaSearch size={13}/> Search
              </button>

              {/* Clear button */}
              {(bloodGroup || upazila) && (
                <button type="button" onClick={handleClear} style={{
                  background: '#FEF2F2', color: '#DC2626',
                  border: '1.5px solid #FECACA', padding: '11px 16px',
                  borderRadius: '8px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  whiteSpace: 'nowrap', height: '44px'
                }}>
                  <FaTimes size={12}/> Clear
                </button>
              )}

            </div>
          </form>

          {/* Quick blood group pills */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #FEF2F2' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#4B5563', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Quick select
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {BLOOD_GROUPS.map(bg => (
                <button key={bg} onClick={() => { setBloodGroup(bg); fetchDonors(bg, upazila) }}
                  style={{
                    background: bloodGroup === bg ? '#DC2626' : '#FEF2F2',
                    color: bloodGroup === bg ? '#FFFFFF' : '#DC2626',
                    border: `1.5px solid ${bloodGroup === bg ? '#DC2626' : '#FECACA'}`,
                    padding: '5px 14px', borderRadius: '99px',
                    fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                    transition: 'all .15s'
                  }}>
                  {bg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RESULTS HEADER ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginTop: '-20px', marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#7F1D1D', marginBottom: '2px' }}>
              {loading ? 'Searching...' : `${totalDonors} donor${totalDonors !== 1 ? 's' : ''} found`}
            </h2>
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#4B5563' }}>
              {bloodGroup && upazila ? `${bloodGroup} donors in ${upazila}` :
               bloodGroup ? `All ${bloodGroup} donors in Sylhet` :
               upazila ? `All donors in ${upazila}` :
               'All available donors in Sylhet'}
            </div>
          </div>

          {searched && !loading && (
            <div style={{
              background: '#DCFCE7', color: '#166534',
              border: '1px solid #86EFAC',
              padding: '6px 14px', borderRadius: '99px',
              fontSize: '12px', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <FaUserFriends size={12}/> {totalDonors} available
            </div>
          )}
        </div>

        {/* ── LOADING STATE ── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <FaTint size={32} color="#FECACA" style={{ marginBottom: '12px' }}/>
            <div style={{ color: '#4B5563', fontSize: '14px' }}>Searching for donors...</div>
          </div>
        )}

        {/* ── DONORS GRID ── */}
        {!loading && donors.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px', marginBottom: '40px'
          }}>
            {donors.map((donor) => {
              const level = getDonorLevel(donor.totalDonations)
              return (
                <div key={donor._id} style={{
                  background: '#FFFFFF',
                  border: '1px solid #FECACA',
                  borderRadius: '14px', padding: '20px',
                  transition: 'all .2s',
                  cursor: 'default'
                }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = '#DC2626'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = '#FECACA'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >

                  {/* Card top */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>

                    {/* Avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '46px', height: '46px',
                        background: '#FEF2F2',
                        border: '2px solid #FECACA',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '17px', fontWeight: '900', color: '#DC2626',
                        flexShrink: 0
                      }}>
                        {donor.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937', marginBottom: '2px' }}>
                          {donor.user?.name}
                        </div>
                        <div style={{
                          fontSize: '11px', color: '#4B5563',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <FaMapMarkerAlt size={9} color="#DC2626"/>
                          {donor.upazila}
                        </div>
                      </div>
                    </div>

                    {/* Blood group badge */}
                    <div style={{
                      background: '#DC2626', color: '#FFFFFF',
                      padding: '5px 12px', borderRadius: '99px',
                      fontSize: '14px', fontWeight: '900',
                      flexShrink: 0
                    }}>
                      {donor.bloodGroup}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: '#FEF2F2', marginBottom: '12px' }}/>

                  {/* Info row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>

                    {/* Available badge */}
                    <span style={{
                      background: '#DCFCE7', color: '#166534',
                      border: '1px solid #86EFAC',
                      padding: '3px 10px', borderRadius: '99px',
                      fontSize: '11px', fontWeight: '700'
                    }}>
                      ✓ Available
                    </span>

                    {/* Donor level badge */}
                    {level && (
                      <span style={{
                        background: '#FEF2F2', color: '#7F1D1D',
                        border: '1px solid #FECACA',
                        padding: '3px 10px', borderRadius: '99px',
                        fontSize: '11px', fontWeight: '700'
                      }}>
                        {level.emoji} {level.label}
                      </span>
                    )}

                    {/* Total donations */}
                    {donor.totalDonations > 0 && (
                      <span style={{
                        background: '#FEF2F2', color: '#7F1D1D',
                        border: '1px solid #FECACA',
                        padding: '3px 10px', borderRadius: '99px',
                        fontSize: '11px', fontWeight: '600'
                      }}>
                        <FaTint size={9}/> {donor.totalDonations} donations
                      </span>
                    )}
                  </div>

                  {/* Last donation */}
                  <div style={{
                    background: '#FFF7F8',
                    border: '1px solid #FEF2F2',
                    borderRadius: '8px', padding: '10px 12px',
                    marginBottom: '14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: '500' }}>
                      Last donation
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#7F1D1D' }}>
                        {getDaysSince(donor.lastDonationDate)}
                      </span>
                      {donor.lastDonationDate && (
                        <span style={{ fontSize: '11px', color: '#1F2937', fontWeight: '500' }}>
                          Date: {new Date(donor.lastDonationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact button */}
                  <button 
                    onClick={() => handleContactDonor(donor.phone, donor.user?.name)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      width: '100%', background: '#DC2626',
                      color: '#FFFFFF', border: 'none',
                      padding: '11px', borderRadius: '8px',
                      fontSize: '13px', fontWeight: '700',
                      textDecoration: 'none', cursor: 'pointer',
                      transition: 'background .2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#7F1D1D'}
                    onMouseOut={e => e.currentTarget.style.background = '#DC2626'}
                  >
                    <FaPhone size={12}/> Contact Donor
                  </button>

                </div>
              )
            })}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && searched && donors.length === 0 && (
          <div style={{
            background: '#FFFFFF', border: '1px solid #FECACA',
            borderRadius: '16px', padding: '60px 40px',
            textAlign: 'center', marginBottom: '40px'
          }}>
            <div style={{
              width: '72px', height: '72px',
              background: '#FEF2F2', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <FaSearch size={28} color="#FECACA"/>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#7F1D1D', marginBottom: '8px' }}>
              No donors found
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '6px' }}>
              No available donors match your search criteria right now.
            </p>
            <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#4B5563', marginBottom: '24px' }}>
              এই মুহূর্তে কোনো দাতা পাওয়া যায়নি
            </p>
            <button onClick={handleClear} style={{
              background: '#DC2626', color: '#FFFFFF',
              border: 'none', padding: '11px 28px',
              borderRadius: '8px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer'
            }}>
              Show All Donors
            </button>
          </div>
        )}

        {/* ── BOTTOM INFO SECTION ── */}
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: '14px', padding: '24px 28px',
          marginBottom: '40px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#7F1D1D', marginBottom: '4px' }}>
              🩸 Can't find the right donor?
            </div>
            <div style={{ fontSize: '13px', color: '#4B5563', fontStyle: 'italic' }}>
              রক্তের অনুরোধ জানান — Post an emergency blood request and alert all matching donors
            </div>
          </div>
          <a href="/requests" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#DC2626', color: '#FFFFFF',
            padding: '12px 24px', borderRadius: '10px',
            fontSize: '14px', fontWeight: '800',
            textDecoration: 'none', flexShrink: 0,
            transition: 'background .2s'
          }}
            onMouseOver={e => e.currentTarget.style.background = '#7F1D1D'}
            onMouseOut={e => e.currentTarget.style.background = '#DC2626'}
          >
            <FaTint size={13}/> Post Blood Request
          </a>
        </div>

      </div>
    </div>
  )
}

export default SearchDonors
