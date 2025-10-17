const API_BASE_URL = 'http://127.0.0.1:5000/api';

function throwIfNotOk(response) {
  if (!response.ok) {
    // try to read text for diagnostics
    return response.text().then(text => {
      const details = text || `${response.status} ${response.statusText}`;
      throw new Error(`HTTP error! status: ${response.status}, details: ${details}`);
    });
  }
  return response.json();
}

export const resumeAPI = {
  // Create new job posting
  async createJobPosting(jobData) {
    try {
      const url = `${API_BASE_URL}/employers/job-postings`; // consistent with other methods
      console.log('Posting to:', url);
      console.log('With data:', jobData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      return await throwIfNotOk(response);
    } catch (error) {
      console.error('Failed to create job posting:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  },

  // Get the employer's job postings
  async getEmployerJobPostings(employerId) {
    try {
      if (!employerId) throw new Error('Missing employerId in getEmployerJobPostings');
      const url = `${API_BASE_URL}/employers/job-postings?employer_id=${encodeURIComponent(employerId)}`;
      console.log('Fetching employer job postings from:', url);

      const response = await fetch(url);

      return await throwIfNotOk(response);
    } catch (error) {
      console.error('Failed to fetch job postings:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  },

  // Delete job posting from internships table
  async deleteJobPosting(jobId) {
    try {
      if (!jobId) throw new Error('Missing jobId in deleteJobPosting');
      const url = `${API_BASE_URL}/employers/job-postings/${encodeURIComponent(jobId)}`;
      console.log('Deleting job posting with URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await throwIfNotOk(response);
    } catch (error) {
      console.error('Failed to delete job posting:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  },

  // Get applications for a job
  async getJobApplications(jobId) {
    try {
      if (!jobId) throw new Error('Missing jobId in getJobApplications');
      const url = `${API_BASE_URL}/employers/job-applications/${encodeURIComponent(jobId)}`;
      console.log('Fetching job applications from:', url);

      const response = await fetch(url);
      return await throwIfNotOk(response);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  },

  // Get analyzed applications
  async getAnalyzedApplications(jobId) {
    try {
      if (!jobId) throw new Error('Missing jobId in getAnalyzedApplications');
      const url = `${API_BASE_URL}/employers/analyzed-applications/${encodeURIComponent(jobId)}`;
      console.log('Fetching analyzed applications from:', url);

      const response = await fetch(url);
      return await throwIfNotOk(response);
    } catch (error) {
      console.error('Failed to fetch analyzed applications:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  },

  // Process application analysis
  async processApplication(applicationId) {
    try {
      if (!applicationId) throw new Error('Missing applicationId in processApplication');
      const url = `${API_BASE_URL}/employers/process-application`;
      console.log('Processing application via:', url, 'payload:', { application_id: applicationId });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId }),
      });

      return await throwIfNotOk(response);
    } catch (error) {
      console.error('Failed to process application:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  },

  // Single resume analysis (for manual uploads)
  async analyzeResume(formData) {
    try {
      const url = `${API_BASE_URL}/employers/analyze-resume`;
      console.log('Uploading resume to:', url);

      const response = await fetch(url, {
        method: 'POST',
        body: formData, // let browser set Content-Type (multipart/form-data)
      });

      return await throwIfNotOk(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  }
};
