import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../utils/api'
import {
  FaTint, FaSearch, FaHandHoldingHeart,
  FaHospital, FaArrowRight, FaMapMarkerAlt,
  FaPhone, FaCheckCircle, FaUserFriends,
  FaHeartbeat, FaAward
} from 'react-icons/fa'

const HomePage = () => {
  const [donors, setDonors] = useState([])
  const [stats, setStats] = useState({ donors: 0, requests: 0, fulfilled: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const donorsRes = await API.get('/donors/search')
        setDonors(donorsRes.data.donors?.slice(0, 6) || [])
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [])

  const steps = [
    {
      icon: <FaUserFriends size={24}/>,
      title: 'Register as Donor',
      desc: 'Sign up with your blood group and location in Sylhet. It takes less than 2 minutes.',
      bengali: 'নিবন্ধন করুন'
    },
    {
      icon: <FaSearch size={24}/>,
      title: 'Get Matched',
      desc: 'Our system matches your blood group with patients who need blood in your upazila.',
      bengali: 'মিলিয়ে দিন'
    },
    {
      icon: <FaHandHoldingHeart size={24}/>,
      title: 'Donate & Save Lives',
      desc: 'Go to the hospital and donate blood. Every donation can save up to 3 lives.',
      bengali: 'জীবন বাঁচান'
    }
  ]

  const hospitals = [
    'MAG Osmani Medical College Hospital',
    'North East Medical College Hospital',
    'Mount Adora Hospital',
    'Sylhet Women\'s Medical College',
    'Ibn Sina Hospital Sylhet',
    'Jalalabad Ragib-Rabeya Medical'
  ]

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  return (
    <div style={{ background: '#FFF7F8', minHeight: '100vh' }}>

      {/* ── HERO SECTION ── */}
      <section style={{
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '300px', height: '300px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%'
        }}/>
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-40px',
          width: '250px', height: '250px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%'
        }}/>

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>

          {/* Main heading */}
          <h1 style={{
            fontSize: '58px', fontWeight: '900',
            lineHeight: '1', marginBottom: '12px'
          }}>
            <span style={{ color: '#7f1d1d' }}>Blood</span>
            <span style={{ color: '#DC2626' }}>Net</span>
          </h1>

          {/* Bengali slogans */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '14px',
              color: '#1F2937',
              fontWeight: '800'
            }}>
              রক্তের বন্ধনে গড়ি মানবতার নেটওয়ার্ক
            </div>
          </div>

          <p style={{
            fontSize: '17px', color: '#1F2937',
            maxWidth: '560px', margin: '0 auto 36px',
            lineHeight: '1.7'
          }}>
            BloodNet connects blood donors and patients across all 13 upazilas of Sylhet. Find donors, request blood, and save lives — all in one place.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#fff', color: '#dc2626',
              padding: '14px 28px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '800',
              textDecoration: 'none', transition: 'all .2s'
            }}>
              <FaTint size={16}/>
              Donate Blood Now
            </Link>
            <Link to="/search" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.45)',
              border: '2px solid #fca5a5',
              color: '#7f1d1d',
              padding: '14px 28px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700',
              textDecoration: 'none'
            }}>
              <FaSearch size={14}/>
              Find Donors
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 24px',
        transform: 'translateY(-40px)'
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          {[
            { num: '500+', label: 'Registered donors', icon: <FaUserFriends size={20}/>, color: '#dc2626' },
            { num: '200+', label: 'Lives saved', icon: <FaHeartbeat size={20}/>, color: '#166534' },
            { num: '13', label: 'Upazilas covered', icon: <FaMapMarkerAlt size={20}/>, color: '#7f1d1d' },
            { num: '24/7', label: 'Emergency support', icon: <FaHospital size={20}/>, color: '#92400e' }
          ].map((s) => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #fecaca',
              borderRadius: '14px', padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(127,29,29,0.08)'
            }}>
              <div style={{
                width: '48px', height: '48px',
                background: '#fef2f2', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: s.color
              }}>
                {s.icon}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#7f1d1d', marginBottom: '4px' }}>
                {s.num}
              </div>
              <div style={{ fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '20px 24px 60px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-block',
            background: '#fef2f2', color: '#dc2626',
            padding: '4px 14px', borderRadius: '99px',
            fontSize: '12px', fontWeight: '700',
            marginBottom: '12px', border: '1px solid #fecaca'
          }}>
            HOW IT WORKS
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#7f1d1d', marginBottom: '8px' }}>
            Simple. Fast. Life-saving.
          </h2>
          <p style={{ fontSize: '15px', color: '#4B5563', maxWidth: '500px', margin: '0 auto' }}>
            BloodNet makes it easy to connect donors with patients across Sylhet in 3 simple steps
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #fecaca',
              borderRadius: '14px', padding: '28px 24px',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Step number watermark */}
              <div style={{
                position: 'absolute', top: '16px', right: '20px',
                fontSize: '48px', fontWeight: '900',
                color: '#fef2f2', lineHeight: '1'
              }}>
                0{i + 1}
              </div>

              <div style={{
                width: '52px', height: '52px',
                background: '#fef2f2', borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#dc2626', marginBottom: '16px'
              }}>
                {s.icon}
              </div>

              <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#dc2626', fontWeight: '600', marginBottom: '6px' }}>
                {s.bengali}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#7f1d1d', marginBottom: '8px' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOOD GROUP SEARCH ── */}
      <section style={{ background: '#FEE2E2', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#7f1d1d', marginBottom: '8px' }}>
              Find Donors by Blood Group
            </h2>
            <p style={{ fontSize: '14px', color: '#7f1d1d', fontStyle: 'italic' }}>
              কোন রক্তের গ্রুপ দরকার?
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px', marginBottom: '28px' }}>
            {bloodGroups.map((bg) => (
              <Link key={bg} to={`/search?bloodGroup=${bg}`} style={{
                background: 'rgba(255,255,255,0.55)',
                border: '2px solid #fca5a5',
                borderRadius: '10px', padding: '16px 8px',
                textAlign: 'center', textDecoration: 'none',
                transition: 'all .2s'
              }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#dc2626'
                  e.currentTarget.style.borderColor = '#dc2626'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.55)'
                  e.currentTarget.style.borderColor = '#fca5a5'
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#7f1d1d', marginBottom: '4px' }}>{bg}</div>
                <div style={{ fontSize: '10px', color: '#7f1d1d' }}>Search</div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/search" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#fff', color: '#7f1d1d',
              padding: '12px 28px', borderRadius: '10px',
              fontSize: '14px', fontWeight: '800', textDecoration: 'none'
            }}>
              <FaSearch size={14}/> Advanced Search <FaArrowRight size={12}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED DONORS ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#7f1d1d', marginBottom: '4px' }}>
              Available Donors
            </h2>
            <p style={{ fontSize: '14px', color: '#4B5563', fontStyle: 'italic' }}>
              এখনই যোগাযোগ করুন
            </p>
          </div>
          <Link to="/search" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: '#dc2626', fontSize: '14px', fontWeight: '700',
            textDecoration: 'none'
          }}>
            View all <FaArrowRight size={12}/>
          </Link>
        </div>

        {donors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {donors.map((donor) => (
              <div key={donor._id} style={{
                background: '#fff', border: '1px solid #fecaca',
                borderRadius: '14px', padding: '20px',
                transition: 'all .2s'
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px', height: '40px', background: '#fef2f2',
                      border: '2px solid #fecaca', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', fontWeight: '800', color: '#dc2626'
                    }}>
                      {donor.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
                        {donor.user?.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaMapMarkerAlt size={9} color="#dc2626"/> {donor.upazila}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: '#dc2626', color: '#fff',
                    padding: '4px 10px', borderRadius: '99px',
                    fontSize: '13px', fontWeight: '900'
                  }}>
                    {donor.bloodGroup}
                  </div>
                </div>

                {/* Info row */}
                <div style={{
                  display: 'flex', gap: '8px',
                  marginBottom: '14px', flexWrap: 'wrap'
                }}>
                  <span style={{
                    background: '#dcfce7', color: '#166534',
                    border: '1px solid #86efac',
                    padding: '3px 10px', borderRadius: '99px',
                    fontSize: '11px', fontWeight: '600'
                  }}>
                    ✓ Available
                  </span>
                  {donor.totalDonations > 0 && (
                    <span style={{
                      background: '#fef2f2', color: '#9b1c1c',
                      border: '1px solid #fecaca',
                      padding: '3px 10px', borderRadius: '99px',
                      fontSize: '11px', fontWeight: '600'
                    }}>
                      <FaAward size={9}/> {donor.totalDonations} donations
                    </span>
                  )}
                </div>

                {/* Contact button */}
                <a href={`tel:${donor.phone}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '6px', width: '100%',
                  background: '#dc2626', color: '#fff',
                  border: 'none', padding: '10px',
                  borderRadius: '8px', fontSize: '13px',
                  fontWeight: '700', textDecoration: 'none',
                  cursor: 'pointer'
                }}>
                  <FaPhone size={12}/> Contact Donor
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#fff', border: '1px solid #fecaca',
            borderRadius: '14px', padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🩸</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#7f1d1d', marginBottom: '6px' }}>
              No donors yet
            </div>
            <div style={{ fontSize: '14px', color: '#4B5563', marginBottom: '20px' }}>
              Be the first donor in Sylhet!
            </div>
            <Link to="/register" style={{
              display: 'inline-block',
              background: '#dc2626', color: '#fff',
              padding: '10px 24px', borderRadius: '8px',
              fontSize: '14px', fontWeight: '700', textDecoration: 'none'
            }}>
              Register as Donor
            </Link>
          </div>
        )}
      </section>

      {/* ── HOSPITALS SECTION ── */}
      <section style={{ background: '#fef2f2', padding: '60px 24px', borderTop: '1px solid #fecaca' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#7f1d1d', marginBottom: '6px' }}>
              Hospitals in Sylhet
            </h2>
            <p style={{ fontSize: '14px', color: '#4B5563', fontStyle: 'italic' }}>
              সিলেটের প্রধান হাসপাতালসমূহ
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {hospitals.map((h) => (
              <div key={h} style={{
                background: '#fff', border: '1px solid #fecaca',
                borderRadius: '10px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{
                  width: '36px', height: '36px', background: '#fef2f2',
                  borderRadius: '8px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <FaHospital color="#dc2626" size={16}/>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{h}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section style={{
        background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
        padding: '70px 24px', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <FaHeartbeat size={40} color="#991b1b" style={{ marginBottom: '16px' }}/>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#7f1d1d', marginBottom: '10px' }}>
            Ready to Save a Life?
          </h2>
          
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#fff', color: '#dc2626',
              padding: '14px 28px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '800', textDecoration: 'none'
            }}>
              <FaTint size={15}/> Register as Donor
            </Link>
            <Link to="/requests" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.45)',
              border: '2px solid #fca5a5',
              color: '#7f1d1d',
              padding: '14px 28px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700', textDecoration: 'none'
            }}>
              Request Blood <FaArrowRight size={13}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#fff', padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <FaTint color="#991b1b" size={14}/>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#7f1d1d' }}>BloodNet</span>
        </div>
        <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#7f1d1d', marginBottom: '6px' }}>
          রক্ত দিন, জীবন বাঁচান 
        </div>
        <div style={{ fontSize: '11px', color: '#7f1d1d' }}>
          © 2026 BloodNet 
        </div>
      </footer>

    </div>
  )
}

export default HomePage