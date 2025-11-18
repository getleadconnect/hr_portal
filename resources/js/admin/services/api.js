import axios from 'axios';

// Get base URL from current location
const getBaseURL = () => {
    const path = window.location.pathname;
    // Extract base path (e.g., /AI/hr_portal/public or just /)
    const basePath = path.includes('/public')
        ? path.substring(0, path.indexOf('/public') + 7)
        : path.includes('/admin')
        ? path.substring(0, path.indexOf('/admin'))
        : '';
    return `${basePath}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default api;
