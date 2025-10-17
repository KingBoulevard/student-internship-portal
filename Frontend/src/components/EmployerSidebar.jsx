import { NavLink } from "react-router-dom";

function EmployerSidebar() {
  return (
    <aside className="w-64 bg-green-800 text-white h-screen p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Employer Menu</h2>
      <nav className="space-y-2">
        <NavLink
          to="/employers/post-job"
          className={({ isActive }) =>
            isActive
              ? "bg-green-600 px-3 py-2 block rounded"
              : "hover:bg-green-700 px-3 py-2 block rounded"
          }
        >
          Post a Job
        </NavLink>
        <NavLink
          to="/employers/jobs"
          className={({ isActive }) =>
            isActive
              ? "bg-green-600 px-3 py-2 block rounded"
              : "hover:bg-green-700 px-3 py-2 block rounded"
          }
        >
          Posted Jobs
        </NavLink>
      </nav>
    </aside>
  );
}

export default EmployerSidebar;
