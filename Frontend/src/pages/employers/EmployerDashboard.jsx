import { Routes, Route } from "react-router-dom";
import PostJob from "../employers/PostJob";
import PostedJobs from "../employers/PostedJobs";

function EmployerDashboard() {
  const handlePost = (job) => {
    // Store job in localStorage
    const existing = localStorage.getItem("employerJobs");
    const parsed = existing ? JSON.parse(existing) : [];
    const updated = [job, ...parsed];
    localStorage.setItem("employerJobs", JSON.stringify(updated));
  };

  return (
    <Routes>
      <Route path="/" element={<PostJob onPost={handlePost} />} />
      <Route path="/jobs" element={<PostedJobs />} />
    </Routes>
  );
}

export default EmployerDashboard;
