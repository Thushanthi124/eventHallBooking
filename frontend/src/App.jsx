// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import About from './pages/About';
import Support from './pages/Support';
import StaffDashboard from './pages/StaffDashboard';
import HallDetails from './pages/HallDetails';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';
import AdminAssignments from './pages/AdminAssignments';
import AdminFeedback from './pages/AdminFeedback';
import AdminHistory from './pages/AdminHistory';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PaymentSuccess from './pages/PaymentSuccess';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/hall/:id" element={<HallDetails />} />

          {/* Protected Routes Wrapper */}
          <Route element={<Layout />}>
            {/* Customer Routes */}
            <Route path="/dashboard" element={
              <RoleProtectedRoute allowedRoles={['customer', 'admin']}>
                <Dashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/booking" element={
              <RoleProtectedRoute allowedRoles={['customer', 'admin']}>
                <Booking />
              </RoleProtectedRoute>
            } />

            {/* Staff Routes */}
            <Route path="/staff-dashboard" element={
              <RoleProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </RoleProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </RoleProtectedRoute>
            } />

            <Route path="/admin/history" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminHistory />
              </RoleProtectedRoute>
            } />

            <Route path="/admin/assignments" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminAssignments />
              </RoleProtectedRoute>
            } />

            <Route path="/admin/feedback" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminFeedback />
              </RoleProtectedRoute>
            } />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;