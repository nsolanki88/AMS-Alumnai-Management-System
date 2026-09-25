import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import VerifyOtpPage from './pages/public/VerifyOtpPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentDirectory from './pages/student/StudentDirectory';
import StudentDoubts from './pages/student/StudentDoubts';
import StudentMentors from './pages/student/StudentMentors';
import StudentWorkshops from './pages/student/StudentWorkshops';
import StudentCommunity from './pages/student/StudentCommunity';

// Alumni Pages
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniProfile from './pages/alumni/AlumniProfile';
import AlumniDoubts from './pages/alumni/AlumniDoubts';
import AlumniMentorship from './pages/alumni/AlumniMentorship';
import AlumniCalendar from './pages/alumni/AlumniCalendar';
import AlumniReferrals from './pages/alumni/AlumniReferrals';
import AlumniCommunity from './pages/alumni/AlumniCommunity';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyDirectory from './pages/faculty/FacultyDirectory';
import FacultyInvitations from './pages/faculty/FacultyInvitations';
import FacultyAnalytics from './pages/faculty/FacultyAnalytics';

// Council Pages
import CouncilDashboard from './pages/council/CouncilDashboard';
import CouncilBulkUpload from './pages/council/CouncilBulkUpload';
import CouncilUnregistered from './pages/council/CouncilUnregistered';
import CouncilVerification from './pages/council/CouncilVerification';
import CouncilOutreach from './pages/council/CouncilOutreach';
import CouncilReferrals from './pages/council/CouncilReferrals';
import CouncilBatchGroups from './pages/council/CouncilBatchGroups';
import CouncilAnalytics from './pages/council/CouncilAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Verifying session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin has master access
  if (user.role === 'ADMIN') {
    return children;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's assigned dashboard
    const homePaths = {
      STUDENT: '/student/dashboard',
      ALUMNI: '/alumni/dashboard',
      FACULTY: '/faculty/dashboard',
      COUNCIL: '/council/dashboard',
      ADMIN: '/admin/dashboard'
    };
    return <Navigate to={homePaths[user.role] || '/login'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="directory" element={<StudentDirectory />} />
            <Route path="alumni" element={<StudentDirectory />} />
            <Route path="alumni/:id" element={<StudentDirectory />} />
            <Route path="doubts" element={<StudentDoubts />} />
            <Route path="doubts/:id" element={<StudentDoubts />} />
            <Route path="mentors" element={<StudentMentors />} />
            <Route path="workshops" element={<StudentWorkshops />} />
            <Route path="community" element={<StudentCommunity />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Alumni Routes */}
          <Route
            path="/alumni"
            element={
              <ProtectedRoute allowedRoles={['ALUMNI']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AlumniDashboard />} />
            <Route path="profile" element={<AlumniProfile />} />
            <Route path="doubts" element={<AlumniDoubts />} />
            <Route path="mentorship" element={<AlumniMentorship />} />
            <Route path="workshops" element={<AlumniMentorship />} />
            <Route path="calendar" element={<AlumniCalendar />} />
            <Route path="referrals" element={<AlumniReferrals />} />
            <Route path="community" element={<AlumniCommunity />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Faculty Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="directory" element={<FacultyDirectory />} />
            <Route path="alumni" element={<FacultyDirectory />} />
            <Route path="expertise" element={<FacultyDirectory />} />
            <Route path="invitations" element={<FacultyInvitations />} />
            <Route path="analytics" element={<FacultyAnalytics />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Council Routes */}
          <Route
            path="/council"
            element={
              <ProtectedRoute allowedRoles={['COUNCIL']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<CouncilDashboard />} />
            <Route path="upload" element={<CouncilBulkUpload />} />
            <Route path="unregistered" element={<CouncilUnregistered />} />
            <Route path="discovery" element={<CouncilUnregistered />} />
            <Route path="verification" element={<CouncilVerification />} />
            <Route path="matches" element={<CouncilVerification />} />
            <Route path="outreach" element={<CouncilOutreach />} />
            <Route path="referrals" element={<CouncilReferrals />} />
            <Route path="batch-groups" element={<CouncilBatchGroups />} />
            <Route path="groups" element={<CouncilBatchGroups />} />
            <Route path="analytics" element={<CouncilAnalytics />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="roles" element={<AdminUsers />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="analytics" element={<CouncilAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
