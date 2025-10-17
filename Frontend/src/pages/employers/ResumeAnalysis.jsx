import { useState, useEffect } from 'react';
import EmployerLayout from '../../layouts/EmployerLayout';
import { resumeAPI } from '../../services/resumeAPI';
import toast from 'react-hot-toast';

function ResumeAnalysis() {
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);

  // Fetch job postings from backend
  useEffect(() => {
    fetchJobPostings();
  }, []);

  // Fetch applications when job is selected
  useEffect(() => {
    if (selectedJob) {
      fetchApplications(selectedJob);
      fetchJobDetails(selectedJob);
    }
  }, [selectedJob]);

  const fetchJobPostings = async () => {
    try {
      // Replace with your actual API call to get employer's job postings
      const response = await fetch('/api/employer/job-postings');
      if (response.ok) {
        const data = await response.json();
        setJobPostings(data.jobPostings || []);
      }
    } catch {
      toast.error('Failed to fetch job postings');
    }
  };

  const fetchJobDetails = async (jobId) => {
    try {
      // Replace with your actual API call to get specific job details
      const response = await fetch(`/api/job-postings/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobDetails(data.job_posting);
      }
    } catch {
      toast.error('Failed to fetch job details');
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      // Replace with your actual API call to get applications for this job
      const response = await fetch(`/api/job-applications/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch {
      toast.error('Failed to fetch applications');
    }
  };

  const handleJobSelect = (jobId) => {
    setSelectedJob(jobId);
    setSelectedApplications([]);
    setAnalysisResult(null);
  };

  const handleApplicationSelect = (applicationId) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  const handleSelectAllApplications = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.application_id || app.id));
    }
  };

  const analyzeSelectedApplications = async () => {
    if (selectedApplications.length === 0) {
      toast.error('Please select at least one application to analyze');
      return;
    }

    if (!jobDetails) {
      toast.error('Job details not available');
      return;
    }

    setLoading(true);
    try {
      const selectedAppsData = applications.filter(app => 
        selectedApplications.includes(app.application_id || app.id)
      );

      const results = [];
      
      for (const application of selectedAppsData) {
        try {
          // Get resume file from application
          const resumeResponse = await fetch(`/api/applications/${application.application_id || application.id}/resume`);
          if (!resumeResponse.ok) {
            throw new Error('Failed to fetch resume');
          }

          const resumeBlob = await resumeResponse.blob();
          const resumeFile = new File([resumeBlob], `${application.student_name || application.student_id}_resume.pdf`, { 
            type: resumeBlob.type 
          });

          const formData = new FormData();
          formData.append('resume', resumeFile);
          
          // Send job data from backend
          formData.append('job_data', JSON.stringify({
            title: jobDetails.title,
            description: jobDetails.description,
            requirements: jobDetails.requirements,
            required_skills: jobDetails.required_skills || []
          }));

          // Send student data from application
          formData.append('student_data', JSON.stringify({
            student_id: application.student_id,
            student_name: application.student_name,
            skills: application.student_skills || [],
            profile_info: application.student_profile || {}
          }));

          const result = await resumeAPI.analyzeResume(formData);
          results.push({
            application_id: application.application_id || application.id,
            student_id: application.student_id,
            student_name: application.student_name,
            analysis: result.analysis,
            score: result.score,
            match_percentage: result.match_percentage,
            resume_data: result.analysis?.resume_data
          });
        } catch {
          results.push({
            application_id: application.application_id || application.id,
            student_id: application.student_id,
            student_name: application.student_name,
            error: 'Failed to analyze application',
            score: 0,
            match_percentage: 0
          });
        }
      }

      // Sort results by score and format for display
      const validResults = results.filter(r => !r.error);
      validResults.sort((a, b) => b.score - a.score);
      
      setAnalysisResult({
        results: validResults,
        total_analyzed: validResults.length,
        top_candidate: validResults[0] || null,
        errors: results.length - validResults.length,
        job_title: jobDetails.title
      });

      toast.success(`Analyzed ${validResults.length} applications successfully!`);
    } catch {
      toast.error('Failed to analyze applications');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAnalyze = async (application) => {
    if (!jobDetails) {
      toast.error('Job details not available');
      return;
    }

    setLoading(true);
    try {
      // Get resume file from application
      const resumeResponse = await fetch(`/api/applications/${application.application_id || application.id}/resume`);
      if (!resumeResponse.ok) {
        throw new Error('Failed to fetch resume');
      }

      const resumeBlob = await resumeResponse.blob();
      const resumeFile = new File([resumeBlob], `${application.student_name || application.student_id}_resume.pdf`, { 
        type: resumeBlob.type 
      });

      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      formData.append('job_data', JSON.stringify({
        title: jobDetails.title,
        description: jobDetails.description,
        requirements: jobDetails.requirements,
        required_skills: jobDetails.required_skills || []
      }));

      formData.append('student_data', JSON.stringify({
        student_id: application.student_id,
        student_name: application.student_name,
        skills: application.student_skills || [],
        profile_info: application.student_profile || {}
      }));

      const result = await resumeAPI.analyzeResume(formData);
      
      setAnalysisResult({
        results: [{
          application_id: application.application_id || application.id,
          student_id: application.student_id,
          student_name: application.student_name,
          analysis: result.analysis,
          score: result.score,
          match_percentage: result.match_percentage,
          resume_data: result.analysis?.resume_data
        }],
        total_analyzed: 1,
        top_candidate: {
          application_id: application.application_id || application.id,
          student_id: application.student_id,
          student_name: application.student_name,
          analysis: result.analysis,
          score: result.score,
          match_percentage: result.match_percentage
        },
        errors: 0,
        job_title: jobDetails.title
      });

      toast.success('Application analyzed successfully!');
    } catch {
      toast.error('Failed to analyze application');
    } finally {
      setLoading(false);
    }
  };

  // AnalysisResults Component
  const AnalysisResults = ({ analysisResult }) => {
    if (!analysisResult) return null;

    return (
      <div className="mt-8 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            Analysis Results for "{analysisResult.job_title}"
          </h3>
          
          {analysisResult.top_candidate && analysisResult.total_analyzed > 1 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">🏆 Top Candidate</h4>
              <p><strong>Name:</strong> {analysisResult.top_candidate.student_name}</p>
              <p><strong>Score:</strong> {analysisResult.top_candidate.score}/100</p>
              <p><strong>Match:</strong> {analysisResult.top_candidate.match_percentage}%</p>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills Found
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysisResult.results?.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {result.student_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.student_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        result.score >= 80 ? 'bg-green-100 text-green-800' :
                        result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.match_percentage}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.analysis?.skills_found || 0} skills
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.score >= 70 ? 'Strong Match' : 
                       result.score >= 50 ? 'Moderate Match' : 'Weak Match'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setAnalysisResult({
                            results: [result],
                            total_analyzed: 1,
                            top_candidate: result,
                            errors: 0,
                            job_title: analysisResult.job_title
                          });
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed View for Single Application */}
        {analysisResult.total_analyzed === 1 && analysisResult.results[0] && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              Detailed Analysis: {analysisResult.results[0].student_name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Overall Score</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {analysisResult.results[0].score}/100
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Match Percentage</h4>
                <p className="text-2xl font-bold text-green-600">
                  {analysisResult.results[0].match_percentage}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800">Skills Found</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {analysisResult.results[0].analysis?.skills_found || 0}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800">Matched Skills</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {analysisResult.results[0].analysis?.matched_skills_count || analysisResult.results[0].analysis?.matched_skills?.length || 0}
                </p>
              </div>
            </div>
            
            {/* Matched Skills */}
            {analysisResult.results[0].analysis?.matched_skills && analysisResult.results[0].analysis.matched_skills.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Matched Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.results[0].analysis.matched_skills.map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Missing Skills */}
            {analysisResult.results[0].analysis?.missing_skills && analysisResult.results[0].analysis.missing_skills.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.results[0].analysis.missing_skills.map((skill, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            {analysisResult.results[0].analysis?.recommendations && (
              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.results[0].analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <EmployerLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Resume Analysis</h1>

        {/* Job Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Job Posting</h2>
          <div className="space-y-4">
            <div>
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
                    {job.title} ({job.applications_count || 0} applications)
                  </option>
                ))}
              </select>
            </div>
            
            {jobDetails && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Job Details</h3>
                <p><strong>Title:</strong> {jobDetails.title}</p>
                <p><strong>Description:</strong> {jobDetails.description.substring(0, 100)}...</p>
                {jobDetails.requirements && (
                  <p><strong>Requirements:</strong> {jobDetails.requirements.substring(0, 100)}...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Applications Selection */}
        {selectedJob && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Select Applications to Analyze ({applications.length} total)
            </h2>
            
            {applications.length === 0 ? (
              <p className="text-gray-500">No applications found for this job.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSelectAllApplications}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {selectedApplications.length === applications.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedApplications.length} selected
                  </span>
                </div>
                
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((application, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedApplications.includes(application.application_id || application.id)}
                              onChange={() => handleApplicationSelect(application.application_id || application.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {application.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.student_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(application.applied_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleQuickAnalyze(application)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                            >
                              Quick Analyze
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button
                  onClick={analyzeSelectedApplications}
                  disabled={loading || selectedApplications.length === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Analyzing...' : `Analyze ${selectedApplications.length} Selected Applications`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Display Results */}
        <AnalysisResults analysisResult={analysisResult} />
      </div>
    </EmployerLayout>
  );
}

export default ResumeAnalysis;