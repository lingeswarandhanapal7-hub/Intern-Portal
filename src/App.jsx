import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import StudentRegister from './pages/auth/StudentRegister';
import CompanyRegister from './pages/auth/CompanyRegister';
import OTPVerify from './pages/auth/OTPVerify';
import ForgotPassword from './pages/auth/ForgotPassword';

import StudentDashboard from './pages/student/Dashboard';
import ApplyForm from './pages/student/ApplyForm';
import MyApplications from './pages/student/MyApplications';

import CompanyDashboard from './pages/company/Dashboard';
import PostInternship from './pages/company/PostInternship';
import Applicants from './pages/company/Applicants';

import ExternalLinks from './pages/ExternalLinks';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-page"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'company' ? '/company/dashboard' : '/student/dashboard'} /> : <Login />} />
      <Route path="/register/student" element={<StudentRegister />} />
      <Route path="/register/company" element={<CompanyRegister />} />
      <Route path="/verify-otp" element={<OTPVerify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/resources" element={<ExternalLinks />} />

      {/* Student routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/apply/:id" element={<ProtectedRoute role="student"><ApplyForm /></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute role="student"><MyApplications /></ProtectedRoute>} />

      {/* Company routes */}
      <Route path="/company/dashboard" element={<ProtectedRoute role="company"><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/company/post" element={<ProtectedRoute role="company"><PostInternship /></ProtectedRoute>} />
      <Route path="/company/applicants/:id" element={<ProtectedRoute role="company"><Applicants /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
