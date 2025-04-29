import axios from 'axios';

// Configure base API settings
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await api.post('/auth/admin-login', credentials);
    
    // Store token in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      // Update axios headers for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
    }
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  delete api.defaults.headers.common['Authorization'];
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

export default api;