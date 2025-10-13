import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import StudentJobs from "./pages/StudentJobs";
import StudentApplications from "./pages/StudentApplications";

import EmployerDashboard from "./pages/EmployerDashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";

// Protected Route Component
const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    toast.error("You don't have permission to access this page.");
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');

  if (token && user) {
    // Redirect to appropriate dashboard based on user type
    switch (userType) {
      case 'student':
        return <Navigate to="/student" replace />;
      case 'employer':
        return <Navigate to="/employer" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsAuthenticated(!!(token && user));
    };

    checkAuth();

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      {/* Global toaster */}
      <Toaster position="top-center" />

      <Router>
        <Routes>
          {/* Public / auth routes - redirect if already logged in */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Student routes - protected and only for students */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedUserTypes={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/jobs" 
            element={
              <ProtectedRoute allowedUserTypes={['student']}>
                <StudentJobs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/applications" 
            element={
              <ProtectedRoute allowedUserTypes={['student']}>
                <StudentApplications />
              </ProtectedRoute>
            } 
          />

          {/* Employer routes - protected and only for employers */}
          <Route 
            path="/employer/*" 
            element={
              <ProtectedRoute allowedUserTypes={['employer']}>
                <EmployerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin routes - protected and only for admins */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedUserTypes={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />          {/* /admin  */}
            <Route path="dashboard" element={<AdminDashboard />} />{/* /admin/dashboard */}
            <Route path="users" element={<AdminUsers />} />        {/* /admin/users */}
            <Route path="jobs" element={<AdminJobs />} />          {/* /admin/jobs */}
          </Route>

          {/* Fallback: redirect unknown routes based on auth status */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
                <Navigate to="/student" replace /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;