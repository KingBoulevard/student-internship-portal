import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: "",
    company_name: "",
    major: "",
    industry: ""
  });
  const navigate = useNavigate();

  const lastEmailUpdate = useRef(0);
  const lastPasswordUpdate = useRef(0);

  const detectUserType = (email) => {
    if (!email.includes('@')) return 'employer';
    
    const emailDomain = email.toLowerCase().split('@')[1];
    
    const studentDomains = ['unza.zm', 'cs.unza.zm'];
    const adminDomains = ['admin.university.edu', 'it.university.edu', 'careers.university.edu'];
    
    if (studentDomains.some(domain => emailDomain === domain || emailDomain.endsWith('.' + domain))) {
      return 'student';
    }
    if (adminDomains.some(domain => emailDomain === domain)) {
      return 'admin';
    }
    return 'employer';
  };

  const handleEmailChange = (e) => {
    const now = Date.now();
    if (now - lastEmailUpdate.current < 30) return;
    lastEmailUpdate.current = now;
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    const now = Date.now();
    if (now - lastPasswordUpdate.current < 30) return;
    lastPasswordUpdate.current = now;
    setPassword(e.target.value);
  };

  const updateRegisterData = (field, value) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // =========================
  // 🎯 LOGIN HANDLER
  // =========================
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting login:", email);

      const response = await authAPI.login({ email, password });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      const user = response.employer || response.user;
      const userType = response.employer ? "employer" : response.userType || "student";

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userType", userType);

      if (userType === "employer") {
        localStorage.setItem("employer_id", user.id);
      }

      toast.success(`Welcome back, ${user.name || user.company_name || user.email}!`);

      setTimeout(() => {
        switch (userType) {
          case "student":
            navigate("/students/student");
            break;
          case "employer":
            navigate("/employers/");
            break;
          case "admin":
            navigate("/admin/dashboard");
            break;
          default:
            navigate("/");
        }
      }, 800);

    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🎯 REGISTRATION HANDLER
  // =========================
  const handleRegister = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const userType = detectUserType(email);
      const userData = { email, password };

      if (userType === "student") {
        userData.name = registerData.name;
        userData.major = registerData.major;
      } else if (userType === "employer") {
        userData.company_name = registerData.company_name;
        userData.industry = registerData.industry;
      }

      console.log("Register payload:", userData);

      const response = await authAPI.register(userData);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Registration successful!");

      if (userType === "employer") {
        const employerRegistrationData = {
          email,
          company_name: registerData.company_name,
          industry: registerData.industry,
          userId: response.id || response.userId,
          token: response.token || null,
        };
        localStorage.setItem("employerRegistrationData", JSON.stringify(employerRegistrationData));

        setTimeout(() => {
          navigate("/employers/EmployerAdditionalDetails");
        }, 1000);
      } else {
        // Student/Admin: switch to login
        setIsLogin(true);
        setRegisterData({ name: "", company_name: "", major: "", industry: "" });
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleRegisterRedirect = () => {
    setIsLogin(!isLogin);
    if (!isLogin) {
      setRegisterData({ name: "", company_name: "", major: "", industry: "" });
      setEmail("");
      setPassword("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleAuthSubmit();
    }
  };

  const detectedUserType = email ? detectUserType(email) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login to Internship Portal' : 'Create Account'}
        </h1>

        {email && detectedUserType && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Detected as:</strong> {detectedUserType.toUpperCase()}
              {detectedUserType === 'student' && ' 🎓'}
              {detectedUserType === 'employer' && ' 💼'}
              {detectedUserType === 'admin' && ' ⚙️'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              The system automatically detects your role based on your email domain.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={handleEmailChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          {!isLogin && (
            <>
              {detectedUserType === 'student' && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={registerData.name}
                    onChange={(e) => updateRegisterData('name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Major"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={registerData.major}
                    onChange={(e) => updateRegisterData('major', e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                </>
              )}

              {detectedUserType === 'employer' && (
                <>
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={registerData.company_name}
                    onChange={(e) => updateRegisterData('company_name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Industry"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={registerData.industry}
                    onChange={(e) => updateRegisterData('industry', e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                </>
              )}
            </>
          )}

          <button
            onClick={handleAuthSubmit}
            disabled={loading}
            className={`w-full p-2 rounded transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>

          <button
            onClick={handleRegisterRedirect}
            disabled={loading}
            className="w-full text-sm text-blue-600 underline mt-2 disabled:text-gray-400"
          >
            {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
