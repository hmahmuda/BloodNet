import Sidebar from './Sidebar'
import Topbar from './Topbar'

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff8f8' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '220px', display: 'flex', flexDirection: 'column' }}>
        <Topbar title={title} subtitle={subtitle} />
        <main style={{ padding: '28px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout