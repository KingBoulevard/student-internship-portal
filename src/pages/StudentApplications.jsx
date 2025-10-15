import DashboardLayout from "../layouts/DashboardLayout";
import { useApplications } from "../context/ApplicationContext";

function Applications() {
  const { appliedJobs } = useApplications();

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-300">Your Applications</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {appliedJobs.length === 0 ? (
          <p className="text-gray-600">You haven’t applied to any jobs yet.</p>
        ) : (
          appliedJobs.map((job) => (
            <div key={job.id} className="bg-white p-5 shadow-md border border-gray-200 rounded">
              <h3 className="text-lg font-bold text-green-700">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
              <p className="text-sm mt-1"><span className="font-medium">Type:</span> {job.type}</p>
              <p className="text-sm"><span className="font-medium">Deadline:</span> {job.deadline}</p>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

export default Applications;
