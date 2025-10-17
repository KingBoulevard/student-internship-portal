import DashboardLayout from "../../layouts/DashboardLayout";
import { useApplications } from "../../context/ApplicationContext";
import { useState } from "react";
import toast from "react-hot-toast";

function Applications() {
  const { appliedJobs, setAppliedJobs } = useApplications();
  const [loadingIds, setLoadingIds] = useState([]);

  // Function to send an application to the backend
  const applyToJob = async (job) => {
    if (loadingIds.includes(job.id)) return;

    setLoadingIds((prev) => [...prev, job.id]);
    try {
      const response = await fetch("/api/apply-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id })
      });

      if (!response.ok) throw new Error("Failed to submit application");

      const data = await response.json();
      toast.success(`Applied to ${job.title} successfully!`);

      // Update context so UI reflects the newly applied job
      setAppliedJobs((prev) => [...prev, data.appliedJob]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply for the job.");
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== job.id));
    }
  };

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

              {/* Apply button if the job hasn't been applied yet */}
              {!appliedJobs.find((j) => j.id === job.id) && (
                <button
                  onClick={() => applyToJob(job)}
                  disabled={loadingIds.includes(job.id)}
                  className="mt-3 px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingIds.includes(job.id) ? "Applying..." : "Apply"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

export default Applications;
