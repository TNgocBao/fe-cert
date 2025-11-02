import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Login } from './auth/Login';
import { Register } from './auth/Register';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './Layout';
import { CertificateListUser } from './certificates/CertificateListUser';
import { CertificateListAdmin } from './certificates/CertificateListAdmin';
import { CertificateEdit } from './certificates/CertificateEdit';
import { CertificateView } from './certificates/CertificateView';
import { AdminDashboard } from './certificates/AdminDashboard';
import { RequestCreate } from './certificates/RequestCreate';
import { StudentDashboard } from './certificates/StudentDashboard';
import { RequestListAdmin } from './certificates/RequestListAdmin';
import { StudentRequestList } from './certificates/StudentRequestList';
import { KeyManagement } from './certificates/KeyManagement';
import { StaffDashboard } from './certificates/StaffDashboard';
import { UserManagement } from './certificates/UserManagement';
import { UserProfile } from './certificates/UserProfile';
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
          <ProtectedRoute>
            <Layout>
              {user?.role === 'ADMIN' ? <AdminDashboard /> :
               user?.role === 'STAFF' ? <StaffDashboard /> :
               <CertificateListUser />}
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
               user?.role === 'STAFF' ? <Navigate to="/certificates/requests" replace /> :
               <CertificateListUser />}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates/requests"
        element={
          <ProtectedRoute>
            <Layout>
              {user?.role === 'ADMIN' || user?.role === 'STAFF' ? <RequestListAdmin /> :
               <StudentRequestList />}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates/requests/my"
        element={
          <ProtectedRoute>
            <Layout>
              <StudentRequestList />
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
        path="/certificates/requests/create"
        element={
          <ProtectedRoute>
            <Layout>
              {user?.role === 'STUDENT' ? <RequestCreate /> : <Navigate to="/certificates/requests" replace />}
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
