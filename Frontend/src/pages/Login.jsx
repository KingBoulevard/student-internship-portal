import { useState, useRef, useEffect } from "react";
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

  // Clear any existing corrupted data on component mount
  useEffect(() => {
    console.log('Login component mounted');
    setEmail("");
    setPassword("");
    setRegisterData({
      name: "",
      company_name: "",
      major: "",
      industry: ""
    });
  }, []);

  // Smart user type detection based on email
  const detectUserType = (email) => {
    if (!email || !email.includes('@')) return 'employer';
    
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

  // 🎯 Refs to prevent rapid state updates
  const lastEmailUpdate = useRef(0);
  const lastPasswordUpdate = useRef(0);

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

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);

    try {
      console.log('Starting authentication process...');
      let response;
      
      if (isLogin) {
        console.log('Attempting login for:', email);
        response = await authAPI.login({ email, password });
      } else {
        const userType = detectUserType(email);
        const userData = { email, password };
        
        if (userType === 'student') {
          if (!registerData.name || !registerData.major) {
            toast.error("Please fill in all required fields for student registration.");
            setLoading(false);
            return;
          }
          userData.name = registerData.name;
          userData.major = registerData.major;
        } else if (userType === 'employer') {
          if (!registerData.company_name || !registerData.industry) {
            toast.error("Please fill in all required fields for employer registration.");
            setLoading(false);
            return;
          }
          userData.company_name = registerData.company_name;
          userData.industry = registerData.industry;
        }
        
        console.log('Attempting registration for:', email, 'as', userType);
        response = await authAPI.register(userData);
      }

      console.log('Authentication response:', response);

      if (isLogin) {
        if (!response.token || !response.user) {
          throw new Error('Invalid response from server');
        }

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userType', response.userType);
        
        toast.success(`Welcome back, ${response.user.name || response.user.company_name || response.user.email}!`);
        
        console.log('Login successful, redirecting to:', response.userType);
        
        setTimeout(() => {
          switch (response.userType) {
            case 'student':
              navigate("/students");
              break;
            case 'employer':
              navigate("/employers");
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
          const employerRegistrationData = {
            email: email,
            company_name: registerData.company_name,
            industry: registerData.industry,
            userId: response.id || response.userId,
            token: response.token
          };
          
          localStorage.setItem('employerRegistrationData', JSON.stringify(employerRegistrationData));
          localStorage.setItem("authToken", response.data.token);

          
          toast.success("Account created! Please complete your company profile.");
          
          setTimeout(() => {
            navigate("/employer/additional-details");
          }, 1500);
          
        } else {
          toast.success(`Registration successful! You can now login.`);
          setIsLogin(true);
          setRegisterData({ name: "", company_name: "", major: "", industry: "" });
          setEmail("");
          setPassword("");
        }
      }

    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = error.message || "Authentication failed. Please try again.";
      toast.error(errorMessage);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
    } finally {
      setLoading(false);
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
      handleLogin();
    }
  };

  const detectedUserType = email ? detectUserType(email) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left Side - Branding & Information */}
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8">
          <div className="space-y-6">
            <div className="flex justify-center lg:justify-start items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Internship Portal</h1>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Launch Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Career Journey</span> Today
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl">
              Connect with amazing opportunities and build your future with our centralised internship platform for Computer Science students and tech companies.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Smart Matching</h3>
                <p className="text-sm text-gray-400">AI-powered resume analysis for perfect internship matches</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Direct Connections</h3>
                <p className="text-sm text-gray-400">Connect directly with top tech companies in Zambia</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Career Growth</h3>
                <p className="text-sm text-gray-400">Track your progress and build your professional profile</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Secure Platform</h3>
                <p className="text-sm text-gray-400">Your data is protected with enterprise-grade security</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">80+</div>
              <div className="text-sm text-gray-400">Active Internships</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">120+</div>
              <div className="text-sm text-gray-400">Students Placed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm text-gray-400">Partner Companies</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Join Our Community'}
              </h1>
              <p className="text-gray-300">
                {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
              </p>
            </div>

            {/* User Type Indicator */}
            {email && detectedUserType && (
              <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-2xl">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    detectedUserType === 'student' ? 'bg-blue-500/20 text-blue-300' :
                    detectedUserType === 'employer' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {detectedUserType === 'student' && '🎓'}
                    {detectedUserType === 'employer' && '💼'}
                    {detectedUserType === 'admin' && '⚙️'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {detectedUserType.charAt(0).toUpperCase() + detectedUserType.slice(1)} Account
                    </p>
                    <p className="text-xs text-gray-400">Based on your email domain</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-5">
              {/* Email Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
              </div>

              {/* Registration Fields */}
              {!isLogin && (
                <div className="space-y-4 border-t border-white/10 pt-4">
                  {detectedUserType === 'student' && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                          value={registerData.name}
                          onChange={(e) => updateRegisterData('name', e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={loading}
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Major/Field of Study"
                          className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                          value={registerData.major}
                          onChange={(e) => updateRegisterData('major', e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}
                  
                  {detectedUserType === 'employer' && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Company Name"
                          className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                          value={registerData.company_name}
                          onChange={(e) => updateRegisterData('company_name', e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={loading}
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Industry"
                          className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                          value={registerData.industry}
                          onChange={(e) => updateRegisterData('industry', e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                  loading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In to Your Account' : 'Create Your Account'
                )}
              </button>

              {/* Toggle Link */}
              <div className="text-center pt-4 border-t border-white/10">
                <button
                  onClick={handleRegisterRedirect}
                  disabled={loading}
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200 disabled:text-gray-500"
                >
                  {isLogin ? (
                    <>
                      New to our platform? <span className="font-semibold text-blue-400">Create an account</span>
                    </>
                  ) : (
                    <>
                      Already have an account? <span className="font-semibold text-blue-400">Sign in here</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                By continuing, you agree to our <span className="text-blue-400 cursor-pointer">Terms of Service</span> and <span className="text-blue-400 cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Login;