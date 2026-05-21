import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import UserManagement from '../pages/UserManagement';
import TaskMonitoring from '../pages/TaskMonitoring';
import ActivityLogs from '../pages/ActivityLogs';
import Unauthorized from '../pages/Unauthorized';
import DashboardLayout from '../layouts/DashboardLayout';

// Guard for authentication and roles
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-spinner">Validating authorization session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Guard to prevent logged-in users from seeing Auth pages
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-spinner">Verifying credentials...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user: authUser } = useContext(AuthContext);
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route 
        path="/login" 
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        } 
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Layout Routes */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['User', 'Admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route 
          path="/dashboard" 
          element={
            user?.role === "Admin"
              ? <AdminDashboard />
              : <UserDashboard />
          } 
        />
        <Route
          path="/users"
          element={
            user?.role === "Admin"
              ? <UserManagement />
              : <Navigate to="/unauthorized" />
          }
        />
        <Route
          path="/tasks-monitor"
          element={
            user?.role === "Admin"
              ? <TaskMonitoring />
              : <Navigate to="/unauthorized" />
          }
        />
        <Route
          path="/logs"
          element={
            user?.role === "Admin"
              ? <ActivityLogs />
              : <Navigate to="/unauthorized" />
          }
        />
      </Route>

      {/* Fallback redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
