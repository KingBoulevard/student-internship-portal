import DashboardLayout from "../layouts/DashboardLayout";

function StudentDashboard() {
  return (
    <DashboardLayout>
      <section>
        <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
        <p className="text-gray-700">This is where students will view summaries of job posts, application status, and more.</p>
      </section>
    </DashboardLayout>
  );
}

// In Login.js - temporary development helper
{localStorage.getItem('token') && (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
    <p className="text-sm text-red-800">
      You're already logged in as {JSON.parse(localStorage.getItem('user'))?.email}
    </p>
    <button 
      onClick={() => {
        localStorage.clear();
        window.location.reload();
      }}
      className="text-xs bg-red-500 text-white px-2 py-1 rounded mt-2"
    >
      Clear Login & Refresh
    </button>
  </div>
)}

export default StudentDashboard;
