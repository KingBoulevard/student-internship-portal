const API_BASE_URL = 'http://localhost:5000/api';

// Generic API call function with auth headers
export const apiCall = async (endpoint, options = {}) => {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
            ...options,
        });

        if (!response.ok) {
            // Handle unauthorized (token expired)
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userType');
                window.location.href = '/login';
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Auth API - Uses smart detection
export const authAPI = {
    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    register: (userData) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
    getProfile: () => apiCall('/auth/profile'),
    updateProfile: (profileData) => apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
    }),
    changePassword: (passwordData) => apiCall('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
    }),
    verifyToken: () => apiCall('/auth/verify'),
};

// Students API
export const studentAPI = {
    getAll: () => apiCall('/students'),
    getById: (id) => apiCall(`/students/${id}`),
    create: (studentData) => apiCall('/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
    }),
};

// Internships API
export const internshipAPI = {
    getAll: () => apiCall('/internships'),
    getById: (id) => apiCall(`/internships/${id}`),
    create: (internshipData) => apiCall('/internships', {
        method: 'POST',
        body: JSON.stringify(internshipData),
    }),
};

// Employers API
export const employerAPI = {
    getAll: () => apiCall('/employers'),
    register: (employerData) => apiCall('/employers/register', {
        method: 'POST',
        body: JSON.stringify(employerData),
    }),
    login: (credentials) => apiCall('/employers/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    getProfile: () => apiCall('/employers/profile'),
    getMyInternships: () => apiCall('/employers/internships'),
    getMyApplications: () => apiCall('/employers/applications'),
};