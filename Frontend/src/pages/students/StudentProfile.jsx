import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Link } from "react-router-dom";

function StudentProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    university: "University of Zambia",
    major: "Computer Science",
    year: "Final Year",
    skills: ["JavaScript", "React", "Node.js"],
    bio: "How would you best describe yourself?."
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      // Initialize with user data if available
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setProfile(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, []);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...profile.skills];
    newSkills[index] = value;
    setProfile(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const addSkill = () => {
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, ""]
    }));
  };

  const removeSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const saveProfile = () => {
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    setSaveMessage("Profile saved successfully!");
    setIsEditing(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const cancelEdit = () => {
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    setIsEditing(false);
    setSaveMessage("");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/students" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-200 group">
              <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-2">Manage your personal and academic information</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={saveProfile}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {saveMessage && (
              <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                {saveMessage}
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Profile Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6 sticky top-6">
                {/* Profile Picture */}
                <div className="text-center mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg mx-auto mb-4">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{profile.name || "Student"}</h2>
                  <p className="text-gray-600">{profile.major}</p>
                  <p className="text-gray-500 text-sm">{profile.university}</p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Profile Completion</h3>
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-xs text-blue-700">85% Complete</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h3 className="text-sm font-semibold text-green-900 mb-1">Account Status</h3>
                    <p className="text-xs text-green-700">Active ✓</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Editable Fields */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 gap-6">
                {/* Personal Information */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-lg bg-gray-50 px-4 py-3 rounded-xl">{profile.name || "Not set"}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="Enter your email"
                        />
                      ) : (
                        <p className="text-gray-600 text-lg bg-gray-50 px-4 py-3 rounded-xl">{profile.email || "Not set"}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <p className="text-gray-600 text-lg bg-gray-50 px-4 py-3 rounded-xl">{profile.phone || "Not set"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.university}
                          onChange={(e) => handleProfileChange('university', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-lg bg-gray-50 px-4 py-3 rounded-xl">{profile.university}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Major/Program</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.major}
                          onChange={(e) => handleProfileChange('major', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-lg bg-gray-50 px-4 py-3 rounded-xl">{profile.major}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                      {isEditing ? (
                        <select
                          value={profile.year}
                          onChange={(e) => handleProfileChange('year', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          <option value="First Year">First Year</option>
                          <option value="Second Year">Second Year</option>
                          <option value="Third Year">Third Year</option>
                          <option value="Final Year">Final Year</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 font-medium text-lg bg-gray-50 px-4 py-3 rounded-xl">{profile.year}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6">
                  <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Skills & Technologies</h3>
                    {isEditing && (
                      <button
                        onClick={addSkill}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Skill
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      {profile.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => handleSkillChange(index, e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                            placeholder="Enter a skill (e.g., Data Analysis, Web Development, Pandas)"
                          />
                          <button
                            onClick={() => removeSkill(index)}
                            className="text-red-500 hover:text-red-700 p-2 transition-colors duration-200 bg-red-50 hover:bg-red-100 rounded-lg"
                            title="Remove skill"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">About Me</h3>
                  {isEditing ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                      placeholder="Tell employers about yourself, your interests, career goals, and what you're passionate about..."
                    />
                  ) : (
                    <p className="text-gray-700 text-lg leading-relaxed bg-gray-50 px-4 py-3 rounded-xl">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudentProfile;