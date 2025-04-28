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

// Department related endpoints
export const getDepartmentsByFaculty = async (facultyId: string) => {
  try {
    const response = await api.get(`/departments/by-faculty/${facultyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching departments for faculty ${facultyId}:`, error);
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

export default api;