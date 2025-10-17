import { NavLink } from "react-router-dom";

function EmployerSidebar() {
  const links = [
    { name: "Profile", path: "/employers/profile" },
    { name: "Post a Job", path: "/employers/post-job" },
    { name: "Posted Jobs", path: "/employers/jobs" },
    { name: "Received Applications", path: "/employers/applications" },
    { name: "Settings", path: "/employers/settings" }, // optional
    { name: "Logout", path: "/logout" } // optional
  ];

  return (
    <aside className="w-64 bg-green-800 text-white h-screen p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Employer Dashboard</h2>
      <nav className="flex flex-col space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 px-3 py-2 rounded font-medium"
                : "hover:bg-green-700 px-3 py-2 rounded font-medium"
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default EmployerSidebar;
