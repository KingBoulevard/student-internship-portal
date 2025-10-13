import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-6 hidden md:block">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="flex flex-col gap-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive ? "bg-gray-600 px-3 py-2 rounded" : "hover:bg-gray-700 px-3 py-2 rounded"
          }
        >
          Overview
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? "bg-gray-600 px-3 py-2 rounded" : "hover:bg-gray-700 px-3 py-2 rounded"
          }
        >
          Manage Users
        </NavLink>

        <NavLink
          to="/admin/jobs"
          className={({ isActive }) =>
            isActive ? "bg-gray-600 px-3 py-2 rounded" : "hover:bg-gray-700 px-3 py-2 rounded"
          }
        >
          Manage Jobs
        </NavLink>
      </nav>
    </aside>
  );
}
