import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Create global axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - Add auth token from localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    console.log("🔍 API Request:", {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + "..." : "No token",
      dataType: config.data instanceof FormData ? "FormData" : typeof config.data,
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let browser handle it
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      method: response.config.method,
    });
    return response;
  },
  (error) => {
    console.log("❌ API Error Response:", {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || "";
      
      // Only auto-logout on authentication errors (invalid/expired token)
      // Don't logout on authorization errors (insufficient permissions)
      const isAuthenticationError = 
        errorMessage.toLowerCase().includes("token") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("authentication") ||
        !localStorage.getItem("token");
      
      if (isAuthenticationError) {
        console.warn("Authentication failed - clearing auth and redirecting");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to signin if not already there
        if (window.location.pathname !== "/auth/signin") {
          window.location.href = "/auth/signin";
        }
      } else {
        console.warn("Authorization failed - insufficient permissions");
      }
    }
    
    // Log other errors
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("No response from server:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export the configured instance for global use
export default api;
