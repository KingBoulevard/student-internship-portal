// src/pages/admin/AdminJobs.jsx
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("");
  const pendingRef = useRef(null);

<<<<<<< HEAD
  // 🔹 Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/admin-login";
  };

=======
>>>>>>> 8c0d15186d84ba18239eaceed190694d9f0bed1a
  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("employerJobs");
      setJobs(raw ? JSON.parse(raw) : []);
    };
    load();

    const onStorage = (e) => {
      if (e.key === "employerJobs") {
        setJobs(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commitPendingImmediately = () => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timerId);
      localStorage.setItem("employerJobs", JSON.stringify(jobs));
      pendingRef.current = null;
    }
  };

  const undoDelete = () => {
    if (!pendingRef.current) return;
    const { item, index } = pendingRef.current;
    const restored = [...jobs];
    if (index >= 0 && index <= restored.length) restored.splice(index, 0, item);
    else restored.unshift(item);
    setJobs(restored);
    clearTimeout(pendingRef.current.timerId);
    pendingRef.current = null;
    toast.success("Deletion undone");
  };

  const scheduleCommit = (item, index) => {
    if (pendingRef.current) {
      commitPendingImmediately();
    }
    const timerId = setTimeout(() => {
      localStorage.setItem("employerJobs", JSON.stringify(jobs));
      pendingRef.current = null;
    }, 8000);
    pendingRef.current = { item, index, timerId };

<<<<<<< HEAD
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <div>
            Job deleted — <strong>undo?</strong>
          </div>
          <div className="ml-4">
            <button
              onClick={() => {
                undoDelete();
                toast.dismiss(t.id);
              }}
              className="bg-white text-gray-800 px-3 py-1 rounded text-sm"
            >
              Undo
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
=======
    toast((t) => (
      <div className="flex items-center gap-3">
        <div>Job deleted — <strong>undo?</strong></div>
        <div className="ml-4">
          <button
            onClick={() => {
              undoDelete();
              toast.dismiss(t.id);
            }}
            className="bg-white text-gray-800 px-3 py-1 rounded text-sm"
          >
            Undo
          </button>
        </div>
      </div>
    ), { duration: 8000 });
>>>>>>> 8c0d15186d84ba18239eaceed190694d9f0bed1a
  };

  const handleDelete = (id) => {
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) return;
    const item = jobs[idx];
    const updated = jobs.filter((j) => j.id !== id);
    setJobs(updated);
    scheduleCommit(item, idx);
  };

  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current.timerId);
        localStorage.setItem("employerJobs", JSON.stringify(jobs));
        pendingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = jobs.filter((j) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      (j.title && j.title.toLowerCase().includes(q)) ||
      (j.company && j.company.toLowerCase().includes(q)) ||
      (j.location && j.location.toLowerCase().includes(q))
    );
  });

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* 🔹 Top Navbar */}
      <div className="w-full bg-cyan-200 text-white flex justify-between items-center px-8 py-4 shadow-md">
        <h1 className="text-xl font-bold">Manage Jobs</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </div>

      {/* 🔹 Main Content */}
      <div className="pt-10 px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold border-b pb-2">All Posted Jobs</h2>
          <input
            type="search"
            placeholder="Search by title, company, location"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-600">No jobs posted yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded shadow-sm border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">{job.title}</h3>
                    <p className="text-sm text-gray-600">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="text-sm">{job.deadline ?? "—"}</p>
                  </div>
                </div>

                <p className="text-sm mt-2">
                  <strong>Type:</strong> {job.type}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
=======
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold border-b pb-2">All Posted Jobs</h2>
        <input
          type="search"
          placeholder="Search by title, company, location"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-600">No jobs posted yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-green-700">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="text-sm">{job.deadline ?? "—"}</p>
                </div>
              </div>

              <p className="text-sm mt-2"><strong>Type:</strong> {job.type}</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleDelete(job.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
>>>>>>> 8c0d15186d84ba18239eaceed190694d9f0bed1a
    </div>
  );
}
