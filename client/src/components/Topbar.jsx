import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaBell, FaTint } from 'react-icons/fa'

const Topbar = ({ title, subtitle }) => {
  const { user } = useAuth()

  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #fecaca',
      padding: '0 28px', height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50
    }}>
      <div>
        <div style={{ fontSize: '16px', fontWeight: '800', color: '#7f1d1d', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaTint style={{ color: '#dc2626' }} size={14}/>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>{subtitle}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link to="/notifications" style={{
          width: '36px', height: '36px', background: '#fff8f8',
          border: '1px solid #fecaca', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', position: 'relative'
        }}>
          <FaBell color="#dc2626" size={14}/>
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '16px', height: '16px', background: '#dc2626',
            borderRadius: '50%', border: '2px solid #fff',
            fontSize: '9px', fontWeight: '700', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>3</div>
        </Link>

        {user?.bloodGroup && (
          <div style={{
            background: '#dc2626', color: '#fff',
            padding: '4px 12px', borderRadius: '99px',
            fontSize: '12px', fontWeight: '800'
          }}>
            {user.bloodGroup}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#fff8f8', border: '1px solid #fecaca',
          borderRadius: '10px', padding: '4px 10px 4px 4px'
        }}>
          <div style={{
            width: '28px', height: '28px', background: '#7f1d1d',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a' }}>{user?.name?.split(' ')[0]}</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar