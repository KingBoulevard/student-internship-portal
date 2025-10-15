import { useState } from "react";
import EmployerLayout from "../../layouts/EmployerLayout";
import toast from "react-hot-toast";

function PostJob() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Internship",
    deadline: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newJob = { id: Date.now(), ...formData };
    const existing = JSON.parse(localStorage.getItem("employerJobs")) || [];
    localStorage.setItem("employerJobs", JSON.stringify([newJob, ...existing]));

    setFormData({ title: "", company: "", location: "", type: "Internship", deadline: "" });
    toast.success("Job posted successfully!");
  };

  return (
    <EmployerLayout>
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-300">Post a Job</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-md border border-gray-200 rounded grid gap-4 md:grid-cols-2"
      >
        <input name="title" placeholder="Job Title" required value={formData.title} onChange={handleChange} className="border p-2 rounded" />
        <input name="company" placeholder="Company" required value={formData.company} onChange={handleChange} className="border p-2 rounded" />
        <input name="location" placeholder="Location" required value={formData.location} onChange={handleChange} className="border p-2 rounded" />
        <select name="type" value={formData.type} onChange={handleChange} className="border p-2 rounded">
          <option value="Internship">Internship</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>
        <input name="deadline" type="date" required value={formData.deadline} onChange={handleChange} className="border p-2 rounded" />

        <button className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded">
          Post Job
        </button>
      </form>
    </EmployerLayout>
  );
}

export default PostJob;
