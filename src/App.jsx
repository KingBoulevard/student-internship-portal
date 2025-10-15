
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import StudentJobs from "./pages/StudentJobs";
import StudentApplications from "./pages/StudentApplications";

import EmployerDashboard from "./pages/EmployerDashboard"; // this component handles its own nested routes (e.g. /employer, /employer/jobs)
import AdminLayout from "./layouts/AdminLayout"; // layout with <Outlet />
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";

function App() {
  return (
    <>
      {/* Global toaster */}
      <Toaster position="top-center" />

      <Router>
        <Routes>
          {/* Public / auth */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/jobs" element={<StudentJobs />} />
          <Route path="/student/applications" element={<StudentApplications />} />

          {/* Employer routes: EmployerDashboard contains nested <Routes /> itself, so keep the wildcard */}
          <Route path="/employer/*" element={<EmployerDashboard />} />

          {/* Admin routes: use AdminLayout with nested child routes rendered via <Outlet /> */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />          {/* /admin  */}
            <Route path="dashboard" element={<AdminDashboard />} />{/* /admin/dashboard */}
            <Route path="users" element={<AdminUsers />} />        {/* /admin/users */}
            <Route path="jobs" element={<AdminJobs />} />          {/* /admin/jobs */}
          </Route>

          {/* Fallback: redirect unknown routes to home/login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
