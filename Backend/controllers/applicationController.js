// controllers/applicationController.js

// Create a new application (student applies)
exports.createApplication = (req, res) => {
    res.json({ message: 'Application created!' });
};

// Update application status (for employer/admin)
exports.updateApplicationStatus = (req, res) => {
    res.json({ message: `Application ${req.params.id} status updated!` });
};

// Get applications by student ID
exports.getApplicationsByStudent = (req, res) => {
    res.json({ message: `Applications for student ${req.params.studentId}` });
};
