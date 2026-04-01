import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DonorDashboard from './pages/DonorDashboard'
import PatientDashboard from './pages/PatientDashboard'
import SearchDonors from './pages/SearchDonors'
import BloodRequestPage from './pages/BloodRequestPage'
import NotificationsPage from './pages/NotificationsPage'
import AdminDashboard from './pages/AdminDashboard'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ color: '#e53e3e', fontSize: '16px', fontWeight: '600' }}>Loading...</div>
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ color: '#e53e3e', fontSize: '16px', fontWeight: '600' }}>Loading...</div>
    </div>
  )
  return user && user.role === 'admin' ? children : <Navigate to="/" />
}

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
)

const RoleDashboardRoute = () => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ color: '#e53e3e', fontSize: '16px', fontWeight: '600' }}>Loading...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" />
  if (user.role === 'admin') return <Navigate to="/admin" />
  if (user.role === 'requester') return <Navigate to="/dashboard/patient" />
  return <Navigate to="/dashboard/donor" />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages — show navbar */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/search" element={<PublicLayout><SearchDonors /></PublicLayout>} />
      <Route path="/requests" element={<PublicLayout><BloodRequestPage /></PublicLayout>} />

      {/* Protected pages — show sidebar layout */}
      <Route path="/dashboard" element={<RoleDashboardRoute />} />
      <Route path="/dashboard/donor" element={<ProtectedRoute><DonorDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      {/* Admin pages */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/requests" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/inventory" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  )
}

export default App