import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Top Bar with Menu Button */}
      <div className="md:hidden bg-blue-800 text-white p-4 flex justify-between items-center">
        <span className="font-bold text-lg">Student</span>
        <Menu className="cursor-pointer" onClick={toggleSidebar} />
      </div>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-blue-800 text-white p-6 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Student Menu</h2>
          <X
            className="cursor-pointer md:hidden"
            onClick={toggleSidebar}
          />
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/student/jobs"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 px-3 py-2 block rounded"
                : "hover:bg-blue-700 px-3 py-2 block rounded"
            }
          >
            Browse Jobs
          </NavLink>
          <NavLink
            to="/student/applications"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 px-3 py-2 block rounded"
                : "hover:bg-blue-700 px-3 py-2 block rounded"
            }
          >
            My Applications
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default StudentSidebar;
