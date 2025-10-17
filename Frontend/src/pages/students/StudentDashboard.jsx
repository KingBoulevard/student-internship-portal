import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { internshipAPI, apiCall } from "../../services/api";
import { Link } from "react-router-dom";

function StudentDashboard() {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [internshipData, applicationData] = await Promise.all([
          internshipAPI.getAll(),
          apiCall("/applications")
        ]);
        
        setInternships(internshipData || []);
        setApplications(applicationData || []);
        
        // Load profile data
        const savedProfile = localStorage.getItem('studentProfile');
        if (savedProfile) {
          setStudentProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalApplications = applications.length;
  const shortlistedCount = applications.filter(a => 
    a.status === "Shortlisted" || a.status === "Accepted"
  ).length;
  const pendingCount = applications.filter(a => a.status === "Pending").length;

  const monthlyGoals = { applications: 10, shortlisted: 3 };
  const applicationProgress = Math.min((totalApplications / monthlyGoals.applications) * 100, 100);
  const shortlistedProgress = Math.min((shortlistedCount / monthlyGoals.shortlisted) * 100, 100);
  const recentApplications = applications.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-3">
              Welcome back, {studentProfile.name || "Student"}! 👋
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track your internship applications and discover new opportunities tailored for you.
            </p>
          </div>

          {/* Key Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Applications Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-4">
                <CircularProgress percentage={applicationProgress} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{totalApplications}</h3>
              <p className="text-gray-300 font-medium">Total Applications</p>
              <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${applicationProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-green-400 font-medium mt-2">
                {applicationProgress >= 100 ? 'Goal achieved! 🎉' : 'Keep going!'}
              </p>
            </div>

            {/* Shortlisted Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-4">
                <CircularProgress percentage={shortlistedProgress} color="blue" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{shortlistedCount}</h3>
              <p className="text-gray-300 font-medium">Shortlisted</p>
              <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${shortlistedProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-400 font-medium mt-2">
                {shortlistedProgress >= 100 ? 'Excellent! 🌟' : 'Making progress!'}
              </p>
            </div>

            {/* Pending Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-4">
                <CircularProgress percentage={Math.min((pendingCount / 5) * 100, 100)} color="yellow" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{pendingCount}</h3>
              <p className="text-gray-300 font-medium">Pending Review</p>
              <p className="text-sm text-amber-400 font-medium mt-4">
                {pendingCount > 0 ? 'Awaiting responses' : 'All caught up!'}
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Applications */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Recent Applications</h2>
                  <p className="text-gray-300 mt-1">Your latest internship applications</p>
                </div>
                <Link
                  to="/students/applications"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  View All
                </Link>
              </div>
              
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg group-hover:text-blue-300 transition-colors duration-200">
                            {app.title || app.job_title}
                          </h3>
                          <p className="text-gray-300 text-sm mt-1">{app.company_name || app.company}</p>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm text-gray-400">
                        <span>
                          Applied: {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'N/A'}
                        </span>
                        <Link
                          to={`/students/jobs/${app.job_id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No applications yet</h3>
                  <p className="text-gray-400 mb-6">Start your journey by applying to internships.</p>
                  <Link
                    to="/students/jobs"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Browse Internships
                  </Link>
                </div>
              )}
            </div>

            {/* Available Internships */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Available Internships</h2>
                  <p className="text-gray-300 mt-1">New opportunities for you</p>
                </div>
                <Link
                  to="/students/jobs"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Browse All
                </Link>
              </div>
              
              {internships.length > 0 ? (
                <div className="space-y-4">
                  {internships.slice(0, 4).map((job) => (
                    <div key={job.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 group">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white text-lg group-hover:text-blue-300 transition-colors duration-200">
                          {job.title}
                        </h3>
                        {job.match_score && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            job.match_score >= 80 ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                            job.match_score >= 50 ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" :
                            "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}>
                            {job.match_score}% match
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-3 font-medium">{job.company_name || job.company}</p>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {job.description || "No description available."}
                      </p>
                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                          {job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : 'Rolling basis'}
                        </span>
                        <Link
                          to={`/students/jobs/${job.id}`}
                          className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors duration-200"
                        >
                          Apply Now →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No internships available</h3>
                  <p className="text-gray-400">New opportunities coming soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-400">{internships.length}</p>
                <p className="text-gray-300 text-sm">Total Internships</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{shortlistedCount}</p>
                <p className="text-gray-300 text-sm">Successful Applications</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
                <p className="text-gray-300 text-sm">Under Review</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {totalApplications > 0 ? Math.round((shortlistedCount / totalApplications) * 100) : 0}%
                </p>
                <p className="text-gray-300 text-sm">Success Rate</p>
              </div>
            </div>
          </div>

          {/* Motivational Section */}
          <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-500/30 p-6 text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Keep Up the Great Work!</h3>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Every application brings you closer to your dream internship. Stay consistent and you'll find the perfect opportunity!
            </p>
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
    </DashboardLayout>
  );
}

// Enhanced Circular Progress Component
function CircularProgress({ percentage, color = "green" }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    green: "text-green-500",
    blue: "text-blue-500", 
    yellow: "text-amber-500",
    red: "text-red-500"
  };

  return (
    <div className="w-20 h-20 relative">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-white/20 stroke-current"
          strokeWidth="8"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        <circle
          className={`${colorClasses[color]} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

// Enhanced Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    Accepted: {
      color: "bg-green-500/20 text-green-300 border-green-500/30",
      icon: "✓"
    },
    Shortlisted: {
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      icon: "⭐"
    },
    Pending: {
      color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      icon: "⏳"
    },
    Rejected: {
      color: "bg-red-500/20 text-red-300 border-red-500/30",
      icon: "✗"
    }
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {status}
    </span>
  );
}

export default StudentDashboard;