import { useEffect, useState } from "react";
import EmployerLayout from "../../layouts/EmployerLayout";
import { resumeAPI } from "../../services/resumeAPI";
import toast from "react-hot-toast";

function PostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  const fetchEmployerJobs = async () => {
    try {
      setLoading(true);

      // Fetch current employer from backend
      const employerRes = await resumeAPI.getCurrentEmployer();
      if (!employerRes.success || !employerRes.employer) {
        throw new Error("Please log in as an employer to view your jobs");
      }

      const employerId = employerRes.employer.id;

      // Fetch jobs for this employer
      const result = await resumeAPI.getEmployerJobPostings(employerId);

      if (result.success) {
        setJobs(result.jobPostings || []);
      } else {
        throw new Error(result.error || "Failed to fetch jobs from server");
      }
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
      toast.error(error.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await resumeAPI.deleteJobPosting(jobId);
        setJobs(jobs.filter(job => job.id !== jobId));
        toast.success("Job deleted successfully");
      } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job");
      }
    }
  };

  const handleViewApplications = (jobId) => {
    toast.success(`Viewing applications for job ${jobId}`);
    // Implement navigation later
  };

  const handleAnalyzeResumes = (jobId) => {
    toast.success(`Analyzing resumes for job ${jobId}`);
    // Implement navigation later
  };

  if (loading) {
    return (
      <EmployerLayout>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-300">My Posted Jobs</h2>
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-600">Loading jobs...</div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-300">My Posted Jobs</h2>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">You haven't posted any jobs yet.</p>
          <a 
            href="/employers/post-job" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded inline-block transition duration-200"
          >
            Post Your First Job
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 shadow-md border border-gray-200 rounded-lg hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-700 mb-2">{job.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p><span className="font-medium">Company:</span> {job.company}</p>
                    <p><span className="font-medium">Location:</span> {job.location}</p>
                    <p><span className="font-medium">Type:</span> {job.type}</p>
                    <p><span className="font-medium">Deadline:</span> {new Date(job.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                  >
                    {selectedJob?.id === job.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {job.applications_count || 0} Applications
                </span>
              </div>

              {selectedJob?.id === job.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border animate-fade-in">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Job Description</h4>
                      <p className="text-gray-700 text-sm whitespace-pre-line">{job.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Requirements</h4>
                      <p className="text-gray-700 text-sm whitespace-pre-line">{job.requirements}</p>
                    </div>
                    {job.required_skills && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.split(',').map((skill, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleViewApplications(job.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                      >
                        View Applications
                      </button>
                      <button
                        onClick={() => handleAnalyzeResumes(job.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                      >
                        Analyze Resumes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </EmployerLayout>
  );
}

export default PostedJobs;
