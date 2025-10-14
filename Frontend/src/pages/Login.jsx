import { useState } from "react";
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
  const [tempEmployerData, setTempEmployerData] = useState(null); // Store employer data temporarily
  const navigate = useNavigate();

  // Smart user type detection based on email
  const detectUserType = (email) => {
    const emailDomain = email.toLowerCase().split('@')[1];
    
    const studentDomains = [
      'unza.zm',
      'cs.unza.zm',
    ];
    
    const adminDomains = [
      'admin.university.edu',
      'it.university.edu',
      'careers.university.edu'
    ];
    
    if (studentDomains.some(domain => emailDomain === domain || emailDomain.endsWith('.' + domain))) {
      return 'student';
    }
    
    if (adminDomains.some(domain => emailDomain === domain)) {
      return 'admin';
    }
    
    return 'employer';
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (isLogin) {
        // Login with smart detection
        response = await authAPI.login({ email, password });
      } else {
        // Registration with smart detection
        const userType = detectUserType(email);
        const userData = { email, password };
        
        // Add type-specific fields
        if (userType === 'student') {
          userData.name = registerData.name;
          userData.major = registerData.major;
        } else if (userType === 'employer') {
          userData.company_name = registerData.company_name;
          userData.industry = registerData.industry;
        }
        
        response = await authAPI.register(userData);
      }

      if (isLogin) {
        // Store authentication data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userType', response.userType);
        
        toast.success(`Welcome back, ${response.user.name || response.user.company_name || response.user.email}!`);
        
        // Navigate based on detected user type
        setTimeout(() => {
          switch (response.userType) {
            case 'student':
              navigate("/student");
              break;
            case 'employer':
              navigate("/EmployerDashboard");
              break;
            case 'admin':
              navigate("/admin/dashboard");
              break;
            default:
              navigate("/");
          }
        }, 1200);
      } else {
        const userType = detectUserType(email);
        
        if (userType === 'employer') {
          // 🎯 NEW: Store temporary employer data and redirect to additional details
          setTempEmployerData({
            email: email,
            company_name: registerData.company_name,
            industry: registerData.industry,
            userId: response.id // From registration response
          });
          
          toast.success("Account created! Please complete your company profile.");
          
          // Navigate to additional details page instead of login
          setTimeout(() => {
            navigate("/employer/additional-details");
          }, 1500);
          
        } else {
          // For students/admins, show success and switch to login
          toast.success(`Registration successful! You can now login.`);
          setIsLogin(true);
          setRegisterData({ name: "", company_name: "", major: "", industry: "" });
        }
      }

    } catch (error) {
      toast.error(error.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    setIsLogin(!isLogin);
    setTempEmployerData(null); // Reset temp data when switching modes
  };

  const updateRegisterData = (field, value) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get detected user type for display
  const detectedUserType = email ? detectUserType(email) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login to Internship Portal' : 'Create Account'}
        </h1>

        {/* User Type Detection Info */}
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

          {/* Registration Fields */}
          {!isLogin && (
            <>
              {detectedUserType === 'student' && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={registerData.name}
                    onChange={(e) => updateRegisterData('name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Major"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={registerData.major}
                    onChange={(e) => updateRegisterData('major', e.target.value)}
                  />
                </>
              )}
              
              {detectedUserType === 'employer' && (
                <>
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={registerData.company_name}
                    onChange={(e) => updateRegisterData('company_name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Industry"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={registerData.industry}
                    onChange={(e) => updateRegisterData('industry', e.target.value)}
                  />
                </>
              )}
            </>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full p-2 rounded ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>

          <button
            onClick={handleRegisterRedirect}
            className="w-full text-sm text-blue-600 underline mt-2"
          >
            {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
          </button>
        </div>

        {/* Smart Detection Guide */}
        <div className="mt-6 p-4 bg-gray-50 rounded border">
          <h4 className="font-semibold text-sm mb-2">🎓 Smart User Detection</h4>
          <p className="text-xs text-gray-600 mb-1">
            <strong>Student emails:</strong> @unza.zm, @cs.unza.zm
          </p>
          <p className="text-xs text-gray-600 mb-1">
            <strong>Employer emails:</strong> Any other email domain
          </p>
          <p className="text-xs text-gray-500">
            No need to select role - the system detects it automatically!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;