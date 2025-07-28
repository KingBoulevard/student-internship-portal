import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header with Toggle */}
      <div className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <span className="font-bold text-lg">Admin Panel</span>
        <Menu className="cursor-pointer" onClick={toggleSidebar} />
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-800 text-white p-6 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <X className="md:hidden cursor-pointer" onClick={toggleSidebar} />
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-600 px-3 py-2 block rounded"
                : "hover:bg-gray-700 px-3 py-2 block rounded"
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-600 px-3 py-2 block rounded"
                : "hover:bg-gray-700 px-3 py-2 block rounded"
            }
          >
            Manage Users
          </NavLink>
          <NavLink
            to="/admin/jobs"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-600 px-3 py-2 block rounded"
                : "hover:bg-gray-700 px-3 py-2 block rounded"
            }
          >
            Manage Jobs
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default AdminSidebar;
