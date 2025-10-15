// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    users: 0,
    verifiedEmployers: 0,
    jobs: 0,
    applications: 0,
  });

  const [roleData, setRoleData] = useState([]);
  const [verificationData, setVerificationData] = useState([]);

  useEffect(() => {
    const refresh = () => {
      const usersRaw = localStorage.getItem("registeredUsers");
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const jobsRaw = localStorage.getItem("employerJobs");
      const jobs = jobsRaw ? JSON.parse(jobsRaw) : [];
      const appsRaw = localStorage.getItem("appliedJobs");
      const apps = appsRaw ? JSON.parse(appsRaw) : [];

      const verifiedEmployers = users.filter(
        (u) => (u.role || "").toLowerCase() === "employer" && u.verified === true
      ).length;

      const students = users.filter(
        (u) => (u.role || "").toLowerCase() === "student"
      ).length;
      const employers = users.filter(
        (u) => (u.role || "").toLowerCase() === "employer"
      ).length;
      const admins = users.filter(
        (u) => (u.role || "").toLowerCase() === "admin"
      ).length;

      setSummary({
        users: users.length,
        verifiedEmployers,
        jobs: jobs.length,
        applications: Array.isArray(apps) ? apps.length : 0,
      });

      setRoleData([
        { name: "Students", value: students },
        { name: "Employers", value: employers },
        { name: "Admins", value: admins },
      ]);

      setVerificationData([
        { name: "Verified", value: verifiedEmployers },
        { name: "Unverified", value: Math.max(employers - verifiedEmployers, 0) },
      ]);
    };

    refresh();

    const onStorage = (e) => {
      if (["registeredUsers", "employerJobs", "appliedJobs"].includes(e.key))
        refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow border">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{summary.users}</p>
        </div>

        <div className="bg-white p-4 rounded shadow border">
          <p className="text-sm text-gray-500">Verified Employers</p>
          <p className="text-2xl font-bold">{summary.verifiedEmployers}</p>
        </div>

        <div className="bg-white p-4 rounded shadow border">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="text-2xl font-bold">{summary.jobs}</p>
        </div>

        <div className="bg-white p-4 rounded shadow border">
          <p className="text-sm text-gray-500">Applications</p>
          <p className="text-2xl font-bold">{summary.applications}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Role Distribution */}
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="font-semibold mb-2 text-center">User Role Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roleData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {roleData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Job vs Applications */}
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="font-semibold mb-2 text-center">Jobs vs Applications</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[{ name: "Stats", Jobs: summary.jobs, Applications: summary.applications }]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Jobs" fill="#3b82f6" />
              <Bar dataKey="Applications" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employer Verification */}
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="font-semibold mb-2 text-center">Employer Verification Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={verificationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {verificationData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
