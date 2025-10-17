import { useState } from "react";
import EmployerLayout from "../../layouts/EmployerLayout";
import toast from "react-hot-toast";
import { resumeAPI } from "../../services/resumeAPI";

function PostJob() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Internship",
    deadline: "",
    description: "",
    requirements: "",
    required_skills: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Get employer ID from your authentication system
    let employerId = localStorage.getItem('employer_id');
    
    // If no employer ID is found, handle appropriately
    if (!employerId) {
      // Option 1: Redirect to login if not authenticated
      // window.location.href = '/employer-login';
      // return;
      
      // Option 2: Show error message
      // toast.error("Please log in as an employer to post jobs");
      // return;
      
      // Option 3: For testing only - use a valid employer ID from your database
      employerId = 1; // Replace with actual ID from your employers table
    }
    
    // Ensure employerId is a number
    employerId = parseInt(employerId);
    if (isNaN(employerId)) {
      toast.error("Invalid employer ID. Please log in again.");
      return;
    }

    const jobData = {
      title: formData.title,
      company: formData.company,
      location: formData.location,
      type: formData.type,
      deadline: formData.deadline,
      description: formData.description,
      requirements: formData.requirements,
      required_skills: formData.required_skills,
      employer_id: employerId  // Now this is a number, not a string
    };

    console.log('Posting job data:', jobData);

    // Use the resumeAPI service
    const result = await resumeAPI.createJobPosting(jobData);
    
    if (result.success) {
      // Store in localStorage for frontend consistency
      const newJob = { 
        id: result.job_id, 
        ...formData,
        applications_count: 0
      };
      const existing = JSON.parse(localStorage.getItem("employerJobs")) || [];
      localStorage.setItem("employerJobs", JSON.stringify([newJob, ...existing]));

      // Reset form
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "Internship",
        deadline: "",
        description: "",
        requirements: "",
        required_skills: ""
      });
      
      toast.success("Job posted successfully!");
      console.log('Job posted successfully:', result);
    } else {
      toast.error(result.error || "Failed to post job");
      console.error('Job posting failed:', result.error);
    }
  } catch (error) {
    console.error("Error posting job:", error);
    toast.error("Failed to post job. Please try again.");
  }
};

  return (
    <EmployerLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-300">Post a Job</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 shadow-md border border-gray-200 rounded grid gap-4"
        >
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input 
                name="title" 
                placeholder="e.g., Software Engineering Intern" 
                required 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input 
                name="company" 
                placeholder="Company Name" 
                required 
                value={formData.company} 
                onChange={handleChange} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input 
                name="location" 
                placeholder="e.g., Remote, New York, NY" 
                required 
                value={formData.location} 
                onChange={handleChange} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline *</label>
              <input 
                name="deadline" 
                type="date" 
                required 
                value={formData.deadline} 
                onChange={handleChange} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
            <textarea 
              name="description" 
              placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
              required 
              rows="4"
              value={formData.description} 
              onChange={handleChange} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Describe the day-to-day responsibilities and overall purpose of the role</p>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements *</label>
            <textarea 
              name="requirements" 
              placeholder="List the qualifications, experience, and education requirements..."
              required 
              rows="3"
              value={formData.requirements} 
              onChange={handleChange} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">What qualifications and experience are required for this position?</p>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
            <textarea 
              name="required_skills" 
              placeholder="List specific technical skills, programming languages, tools, or frameworks (comma-separated)..."
              rows="2"
              value={formData.required_skills} 
              onChange={handleChange} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Example: JavaScript, React, Python, SQL, AWS, Git</p>
          </div>

          <button 
            type="submit"
            className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded font-medium transition duration-200"
          >
            Post Job
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Tips for Better Candidate Matching</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Be specific in your job description to attract the right candidates</li>
            <li>• List clear requirements to help candidates self-assess their fit</li>
            <li>• Include relevant skills for better automated resume matching</li>
            <li>• The more detailed your posting, the better our AI can match applicants</li>
          </ul>
        </div>
      </div>
    </EmployerLayout>
  );
}

export default PostJob;