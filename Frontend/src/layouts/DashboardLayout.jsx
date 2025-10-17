
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Get student profile for name display
  const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
  const displayName = studentProfile.name || user.name || 'Student';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('studentProfile');
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-gray-800">Internship Portal</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <Link
                  to="/students"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/students')}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg className="mr-4 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/students/jobs"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/students/jobs')}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg className="mr-4 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Jobs
                </Link>
                <Link
                  to="/students/applications"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/students/applications')}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg className="mr-4 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Applications
                </Link>
                <Link
                  to="/students/profile"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/students/profile')}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg className="mr-4 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-medium">
                      {displayName?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{displayName}</p>
                  <p className="text-xs font-medium text-gray-500">Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Internship Portal
              </h1>
            </div>
            <nav className="mt-8 flex-1 px-4 space-y-2">
              <Link
                to="/students"
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/students')}`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/students/jobs"
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/students/jobs')}`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Jobs
              </Link>
              <Link
                to="/students/applications"
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/students/applications')}`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Applications
              </Link>
              <Link
                to="/students/profile"
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/students/profile')}`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-medium">
                    {displayName?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{displayName}</p>
                <p className="text-xs font-medium text-gray-500">Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex"></div>
            <div className="ml-4 flex items-center lg:ml-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 hidden sm:block">
                  Welcome back, <span className="font-semibold text-blue-600">{displayName}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
