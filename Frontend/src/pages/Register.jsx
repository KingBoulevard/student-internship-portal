import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs to track rapid input and prevent over-updates
  const lastUpdateTime = useRef(0);
  const updateThreshold = 50; // ms between updates
  const navigate = useNavigate();

  // Debounced email handler to prevent rapid updates
  const handleEmailChange = useCallback((e) => {
    const now = Date.now();
    if (now - lastUpdateTime.current < updateThreshold) {
      return; // Skip this update if too soon
    }
    lastUpdateTime.current = now;
    
    try {
      setEmail(e.target.value);
    } catch (error) {
      console.error('Error in email change:', error);
    }
  }, []);

  // Safe input handlers for other fields
  const handleFullNameChange = (e) => setFullName(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
  const handleRoleChange = (e) => setRole(e.target.value);

  // Safe key handlers with backspace protection
  const handleKeyDown = (e) => {
    // Let backspace/delete work naturally without interference
    if (e.key === 'Enter' && !isLoading) {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      // Basic validation
      if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
        toast.error("Please fill in all fields.");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error("Please enter a valid email address.");
        return;
      }

      // Check duplicate email
      try {
        const existingRaw = localStorage.getItem("registeredUsers");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const emailLower = email.trim().toLowerCase();
        const duplicateUser = existing.find((u) => (u.email || "").toLowerCase() === emailLower);
        
        if (duplicateUser) {
          toast.error("An account with this email already exists.");
          return;
        }

        // Build and save user
        const newUser = {
          id: Date.now(),
          name: fullName.trim(),
          email: email.trim(),
          role,
          verified: role === "employer" ? false : undefined,
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = [newUser, ...existing];
        localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

        toast.success("Account created successfully!");

        setTimeout(() => {
          setFullName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setRole("student");
          navigate("/");
        }, 1200);

      } catch (storageError) {
        console.error('Storage error:', storageError);
        toast.error("Error saving account. Please try again.");
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fullName}
            onChange={handleFullNameChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          {/* 🎯 SPECIAL EMAIL INPUT WITH BACKSPACE PROTECTION */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={handleEmailChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            minLength={6}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            minLength={6}
          />

          <select
            value={role}
            onChange={handleRoleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="student">Student</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className={`w-full p-2 rounded transition-colors ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <button
            onClick={() => navigate("/")}
            disabled={isLoading}
            className="w-full text-sm text-green-600 underline mt-2 disabled:text-gray-400"
          >
            Already have an account? Login here
          </button>
        </div>

        {/* 🎯 FIXED: Debug info without process.env */}
        {import.meta.env?.DEV && (
          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p>Email characters: {email.length}</p>
            <p>Hold backspace to test performance</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;