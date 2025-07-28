import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Navbar({ userRole }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center border-b">
      <div className="text-xl font-bold text-gray-800">
        {userRole === "student" ? "Student Dashboard" : "Employer Dashboard"}
      </div>

      <button
        onClick={() => {
          toast.success("You’ve been logged out!");
          setTimeout(() => navigate("/"), 1200);
        }}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
