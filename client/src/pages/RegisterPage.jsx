import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import {
  FaTint,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaHandHoldingHeart,
  FaHospital,
  FaMale,
  FaFemale,
  FaTransgenderAlt,
} from 'react-icons/fa'

const UPAZILAS = [
  'Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Companiganj',
  'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur',
  'Kanaighat', 'Osmaninagar', 'South Surma', 'Balaganj', 'Zakiganj'
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const RegisterPage = () => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'donor',
    bloodGroup: '',
    dateOfBirth: '',
    gender: '',
    upazila: '',
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const nextStep = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        toast.error('Please fill all fields')
        return
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
    }

    if (step === 2 && form.role === 'donor') {
      if (!form.bloodGroup || !form.dateOfBirth || !form.gender) {
        toast.error('Please fill all fields')
        return
      }
    }

    setStep(step + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.phone || !form.upazila) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const registeredUser = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
        upazila: form.upazila,
        bloodGroup: form.role === 'donor' ? form.bloodGroup : undefined,
        dateOfBirth: form.role === 'donor' ? form.dateOfBirth : undefined,
        gender: form.role === 'donor' ? form.gender : undefined,
      })

      if (!registeredUser) return
      if (registeredUser.role === 'admin') navigate('/admin')
      else if (registeredUser.role === 'requester') navigate('/dashboard/patient')
      else navigate('/dashboard/donor')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (pl = '14px') => ({
    width: '100%',
    padding: `12px 14px 12px ${pl}`,
    border: '1.5px solid #fecaca',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1F2937',
    background: '#fff',
    outline: 'none',
  })

  const focusStyle = (e) => {
    e.target.style.borderColor = '#dc2626'
    e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)'
  }

  const blurStyle = (e) => {
    e.target.style.borderColor = '#fecaca'
    e.target.style.boxShadow = 'none'
  }

  const steps = [
    { num: 1, label: 'Personal info' },
    { num: 2, label: 'Blood details' },
    { num: 3, label: 'Location' },
  ]

  const roleOptions = [
    { value: 'donor', icon: <FaHandHoldingHeart size={18} />, label: 'Blood Donor', desc: 'I want to donate blood' },
    { value: 'requester', icon: <FaHospital size={18} />, label: 'Patient / Requester', desc: 'I need blood for patient' },
  ]

  const genderOptions = [
    { value: 'Male', icon: <FaMale size={18} /> },
    { value: 'Female', icon: <FaFemale size={18} /> },
    { value: 'Other', icon: <FaTransgenderAlt size={18} /> },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FFF7F8' }}>
      {/* Left panel */}
      <div
        style={{
          width: '380px',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              background: '#dc2626',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaTint color="#fff" size={18} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#7f1d1d' }}>BloodNet</div>
            <div style={{ fontSize: '10px', color: '#4B5563' }}>Sylhet, Bangladesh</div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#7f1d1d', marginBottom: '8px' }}>Join BloodNet</h2>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#000000', marginBottom: '32px' }}>মানবতার সবচেয়ে সুন্দর রূপ—স্বেচ্ছায় রক্তদান</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {steps.map((s) => (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: step >= s.num ? 1 : 0.5,
                  transition: 'opacity .3s',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    flexShrink: 0,
                    background: step > s.num ? '#dc2626' : step === s.num ? '#fff' : '#fecaca',
                    border: step === s.num ? '2px solid #fca5a5' : 'none',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {step > s.num ? (
                    <FaCheckCircle color="#fff" size={16} />
                  ) : (
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#7f1d1d' }}>{s.num}</span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#7f1d1d' }}>Step {s.num}</div>
                  <div style={{ fontSize: '11px', color: '#4B5563' }}>{s.label}</div>
                </div>
                {step === s.num && <div style={{ marginLeft: 'auto', width: '8px', height: '8px', background: '#fca5a5', borderRadius: '50%' }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#4B5563' }}>
          Already have an account? <Link to="/login" style={{ color: '#7f1d1d', fontWeight: '700' }}>Login here</Link>
          {' · '}
          <Link to="/" style={{ color: '#7f1d1d', fontWeight: '700' }}>Back to Home</Link>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#7f1d1d' }}>Step {step} of 3 — {steps[step - 1].label}</span>
              <span style={{ fontSize: '13px', color: '#4B5563' }}>{Math.round((step / 3) * 100)}% complete</span>
            </div>
            <div style={{ height: '6px', background: '#fecaca', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(step / 3) * 100}%`, background: '#dc2626', borderRadius: '99px', transition: 'width .4s ease' }} />
            </div>
          </div>

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#7f1d1d', marginBottom: '4px' }}>Personal information</h2>
              <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '24px' }}>Tell us about yourself to get started</p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>I want to register as</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {roleOptions.map((r) => (
                    <div
                      key={r.value}
                      onClick={() => setForm({ ...form, role: r.value })}
                      style={{
                        padding: '14px',
                        cursor: 'pointer',
                        border: `2px solid ${form.role === r.value ? '#dc2626' : '#fecaca'}`,
                        borderRadius: '10px',
                        background: form.role === r.value ? '#fef2f2' : '#fff',
                        transition: 'all .2s',
                      }}
                    >
                      <div style={{ color: form.role === r.value ? '#dc2626' : '#7f1d1d', marginBottom: '6px' }}>{r.icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: form.role === r.value ? '#dc2626' : '#374151' }}>{r.label}</div>
                      <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '2px' }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Full name</label>
                <div style={{ position: 'relative' }}>
                  <FaUser style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#fca5a5' }} size={13} />
                  <input name="name" placeholder="Md. Rafiqul Islam" value={form.name} onChange={handleChange} style={inputStyle('40px')} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#fca5a5' }} size={13} />
                  <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} style={inputStyle('40px')} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#fca5a5' }} size={13} />
                  <input name="password" type="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} style={inputStyle('40px')} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#fca5a5' }} size={13} />
                  <input name="confirmPassword" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} style={inputStyle('40px')} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#7f1d1d', marginBottom: '4px' }}>Blood details</h2>
              <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '24px' }}>
                {form.role === 'donor' ? 'Your blood information helps us match you with patients' : 'No blood details required for requesters'}
              </p>

              {form.role === 'donor' ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Select your blood group</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {BLOOD_GROUPS.map((bg) => (
                        <div
                          key={bg}
                          onClick={() => setForm({ ...form, bloodGroup: bg })}
                          style={{
                            padding: '14px 8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            border: `2px solid ${form.bloodGroup === bg ? '#dc2626' : '#fecaca'}`,
                            borderRadius: '10px',
                            background: form.bloodGroup === bg ? '#dc2626' : '#fff',
                            transition: 'all .15s',
                          }}
                        >
                          <div style={{ fontSize: '18px', fontWeight: '800', color: form.bloodGroup === bg ? '#fff' : '#7f1d1d' }}>{bg}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Gender</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {genderOptions.map((g) => (
                        <div
                          key={g.value}
                          onClick={() => setForm({ ...form, gender: g.value })}
                          style={{
                            padding: '12px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            border: `2px solid ${form.gender === g.value ? '#dc2626' : '#fecaca'}`,
                            borderRadius: '10px',
                            background: form.gender === g.value ? '#fef2f2' : '#fff',
                            transition: 'all .15s',
                          }}
                        >
                          <div style={{ color: form.gender === g.value ? '#dc2626' : '#7f1d1d', marginBottom: '4px' }}>{g.icon}</div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: form.gender === g.value ? '#dc2626' : '#374151' }}>{g.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '6px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Date of birth</label>
                    <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} style={inputStyle()} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                </>
              ) : (
                <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
                  <div style={{ marginBottom: '10px' }}><FaCheckCircle size={34} color="#dc2626" /></div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#7f1d1d', marginBottom: '4px' }}>No blood details needed</div>
                  <div style={{ fontSize: '13px', color: '#4B5563' }}>Click Next to continue to Step 3</div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#7f1d1d', marginBottom: '4px' }}>Location & contact</h2>
              <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '24px' }}>Where are you in Sylhet? This helps match you with nearby patients.</p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Phone number</label>
                <div style={{ position: 'relative' }}>
                  <FaPhone style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#fca5a5' }} size={13} />
                  <input name="phone" placeholder="01XXXXXXXXX" value={form.phone} onChange={handleChange} style={inputStyle('40px')} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  <FaMapMarkerAlt style={{ color: '#dc2626', marginRight: '4px' }} />
                  Your upazila in Sylhet
                </label>
                <select name="upazila" value={form.upazila} onChange={handleChange} style={inputStyle()} onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="">Select your upazila</option>
                  {UPAZILAS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9b1c1c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px' }}>
                  Registration summary
                </div>
                {[
                  { label: 'Name', value: form.name },
                  { label: 'Role', value: form.role },
                  { label: 'Blood group', value: form.bloodGroup || 'N/A' },
                  { label: 'Gender', value: form.gender || 'N/A' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid #fff8f8' }}>
                    <span style={{ color: '#4B5563' }}>{item.label}</span>
                    <span style={{ fontWeight: '700', color: '#7f1d1d' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#fca5a5' : '#dc2626',
                  color: '#fff',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '800',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <FaCheckCircle size={15} />
                {loading ? 'Creating account...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {step < 3 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  style={{
                    flex: 1,
                    background: '#fff',
                    color: '#7f1d1d',
                    border: '2px solid #fecaca',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <FaArrowLeft size={12} /> Back
                </button>
              )}
              <button
                onClick={nextStep}
                style={{
                  flex: 1,
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Next Step <FaArrowRight size={12} />
              </button>
            </div>
          )}

          {step === 3 && (
            <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#4B5563', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
              ? Go back to Step 2
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

