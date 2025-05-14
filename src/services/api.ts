import axios from 'axios';

// Configure base API settings
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await api.post('/auth/refresh-token');
        
        if (refreshResponse.data.accessToken) {
          // Save the new token
          localStorage.setItem('accessToken', refreshResponse.data.accessToken);
          
          // Update the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        
        // Only redirect if we're in the browser
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Faculty related endpoints
export const getFaculties = async () => {
  try {
    const response = await api.get('/faculties');
    return response.data;
  } catch (error) {
    console.error('Error fetching faculties:', error);
    throw error;
  }
};

export const getDepartments = async () => {
  try {
    const response = await api.get('/departments');
    return response.data;
  } catch (error) {
    console.error('Error fetching faculties:', error);
    throw error;
  }
};

export const getDepartmentsByFaculty = async (facultyCode: string) => {
  try {
    const response = await api.get(`/departments/by-faculty-code/${facultyCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching departments for faculty ${facultyCode}:`, error);
    throw error;
  }
};

// Submission endpoints
export const submitStaffProposal = async (formData: FormData) => {
  try {
    const response = await api.post('/submit/staff-proposal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting staff proposal:', error);
    throw error;
  }
};

export const submitMasterProposal = async (formData: FormData) => {
  try {
    const response = await api.post('/submit/master-proposal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting master proposal:', error);
    throw error;
  }
};

// Get user proposals by email
export const getUserProposalsByEmail = async (email: string) => {
  try {
    const response = await api.get(`/submit/proposals/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user proposals:', error);
    throw error;
  }
};

// Authentication endpoints
export const loginAdmin = async (credentials: { email: string; password: string }) => {
  try {
    // Make sure axios is properly sending JSON content
    const response = await api.post('/auth/admin-login', credentials);
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
    }
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
  }
};

export const verifyToken = async () => {
  try {
    const response = await api.get('/auth/verify-token');
    return response.data;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
};

// Admin endpoints
export const getProposals = async (params = {}) => {
  try {
    const response = await api.get('/admin/proposals', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
};

export const getProposalById = async (id: string) => {
  try {
    const response = await api.get(`/admin/proposals/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching proposal with ID ${id}:`, error);
    throw error;
  }
};

export const updateProposalStatus = async (id: string, data: { status: string, comment?: string }) => {
  try {
    const response = await api.put(`/admin/proposals/${id}/status`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating proposal status:`, error);
    throw error;
  }
};

export const getProposalStatistics = async () => {
  try {
    const response = await api.get('/admin/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching proposal statistics:', error);
    throw error;
  }
};

export interface ProposalDecision {
  id: string;
  title: string;
  fieldOfResearch: string;
  totalScore: number;
  scores: {
    ai: number;
    reviewer1: number;
    reviewer2: number;
  };
  status: 'pending' | 'approved' | 'rejected';
}

export const getProposalsForDecision = async () => {
  const response = await api.get<{ data: ProposalDecision[] }>('/admin/proposals/decisions');
  return response.data;
};

export const notifyApplicants = async (proposalIds: string[]) => {
  const response = await api.post('/admin/proposals/notify', {
    proposalIds,
  });
  return response.data;
};

export const exportDecisionsReport = async () => {
  const response = await api.get('/admin/proposals/export', {
    responseType: 'blob',  // Important for file downloads
  });
  return response.data;
};

export default api;