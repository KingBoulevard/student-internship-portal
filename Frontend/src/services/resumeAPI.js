import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // store token after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const resumeAPI = {
  getCurrentEmployer: async () => {
    try {
      const response = await axiosInstance.get("/employer/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching current employer:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },


  // Get the employer's job postings
  getEmployerJobPostings: async (employerId) => {
    try {
      if (!employerId) throw new Error("Missing employerId in getEmployerJobPostings");
      const response = await axiosInstance.get(`/employers/job-postings?employer_id=${encodeURIComponent(employerId)}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch job postings:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Create new job posting
  createJobPosting: async (jobData) => {
    try {
      const response = await axiosInstance.post("/employers/job-postings", jobData);
      return response.data;
    } catch (error) {
      console.error("Failed to create job posting:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Delete job posting
  deleteJobPosting: async (jobId) => {
    try {
      const response = await axiosInstance.delete(`/employers/job-postings/${encodeURIComponent(jobId)}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete job posting:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Get applications for a job
  getJobApplications: async (jobId) => {
    try {
      const response = await axiosInstance.get(`/employers/job-applications/${encodeURIComponent(jobId)}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Analyze resumes
  analyzeResume: async (formData) => {
    try {
      const response = await axiosInstance.post("/employers/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to analyze resume:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
};
