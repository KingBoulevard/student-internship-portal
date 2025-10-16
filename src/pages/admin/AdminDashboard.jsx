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
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/admin-login"; // redirect to your admin login page
  };

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

      const students = users.filter((u) => (u.role || "").toLowerCase() === "student").length;
      const employers = users.filter((u) => (u.role || "").toLowerCase() === "employer").length;
      const admins = users.filter((u) => (u.role || "").toLowerCase() === "admin").length;

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

      setData({ users, jobs, applications: apps });

      const log = [];
      users.slice(-5).forEach((u) =>
        log.push({
          type: "User Registration",
          detail: `${u.name || "Unknown"} registered as ${u.role}`,
          time: new Date().toLocaleString(),
        })
      );

      jobs.slice(-5).forEach((j) =>
        log.push({
          type: "Job Posted",
          detail: `${j.title || "Untitled"} posted by ${j.company || "Unknown"}`,
          time: new Date().toLocaleString(),
        })
      );

      apps.slice(-5).forEach((a) =>
        log.push({
          type: "Application Submitted",
          detail: `${a.studentName || "A student"} applied for ${a.jobTitle || "a job"}`,
          time: new Date().toLocaleString(),
        })
      );

      setActivityLog(log.reverse());

      const newNotifications = [];
      if (users.length > 0)
        newNotifications.push(`🧑‍🎓 ${users.length} total users registered.`);
      if (jobs.length > 0)
        newNotifications.push(`💼 ${jobs.length} jobs currently posted.`);
      if (apps.length > 0)
        newNotifications.push(`📨 ${apps.length} applications submitted.`);
      if (verifiedEmployers > 0)
        newNotifications.push(`✅ ${verifiedEmployers} employers verified.`);

      setNotifications(newNotifications);
    };

    refresh();
    const onStorage = (e) => {
      if (["registeredUsers", "employerJobs", "appliedJobs"].includes(e.key)) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const exportCSV = (key) => {
    const csv = Papa.unparse(data[key]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${key}.csv`);
  };

  const exportPDF = (key) => {
    const doc = new jsPDF();
    const rows = data[key].map((obj) => Object.values(obj));
    const columns = Object.keys(data[key][0] || {});
    doc.text(`${key.toUpperCase()} DATA`, 10, 10);
    doc.autoTable({ head: [columns], body: rows });
    doc.save(`${key}.pdf`);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* 🔹 Top Navbar */}
      <div className="w-full bg-cyan-200 text-white flex justify-between items-center px-8 py-4 shadow-md">
        <h1 className="text-xl font-bold">Welcome</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </div>

      {/* 🔹 Main Content */}
      <div className="pt-8 px-8">
        {/* Notifications */}
        <div className="bg-white shadow-md p-6 rounded-xl mb-8">
          <h3 className="text-lg font-semibold mb-3">🔔 Notifications</h3>
          <ul className="list-disc list-inside space-y-1">
            {notifications.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-blue-100 p-4 rounded-lg shadow text-center">
            <h4 className="font-semibold text-blue-800">Users</h4>
            <p className="text-2xl">{summary.users}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg shadow text-center">
            <h4 className="font-semibold text-green-800">Verified Employers</h4>
            <p className="text-2xl">{summary.verifiedEmployers}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg shadow text-center">
            <h4 className="font-semibold text-yellow-800">Jobs</h4>
            <p className="text-2xl">{summary.jobs}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg shadow text-center">
            <h4 className="font-semibold text-purple-800">Applications</h4>
            <p className="text-2xl">{summary.applications}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white shadow-md p-6 rounded-xl">
            <h4 className="font-semibold mb-4">User Roles Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {roleData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl">
            <h4 className="font-semibold mb-4">Employer Verification</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={verificationData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white shadow-md p-6 rounded-xl mb-10">
          <h3 className="text-lg font-semibold mb-3">🕒 Recent Activity</h3>
          <ul className="space-y-2">
            {activityLog.map((log, index) => (
              <li key={index} className="border-b pb-2">
                <strong>{log.type}:</strong> {log.detail}{" "}
                <em className="text-gray-500 text-sm">({log.time})</em>
              </li>
            ))}
          </ul>
        </div>

        {/* Export Buttons */}
        <div className="bg-white shadow-md p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">📤 Export Data</h3>
          <div className="flex flex-wrap gap-6">
            {["users", "jobs", "applications"].map((key) => (
              <div key={key}>
                <h4 className="font-medium mb-2">{key.toUpperCase()}</h4>
                <button
                  onClick={() => exportCSV(key)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg mr-2"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportPDF(key)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
                >
                  Export PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
