// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    users: 0,
    verifiedEmployers: 0,
    jobs: 0,
    applications: 0,
  });

  useEffect(() => {
    const refresh = () => {
      const usersRaw = localStorage.getItem("registeredUsers");
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const jobsRaw = localStorage.getItem("employerJobs");
      const jobs = jobsRaw ? JSON.parse(jobsRaw) : [];
      const appsRaw = localStorage.getItem("appliedJobs");
      const apps = appsRaw ? JSON.parse(appsRaw) : [];

      const verifiedEmployers = users.filter((u) => (u.role || "").toLowerCase() === "employer" && u.verified === true).length;

      setSummary({
        users: users.length,
        verifiedEmployers,
        jobs: jobs.length,
        applications: Array.isArray(apps) ? apps.length : 0,
      });
    };

    refresh();

    // Keep dashboard live across tabs
    const onStorage = (e) => {
      if (["registeredUsers", "employerJobs", "appliedJobs"].includes(e.key)) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
