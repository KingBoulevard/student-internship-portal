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
import { saveAs } from "file-saver";
import Papa from "papaparse";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    users: 0,
    verifiedEmployers: 0,
    jobs: 0,
    applications: 0,
  });

  const [roleData, setRoleData] = useState([]);
  const [verificationData, setVerificationData] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [data, setData] = useState({ users: [], jobs: [], applications: [] });

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

      // Save all data for export
      setData({ users, jobs, applications: apps });

      // Simulated activity log
      const log = [];

      users.slice(-5).forEach((u) => {
        log.push({
          type: "User Registration",
          detail: `${u.name || "Unknown"} registered as ${u.role}`,
          role: u.role,
          time: new Date().toLocaleString(),
        });
      });

      jobs.slice(-5).forEach((j) => {
        log.push({
          type: "Job Posted",
          detail: `${j.title || "Untitled"} posted by ${j.company || "Unknown"}`,
          role: "Employer",
          time: new Date().toLocaleString(),
        });
      });

      apps.slice(-5).forEach((a) => {
        log.push({
          type: "Application Submitted",
          detail: `${a.studentName || "A student"} applied for ${a.jobTitle || "a job"}`,
          role: "Student",
          time: new Date().toLocaleString(),
        });
      });

      setActivityLog(log.reverse());
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

  // Export Function
  const exportCSV = (type) => {
    let dataset = [];
    if (type === "users") dataset = data.users;
    if (type === "jobs") dataset = data.jobs;
    if (type === "applications") dataset = data.applications;

    if (!dataset.length) {
      alert(`No ${type} data to export.`);
      return;
    }

    const csv = Papa.unparse(dataset);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${type}_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
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

      {/* Activity Log */}
      <div className="bg-white p-4 rounded shadow border mb-10">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-100">
                <th className="p-2">Time</th>
                <th className="p-2">Type</th>
                <th className="p-2">Detail</th>
                <th className="p-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-3 text-gray-500">
                    No recent activity recorded.
                  </td>
                </tr>
              ) : (
                activityLog.map((log, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-2 text-gray-500">{log.time}</td>
                    <td className="p-2 font-semibold">{log.type}</td>
                    <td className="p-2">{log.detail}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.role === "Admin"
                            ? "bg-blue-100 text-blue-700"
                            : log.role === "Employer"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded shadow border text-center">
        <h2 className="font-semibold mb-4">Export Data Reports</h2>
        <p className="text-gray-600 mb-4">Download system data for offline reporting or documentation.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => exportCSV("users")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Export Users
          </button>
          <button
            onClick={() => exportCSV("jobs")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Export Jobs
          </button>
          <button
            onClick={() => exportCSV("applications")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Export Applications
          </button>
        </div>
      </div>
    </div>
  );
}
