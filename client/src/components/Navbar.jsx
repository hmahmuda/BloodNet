import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaTint, FaBell, FaSignOutAlt } from 'react-icons/fa'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid #fecaca',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 24px', height: '64px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px', height: '36px', background: '#dc2626',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaTint color="#fff" size={16}/>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#7f1d1d' }}>BloodNet</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '-2px' }}>রক্ত দিন, জীবন বাঁচান</div>
          </div>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '14px' }}>
          <Link to="/" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
          <Link to="/search" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Find Donors</Link>
          <Link to="/requests" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Requests</Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: '#dc2626', fontWeight: '700', textDecoration: 'none' }}>Admin Panel</Link>
              )}
              <Link to="/dashboard" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Dashboard</Link>
              <Link to="/notifications" style={{ textDecoration: 'none' }}>
                <FaBell color="#dc2626" size={18}/>
              </Link>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#7f1d1d', color: '#fff', border: 'none',
                padding: '8px 16px', borderRadius: '8px',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
              }}>
                <FaSignOutAlt size={12}/> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#7f1d1d', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{
                background: '#dc2626', color: '#fff',
                padding: '8px 20px', borderRadius: '8px',
                fontSize: '13px', fontWeight: '700', textDecoration: 'none'
              }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar