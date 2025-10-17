import DashboardLayout from "../../layouts/DashboardLayout";
import { useApplications } from "../../context/ApplicationContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function StudentJobs() {
  const [postedJobs, setPostedJobs] = useState([]);
  const { appliedJobs, applyToJob } = useApplications();

  useEffect(() => {
  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/internships");
      const data = await res.json();
      setPostedJobs(data); // assuming data is an array of jobs
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };
  fetchJobs();
}, []);

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-300">Browse Jobs</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {postedJobs.length === 0 ? (
          <p className="text-gray-600">No jobs available at the moment.</p>
        ) : (
          postedJobs.map((job) => {
            const applied = appliedJobs.some((j) => j.id === job.id);
            return (
              <div key={job.id} className="bg-white p-5 shadow-md border border-gray-200 rounded">
                <h3 className="text-lg font-bold text-blue-700">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                <p className="text-sm mt-1"><span className="font-medium">Type:</span> {job.type}</p>
                <p className="text-sm"><span className="font-medium">Deadline:</span> {job.deadline}</p>

                <button
                  disabled={applied}
                  onClick={() => {
                    if (!applied) {
                      applyToJob(job);
                      toast.success(`Applied for ${job.title}`);
                    } else {
                      toast.error("You’ve already applied");
                    }
                  }}
                  className={`mt-3 w-full py-1.5 rounded text-white font-medium ${
                    applied ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {applied ? "Applied" : "Apply"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}

export default StudentJobs;
