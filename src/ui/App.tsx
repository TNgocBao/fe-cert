import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Login } from './auth/Login';
import { Register } from './auth/Register';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './Layout';
import { CertificateListStudent } from './certificates/CertificateListStudent';
import { CertificateListAdmin } from './admin/CertificateListAdmin';
import { CertificateEdit } from './certificates/CertificateEdit';
import { CertificateView } from './certificates/CertificateView';
import { AdminDashboard } from './admin/AdminDashboard';
import { StudentDashboard } from './student/StudentDashboard';
import { KeyManagement } from './admin/KeyManagement';
import { StaffDashboard } from './staff/StaffDashboard';
import { UserManagement } from './student/UserManagement';
import { UserProfile } from './student/UserProfile';
import { StudentManagementAdmin } from './admin/StudentManagementAdmin';
import { StudentManagementStaff } from './staff/StudentManagementStaff';
import { StudentResultsPage } from './student/StudentResultsPage';
import { NewsAnnouncements } from './NewsAnnouncements';
import VerifyDiploma from './certificates/VerifyDiploma';
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  // console.log('Current User:', user?.role);
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              {user?.role === 'ADMIN' ? <AdminDashboard /> :
               user?.role === 'STAFF' ? <StaffDashboard /> :
               <StudentDashboard />}
            </Layout>
          ) : (
            <NewsAnnouncements />
          )
        }
      />
      <Route   
        path='/results'
        element={
          <ProtectedRoute>
            <Layout>
              {user?.role === 'STUDENT' ? <StudentResultsPage /> : <Navigate to="/" replace />}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/certificates"
        element={
          <ProtectedRoute>
            <Layout>
              {user?.role === 'ADMIN' ? <CertificateListAdmin /> :
               <CertificateListStudent />}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/keys"
        element={
          <ProtectedRoute>
            <Layout>
              {user?.role === 'ADMIN' ? <KeyManagement /> : <Navigate to="/" replace />}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              {user?.role === 'ADMIN' ? <UserManagement /> : <Navigate to="/" replace />}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Layout>
              {user?.role === 'ADMIN' ? <StudentManagementAdmin /> :
               user?.role === 'STAFF' ? <StudentManagementStaff /> :
               <Navigate to="/" replace />}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CertificateView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <CertificateEdit />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <UserProfile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify-diploma"
        element={
          <ProtectedRoute>
            <Layout>
              <VerifyDiploma />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};
