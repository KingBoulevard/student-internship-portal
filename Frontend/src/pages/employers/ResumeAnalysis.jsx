import { useState, useEffect } from 'react';
import EmployerLayout from '../../layouts/EmployerLayout';
import toast from 'react-hot-toast';

function ResumeAnalysis({ jobsKey = "employerJobs", applicationsKey = "jobApplications" }) {
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load job postings from localStorage
  useEffect(() => {
    const storedJobs = localStorage.getItem(jobsKey);
    setJobPostings(storedJobs ? JSON.parse(storedJobs) : []);
  }, [jobsKey]);

  // Load applications for selected job from localStorage
  useEffect(() => {
    if (!selectedJob) return;
    const storedApps = localStorage.getItem(applicationsKey);
    const jobApps = storedApps ? JSON.parse(storedApps)[selectedJob] || [] : [];
    setApplications(jobApps);
    setSelectedApplications([]);
    setAnalysisResult(null);
  }, [selectedJob, applicationsKey]);

  const handleJobSelect = (jobId) => setSelectedJob(jobId);

  const handleApplicationSelect = (appId) => {
    setSelectedApplications(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleSelectAllApplications = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.id));
    }
  };

  const analyzeSelectedApplications = () => {
    if (selectedApplications.length === 0) {
      toast.error('Please select at least one application to analyze');
      return;
    }

    setLoading(true);
    const results = applications
      .filter(app => selectedApplications.includes(app.id))
      .map(app => ({
        ...app,
        score: Math.floor(Math.random() * 101), // Random score for demo
        match_percentage: Math.floor(Math.random() * 101),
        analysis: {
          skills_found: Math.floor(Math.random() * 10),
          matched_skills: app.skills || [],
          missing_skills: [],
          recommendations: ['Improve resume formatting', 'Highlight key skills']
        }
      }));

    results.sort((a, b) => b.score - a.score);

    setAnalysisResult({
      results,
      total_analyzed: results.length,
      top_candidate: results[0],
      errors: 0,
      job_title: jobPostings.find(job => job.id === selectedJob)?.title || "Selected Job"
    });

    toast.success(`Analyzed ${results.length} applications successfully!`);
    setLoading(false);
  };

  // Results component
  const AnalysisResults = ({ analysisResult }) => {
    if (!analysisResult) return null;

    return (
      <div className="mt-8 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            Analysis Results for "{analysisResult.job_title}"
          </h3>
          {analysisResult.top_candidate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">🏆 Top Candidate</h4>
              <p><strong>Name:</strong> {analysisResult.top_candidate.name}</p>
              <p><strong>Score:</strong> {analysisResult.top_candidate.score}/100</p>
              <p><strong>Match:</strong> {analysisResult.top_candidate.match_percentage}%</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <EmployerLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Resume Analysis</h1>

        {/* Job Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Job
          </label>
          <select
            value={selectedJob}
            onChange={(e) => handleJobSelect(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a job posting...</option>
            {jobPostings.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} ({applications.length} applications)
              </option>
            ))}
          </select>
        </div>

        {/* Applications Selection */}
        {selectedJob && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleSelectAllApplications}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {selectedApplications.length === applications.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-gray-500">{selectedApplications.length} selected</span>
            </div>

            {applications.length === 0 ? (
              <p className="text-gray-500">No applications found for this job.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map(app => (
                      <tr key={app.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(app.id)}
                            onChange={() => handleApplicationSelect(app.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={analyzeSelectedApplications}
              disabled={loading || selectedApplications.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Analyzing...' : `Analyze ${selectedApplications.length} Selected Applications`}
            </button>
          </div>
        )}

        <AnalysisResults analysisResult={analysisResult} />
      </div>
    </EmployerLayout>
  );
}

export default ResumeAnalysis;
