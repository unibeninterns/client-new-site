// Updated api.ts with reviewer and researcher endpoints
import axios from "axios";

// Configure base API settings
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
        const refreshResponse = await api.post("/auth/refresh-token");

        if (refreshResponse.data.accessToken) {
          // Save the new token
          localStorage.setItem("accessToken", refreshResponse.data.accessToken);

          // Update the original request with the new token
          originalRequest.headers["Authorization"] =
            `Bearer ${refreshResponse.data.accessToken}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");

        // Only redirect if we're in the browser
        if (typeof window !== "undefined") {
          // Redirect based on the stored user role
          const userData = localStorage.getItem("userData");
          let redirectPath = "/admin/login"; // Default

          if (userData) {
            try {
              const user = JSON.parse(userData);
              if (user.role === "reviewer") {
                redirectPath = "/reviewers/login";
              } else if (user.role === "researcher") {
                redirectPath = "/researchers/login";
              }
            } catch (e) {
              console.error("Error parsing user data:", e);
            }
          }

          window.location.href = redirectPath;
        }
      }
    }

    return Promise.reject(error);
  }
);

// Faculty related endpoints
export const getFaculties = async () => {
  try {
    const response = await api.get("/faculties");
    return response.data;
  } catch (error) {
    console.error("Error fetching faculties:", error);
    throw error;
  }
};

export const getDepartments = async () => {
  try {
    const response = await api.get("/departments");
    return response.data;
  } catch (error) {
    console.error("Error fetching faculties:", error);
    throw error;
  }
};

export const getDepartmentsByFaculty = async (facultyCode: string) => {
  try {
    const response = await api.get(
      `/departments/by-faculty-code/${facultyCode}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching departments for faculty ${facultyCode}:`,
      error
    );
    throw error;
  }
};

// Submission endpoints
export const submitStaffProposal = async (formData: FormData) => {
  try {
    const response = await api.post("/submit/staff-proposal", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting staff proposal:", error);
    throw error;
  }
};

export const submitMasterProposal = async (formData: FormData) => {
  try {
    const response = await api.post("/submit/master-proposal", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting master proposal:", error);
    throw error;
  }
};

// Get user proposals by email
export const getUserProposalsByEmail = async (email: string) => {
  try {
    const response = await api.get(`/submit/proposals/email/${email}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user proposals:", error);
    throw error;
  }
};

// Authentication endpoints
export const loginAdmin = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post("/auth/admin-login", credentials);

    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      api.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.accessToken}`;
    }

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// Reviewer authentication
export const loginReviewer = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post("/reviewer/login", credentials);

    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      api.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.accessToken}`;
    }

    return response.data;
  } catch (error) {
    console.error("Reviewer login failed:", error);
    throw error;
  }
};

// Researcher authentication
export const loginResearcher = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post("/researcher/login", credentials);

    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      api.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.accessToken}`;
    }

    return response.data;
  } catch (error) {
    console.error("Researcher login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
  }
};

export const verifyToken = async () => {
  try {
    const response = await api.get("/auth/verify-token");
    return response.data;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
};

// Admin endpoints
export const getProposals = async (params = {}) => {
  try {
    const response = await api.get("/admin/proposals", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching proposals:", error);
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

export const updateProposalStatus = async (
  id: string,
  data: { status: string; comment?: string }
) => {
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
    const response = await api.get("/admin/statistics");
    return response.data;
  } catch (error) {
    console.error("Error fetching proposal statistics:", error);
    throw error;
  }
};

// Reviewer endpoints
export const getReviewerDashboard = async () => {
  try {
    const response = await api.get("/reviewer/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching reviewer dashboard:", error);
    throw error;
  }
};

export const getReviewerAssignments = async () => {
  try {
    const response = await api.get("/reviewsys/assignments");
    return response.data;
  } catch (error) {
    console.error("Error fetching reviewer assignments:", error);
    throw error;
  }
};

export const getReviewerStatistics = async () => {
  try {
    const response = await api.get("/reviewsys/statistics");
    return response.data;
  } catch (error) {
    console.error("Error fetching reviewer statistics:", error);
    throw error;
  }
};

export const getReviewById = async (reviewId: string) => {
  try {
    const response = await api.get(`/reviewsys/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching review with ID ${reviewId}:`, error);
    throw error;
  }
};

export const getProposalForReview = async (proposalId: string) => {
  try {
    const response = await api.get(`/reviewsys/proposal/${proposalId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching proposal for review with ID ${proposalId}:`,
      error
    );
    throw error;
  }
};

export const submitReview = async (reviewId: string, reviewData: any) => {
  try {
    const response = await api.post(
      `/reviewsys/${reviewId}/submit`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

export const saveReviewProgress = async (
  reviewId: string,
  progressData: any
) => {
  try {
    const response = await api.patch(
      `/reviewsys/${reviewId}/save-progress`,
      progressData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving review progress:", error);
    throw error;
  }
};

// Researcher endpoints
export const getResearcherDashboard = async () => {
  try {
    const response = await api.get("/researcher/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching researcher dashboard:", error);
    throw error;
  }
};

export const getResearcherProposalDetails = async (proposalId: string) => {
  try {
    const response = await api.get(`/researcher/proposals/${proposalId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching researcher proposal details with ID ${proposalId}:`,
      error
    );
    throw error;
  }
};

export default api;
