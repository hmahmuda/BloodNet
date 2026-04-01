import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FaTint, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa'

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const loggedInUser = await login(form.email, form.password)
      if (!loggedInUser) return
      if (loggedInUser.role === 'admin') navigate('/admin')
      else if (loggedInUser.role === 'requester') navigate('/dashboard/patient')
      else navigate('/dashboard/donor')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#FFF7F8',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: '#dc2626',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaTint color="#fff" size={18}/>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#7F1D1D' }}>
              BloodNet
            </div>
          </div>

          <div style={{
            display: 'inline-block',
            background: '#fef2f2',
            color: '#dc2626',
            padding: '4px 12px',
            borderRadius: '99px',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '12px',
            border: '1px solid #fecaca'
          }}>
             Welcome Back
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#7F1D1D',
            marginBottom: '6px'
          }}>
            Login to BloodNet
          </h2>
          <p style={{ fontSize: '14px', color: '#4B5563' }}>
            Access your donor dashboard and help save lives
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: '6px'
            }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{
                position: 'absolute',
                left: '13px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#fca5a5'
              }} size={14}/>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  border: '1.5px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1F2937',
                  background: '#fff',
                  outline: 'none'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#dc2626'
                  e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#fecaca'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{
                position: 'absolute',
                left: '13px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#fca5a5'
              }} size={14}/>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  border: '1.5px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1F2937',
                  background: '#fff',
                  outline: 'none'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#dc2626'
                  e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#fecaca'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Submit */}
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
              transition: 'background .2s'
            }}
            onMouseOver={e => {
              if (!loading) e.target.style.background = '#7f1d1d'
            }}
            onMouseOut={e => {
              if (!loading) e.target.style.background = '#dc2626'
            }}
          >
            <FaSignInAlt size={15}/>
            {loading ? 'Logging in...' : 'Login to BloodNet'}
          </button>

        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '24px 0'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#fecaca' }}/>
          <span style={{ fontSize: '12px', color: '#4B5563' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#fecaca' }}/>
        </div>

        {/* Register link */}
        <div style={{
          background: '#fff',
          border: '1.5px solid #fecaca',
          borderRadius: '10px',
          padding: '14px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '13px', color: '#4B5563' }}>
            Don't have an account?{' '}
          </span>
          <Link to="/register" style={{
            color: '#dc2626',
            fontWeight: '800',
            fontSize: '13px',
            textDecoration: 'none'
          }}>
            Register as Donor →
          </Link>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/" style={{
            fontSize: '12px',
            color: '#4B5563',
            textDecoration: 'none'
          }}>
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  )
}

export default LoginPage

