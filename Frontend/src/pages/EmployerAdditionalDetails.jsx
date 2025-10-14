import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

function EmployerAdditionalDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    company_size: "",
    website: "",
    description: "",
    contact_person: "",
    phone: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [employerData, setEmployerData] = useState(null);

  useEffect(() => {
    // Check if we have employer data (you might want to use context or localStorage)
    const storedData = localStorage.getItem('tempEmployerData');
    if (storedData) {
      setEmployerData(JSON.parse(storedData));
    } else {
      // If no data, redirect back to registration
      toast.error("Please complete registration first");
      navigate("/login");
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.contact_person || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Update employer profile with additional details
      const updateData = {
        company_size: formData.company_size,
        website: formData.website,
        description: formData.description,
        contact_person: formData.contact_person,
        phone: formData.phone
      };

      // Call your API to update employer profile
      await authAPI.updateProfile(updateData);
      
      toast.success("Company profile completed successfully!");
      
      // Clear temporary data
      localStorage.removeItem('tempEmployerData');
      
      // Redirect to employer dashboard
      setTimeout(() => {
        navigate("/EmployerDashboard");
      }, 1500);

    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow skipping for now
    toast.success("You can update these details later in your profile");
    localStorage.removeItem('tempEmployerData');
    navigate("/EmployerDashboard");
  };

  if (!employerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Complete Your Company Profile
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Tell us more about {employerData.company_name}
            </p>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                value={formData.company_size}
                onChange={(e) => handleInputChange('company_size', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Full name of main contact"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="+260 XXX XXX XXX"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description
              </label>
              <textarea
                placeholder="Brief description of your company..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Skip for Now
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.contact_person || !formData.phone}
                className={`flex-1 py-3 px-4 rounded-md text-white transition-colors ${
                  loading || !formData.contact_person || !formData.phone
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployerAdditionalDetails;