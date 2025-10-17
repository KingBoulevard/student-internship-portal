import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/students/StudentDashboard";
import StudentJobs from "./pages/students/StudentJobs";
import StudentApplications from "./pages/students/StudentApplications";

import EmployerDashboard from "./pages/employers/EmployerDashboard";
import PostJob from './pages/employers/PostJob';
import PostedJobs from './pages/employers/PostedJobs';
import EmployerAdditionalDetails from "./pages/employers/EmployerAdditionalDetails";
import ResumeAnalysis from "./pages/employers/ResumeAnalysis";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";

// Fixed Protected Route Component
const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if (!token || !user) {
      setRedirectPath("/");
      setShouldRedirect(true);
      return;
    }

    if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
      toast.error("You don't have permission to access this page.");
      setRedirectPath("/");
      setShouldRedirect(true);
      return;
    }

    setShouldRedirect(false);
  }, [allowedUserTypes]);

  if (shouldRedirect) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Fixed Public Route Component
const PublicRoute = ({ children }) => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if (token && user) {
      switch (userType) {
        case 'student':
          setRedirectPath("/students");
          break;
        case 'employer':
          setRedirectPath("/employers");
          break;
        case 'admin':
          setRedirectPath("/admin/dashboard");
          break;
        default:
          setRedirectPath("/");
      }
      setShouldRedirect(true);
    } else {
      setShouldRedirect(false);
    }
  }, []);

  if (shouldRedirect) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    const handleError = (error) => {
      console.error('Global error caught:', error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsAuthenticated(!!(token && user));
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
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
            path="/students" 
            element={
              <ProtectedRoute allowedUserTypes={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students/jobs" 
            element={
              <ProtectedRoute allowedUserTypes={['student']}>
                <StudentJobs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students/applications" 
            element={
              <ProtectedRoute allowedUserTypes={['student']}>
                <StudentApplications />
              </ProtectedRoute>
            } 
          />

          {/* Employer routes - protected and only for employers */}
          <Route 
            path="/employers/*" 
            element={
              <ProtectedRoute allowedUserTypes={['employer']}>
                <EmployerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/employers/post-job" 
            element={
              <ProtectedRoute allowedUserTypes={['employer']}>
                <PostJob />
              </ProtectedRoute>
            } 
          />
  
          <Route 
            path="/employers/jobs" 
            element={
              <ProtectedRoute allowedUserTypes={['employer']}>
                <PostedJobs />
              </ProtectedRoute>
            } 
          />

          {/* Employer additional details route (should be accessible without full auth) */}
          <Route 
            path="/employers/EmployerAdditionalDetails" 
            element={<EmployerAdditionalDetails />} 
          />

          <Route 
            path="/employers/ResumeAnalysis" 
            element={
              <ProtectedRoute allowedUserTypes={['employer']}>
                <ResumeAnalysis />
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
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
          </Route>

          {/* Fallback: redirect unknown routes based on auth status */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
                <Navigate to="/students" replace /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;