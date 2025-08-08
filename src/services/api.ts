// Updated api.ts with reviewer and researcher endpoints
import axios from "axios";

// Configure base API settings
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v2";

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
    let token = null;
    const currentPath = window.location.pathname;

    if (currentPath.startsWith("/admin")) {
      token = localStorage.getItem("adminAccessToken");
    } else if (currentPath.startsWith("/reviewers")) {
      token = localStorage.getItem("reviewerAccessToken");
    } else if (currentPath.startsWith("/researchers")) {
      token = localStorage.getItem("researcherAccessToken");
    } else {
      // Fallback for other paths or if no specific role path is matched
      token = localStorage.getItem("accessToken");
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
// Fixed response interceptor in api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if this is a login endpoint - don't attempt refresh for login failures
    const isLoginEndpoint =
      originalRequest.url?.includes("/auth/") &&
      (originalRequest.url.includes("-login") ||
        originalRequest.url.includes("/login"));

    // Only attempt token refresh for 401s that are NOT from login endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginEndpoint
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await api.post("/auth/refresh-token");

        if (refreshResponse.data.accessToken) {
          // Save the new token based on the current path/role context
          const currentPath = window.location.pathname;
          if (currentPath.startsWith("/admin")) {
            localStorage.setItem(
              "adminAccessToken",
              refreshResponse.data.accessToken
            );
          } else if (currentPath.startsWith("/reviewers")) {
            localStorage.setItem(
              "reviewerAccessToken",
              refreshResponse.data.accessToken
            );
          } else if (currentPath.startsWith("/researchers")) {
            localStorage.setItem(
              "researcherAccessToken",
              refreshResponse.data.accessToken
            );
          } else {
            localStorage.setItem(
              "accessToken",
              refreshResponse.data.accessToken
            );
          }

          // Update the original request with the new token
          originalRequest.headers["Authorization"] =
            `Bearer ${refreshResponse.data.accessToken}`;

          // Retry the original request
          return api(originalRequest);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (refreshError: any) {
        // If refresh fails, redirect to login
        console.error("Token refresh failed:", refreshError);
        // Clear all potential tokens on refresh failure
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("reviewerAccessToken");
        localStorage.removeItem("researcherAccessToken");
        localStorage.removeItem("accessToken"); // Fallback
        localStorage.removeItem("userData"); // Assuming userData is generic

        // Only redirect if we're in the browser
        if (typeof window !== "undefined") {
          // Redirect based on the stored user role
          const currentPath = window.location.pathname;
          let redirectPath = "/admin/login"; // Default

          if (currentPath.startsWith("/reviewers")) {
            redirectPath = "/reviewers/login";
          } else if (currentPath.startsWith("/researchers")) {
            redirectPath = "/researchers/login";
          }

          window.location.href = redirectPath;
        }
      }
    }

    if (axios.isCancel(error)) {
      // console.log('Request cancelled (expected)');
      return Promise.reject(error); // Re-throw the error so calling code can handle it if needed
    }

    return Promise.reject(error);
  }
);

// Authentication endpoints
export const loginAdmin = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post("/auth/admin-login", credentials);

    if (response.data.accessToken) {
      localStorage.setItem("adminAccessToken", response.data.accessToken);
      // No need to set api.defaults.headers.common["Authorization"] here
      // as the interceptor will handle it based on the path.
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
    const response = await api.post("/auth/reviewer-login", credentials);

    if (response.data.accessToken) {
      localStorage.setItem("reviewerAccessToken", response.data.accessToken);
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
    const response = await api.post("/auth/researcher-login", credentials);

    if (response.data.accessToken) {
      localStorage.setItem("researcherAccessToken", response.data.accessToken);
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
    // Clear all potential tokens on logout
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("reviewerAccessToken");
    localStorage.removeItem("researcherAccessToken");
    localStorage.removeItem("accessToken"); // Fallback
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

export default api;
