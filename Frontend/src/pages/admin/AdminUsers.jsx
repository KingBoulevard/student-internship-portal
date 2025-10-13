// src/pages/admin/AdminUsers.jsx
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

/**
 * Admin Users page
 * - Shows all registeredUsers (from localStorage)
 * - Supports search
 * - Edit user (modal) -> update name/email/role/verified
 * - Suspend / Reactivate user
 * - Approve / Unverify employer
 * - Delete with Undo (8s window) - optimistic UI
 *
 * Data shape assumed for each user:
 * { id, name, email, role, verified (bool for employers), suspended (bool) }
 */

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");

  // edit modal state
  const [editUser, setEditUser] = useState(null); // object being edited
  const [showEdit, setShowEdit] = useState(false);

  // pending deletion info for undo (same pattern as before)
  const pendingRef = useRef(null);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("registeredUsers");
      setUsers(raw ? JSON.parse(raw) : []);
    };
    load();

    // listen for storage events so multiple tabs reflect changes
    const onStorage = (e) => {
      if (e.key === "registeredUsers") {
        setUsers(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // commit pending deletion immediately (used when starting a new deletion)
  const commitPendingImmediately = () => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timerId);
      localStorage.setItem("registeredUsers", JSON.stringify(users));
      pendingRef.current = null;
    }
  };

  // schedule commit with undo toast
  const scheduleCommit = (item, index) => {
    // commit any previous pending immediately
    if (pendingRef.current) commitPendingImmediately();

    const timerId = setTimeout(() => {
      localStorage.setItem("registeredUsers", JSON.stringify(users));
      pendingRef.current = null;
    }, 8000);

    pendingRef.current = { item, index, timerId };

    // show toast with Undo button (8s)
    toast((t) => (
      <div className="flex items-center gap-3">
        <div>User deleted — <strong>undo?</strong></div>
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
  };

  const undoDelete = () => {
    if (!pendingRef.current) return;
    const { item, index } = pendingRef.current;
    // restore at index if possible
    const restored = [...users];
    if (index >= 0 && index <= restored.length) restored.splice(index, 0, item);
    else restored.unshift(item);
    setUsers(restored);
    clearTimeout(pendingRef.current.timerId);
    pendingRef.current = null;
    toast.success("Deletion undone");
  };

  // Delete user (optimistic UI + undo)
  const handleDelete = (id) => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return;
    const item = users[idx];
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    scheduleCommit(item, idx);
  };

  // Approve employer (persist immediately)
  const handleApprove = (id) => {
    const updated = users.map((u) => (u.id === id ? { ...u, verified: true } : u));
    setUsers(updated);
    localStorage.setItem("registeredUsers", JSON.stringify(updated));
    toast.success("Employer approved");
  };

  // Unverify
  const handleReject = (id) => {
    const updated = users.map((u) => (u.id === id ? { ...u, verified: false } : u));
    setUsers(updated);
    localStorage.setItem("registeredUsers", JSON.stringify(updated));
    toast.success("Employer marked unverified");
  };

  // Suspend / Reactivate
  const handleToggleSuspend = (id) => {
    const updated = users.map((u) => (u.id === id ? { ...u, suspended: !u.suspended } : u));
    setUsers(updated);
    localStorage.setItem("registeredUsers", JSON.stringify(updated));
    const target = updated.find((u) => u.id === id);
    toast.success(target.suspended ? "User suspended" : "User reactivated");
  };

  // Open edit modal
  const openEdit = (user) => {
    // copy to avoid direct mutation
    setEditUser({ ...user });
    setShowEdit(true);
  };

  // Save edits (validate duplicate email excluding current user)
  const saveEdit = () => {
    if (!editUser) return;
    const name = (editUser.name || "").trim();
    const email = (editUser.email || "").trim().toLowerCase();
    if (!name || !email) {
      toast.error("Name and email cannot be empty");
      return;
    }

    // duplicate email check (ignore same id)
    const dup = users.find((u) => u.email && u.email.toLowerCase() === email && u.id !== editUser.id);
    if (dup) {
      toast.error("Another account with this email already exists");
      return;
    }

    const updated = users.map((u) => (u.id === editUser.id ? { ...u, ...editUser, email } : u));
    setUsers(updated);
    localStorage.setItem("registeredUsers", JSON.stringify(updated));
    setShowEdit(false);
    setEditUser(null);
    toast.success("User updated");
  };

  // Ensure pending deletion is committed on unmount
  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current.timerId);
        localStorage.setItem("registeredUsers", JSON.stringify(users));
        pendingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filtered list
  const filtered = users.filter((u) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
  });

  return (
    <div>
      {/* header + search */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold border-b pb-2">Registered Users</h2>
        <input
          type="search"
          placeholder="Search by name or email"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-600">No registered users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Role</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const isEmployer = (u.role || "").toLowerCase() === "employer";
                const verified = Boolean(u.verified);
                const suspended = Boolean(u.suspended);
                return (
                  <tr key={u.id ?? idx} className={`border-b hover:bg-gray-50 ${suspended ? 'opacity-60' : ''}`}>
                    <td className="p-3 border align-top">{idx + 1}</td>
                    <td className="p-3 border align-top">{u.name ?? u.fullName ?? "—"}</td>
                    <td className="p-3 border align-top">{u.email ?? "—"}</td>
                    <td className="p-3 border align-top capitalize">{u.role ?? "—"}</td>
                    <td className="p-3 border align-top">
                      <div className="flex flex-col gap-1">
                        {isEmployer ? (
                          verified ? (
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Verified</span>
                          ) : (
                            <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Unverified</span>
                          )
                        ) : (
                          <span className="inline-block bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">—</span>
                        )}
                        {suspended && <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">Suspended</span>}
                      </div>
                    </td>
                    <td className="p-3 border align-top">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => openEdit(u)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggleSuspend(u.id)}
                          className={`px-3 py-1 rounded text-sm ${suspended ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
                        >
                          {suspended ? 'Reactivate' : 'Suspend'}
                        </button>

                        {isEmployer && !verified && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                          >
                            Approve
                          </button>
                        )}

                        {isEmployer && verified && (
                          <button
                            onClick={() => handleReject(u.id)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                          >
                            Unverify
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setShowEdit(false); setEditUser(null); }}></div>
          <div className="relative bg-white rounded shadow-lg w-full max-w-lg p-6 z-60">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editUser.name || ""}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Email</label>
                <input
                  type="email"
                  value={editUser.email || ""}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Role</label>
                <select
                  value={editUser.role || "student"}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="student">Student</option>
                  <option value="employer">Employer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Only show verified toggle for employer role */}
              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(editUser.verified)}
                    onChange={(e) => setEditUser({ ...editUser, verified: e.target.checked })}
                  />
                  <span className="text-sm">Verified (employers only)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => { setShowEdit(false); setEditUser(null); }}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
