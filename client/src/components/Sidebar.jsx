import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FaTint, FaHome, FaSearch, FaBell,
  FaClipboardList, FaUser, FaSignOutAlt,
  FaChartBar, FaBoxes, FaUserFriends
} from 'react-icons/fa'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path

  const donorLinks = [
    { path: '/dashboard',      icon: <FaHome size={14}/>,          label: 'Dashboard' },
    { path: '/search',         icon: <FaSearch size={14}/>,        label: 'Find Donors' },
    { path: '/requests',       icon: <FaClipboardList size={14}/>, label: 'Blood Requests', dot: true },
    { path: '/notifications',  icon: <FaBell size={14}/>,          label: 'Notifications', dot: true },
    { path: '/profile',        icon: <FaUser size={14}/>,          label: 'My Profile' },
  ]

  const adminLinks = [
    { path: '/admin',           icon: <FaChartBar size={14}/>,     label: 'Overview' },
    { path: '/admin/users',     icon: <FaUserFriends size={14}/>,  label: 'Donors' },
    { path: '/admin/requests',  icon: <FaClipboardList size={14}/>,label: 'Requests' },
    { path: '/admin/inventory', icon: <FaBoxes size={14}/>,        label: 'Inventory' },
  ]

  const links = user?.role === 'admin' ? adminLinks : donorLinks

  return (
    <div style={{
      width: '220px', minHeight: '100vh',
      background: '#7f1d1d',
      borderRight: '1px solid #991b1b',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0,
      zIndex: 100
    }}>

      {/* Brand */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#dc2626',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaTint color="#fff" size={16}/>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>BloodNet</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Sylhet, Bangladesh</div>
          </div>
        </div>
        {/* Bengali slogan */}
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.45)',
          fontStyle: 'italic', lineHeight: '1.5',
          borderLeft: '2px solid rgba(255,255,255,0.2)',
          paddingLeft: '8px'
        }}>
          রক্ত দিন, জীবন বাঁচান<br/>
        </div>
      </div>

      {/* Role label */}
      <div style={{ padding: '12px 16px 4px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          {user?.role === 'admin' ? '⚙️ Admin Portal' : '🩸 Donor Portal'}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '6px 10px', flex: 1 }}>
        {links.map((link) => (
          <Link key={link.path} to={link.path} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px', marginBottom: '2px',
            textDecoration: 'none', fontSize: '13px',
            fontWeight: isActive(link.path) ? '700' : '500',
            color: isActive(link.path) ? '#fff' : 'rgba(255,255,255,0.55)',
            background: isActive(link.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
            transition: 'all .15s'
          }}>
            <span style={{ color: isActive(link.path) ? '#fca5a5' : 'rgba(255,255,255,0.4)' }}>
              {link.icon}
            </span>
            {link.label}
            {link.dot && (
              <div style={{
                marginLeft: 'auto', width: '7px', height: '7px',
                background: '#fca5a5', borderRadius: '50%'
              }}/>
            )}
          </Link>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '34px', height: '34px', background: '#dc2626',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#fff', flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>
              {user?.role} {user?.bloodGroup ? `· ${user.bloodGroup}` : ''}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '6px', width: '100%',
          background: 'rgba(255,255,255,0.1)', color: '#fca5a5',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '8px', borderRadius: '8px',
          fontSize: '12px', fontWeight: '600', cursor: 'pointer'
        }}>
          <FaSignOutAlt size={12}/> Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar