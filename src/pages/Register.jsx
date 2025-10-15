// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    // Basic validation
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Check duplicate email (case-insensitive)
    const existingRaw = localStorage.getItem("registeredUsers");
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const emailLower = email.trim().toLowerCase();
    const dup = existing.find((u) => (u.email || "").toLowerCase() === emailLower);
    if (dup) {
      toast.error("An account with this email already exists.");
      return;
    }

    // Build user object
    const newUser = {
      id: Date.now(),
      name: fullName.trim(),
      email: email.trim(),
      role,
      // Employers are unverified by default; others can omit verified
      verified: role === "employer" ? false : undefined,
      // NOTE: We are not storing passwords in plaintext for the demo.
      // For a real app, hash passwords server-side or use a proper auth provider.
    };

    // Save to localStorage
    const updated = [newUser, ...existing];
    localStorage.setItem("registeredUsers", JSON.stringify(updated));

    toast.success("Account created successfully!");

    // Clear form
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("student");

    // Redirect to login after short delay so toast is visible
    setTimeout(() => navigate("/"), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border border-gray-300 rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 border border-gray-300 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="student">Student</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Create Account
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full text-sm text-green-600 underline mt-2"
          >
            Already have an account? Login here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
