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

export default StudentDashboard;
