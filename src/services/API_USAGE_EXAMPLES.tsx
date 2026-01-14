// Global API Instance Usage Examples
// Use this as reference for future Redux integrations

import api from "./api";
import { createAsyncThunk } from "@reduxjs/toolkit";

// ============================================
// EXAMPLE 1: Simple GET Request
// ============================================
export const fetchUserData = createAsyncThunk(
  "user/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  }
);

// ============================================
// EXAMPLE 2: POST Request (Create)
// ============================================
export const createMatch = createAsyncThunk(
  "matches/create",
  async (matchData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/matches", matchData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create");
    }
  }
);

// ============================================
// EXAMPLE 3: PUT Request (Update)
// ============================================
export const updateMatch = createAsyncThunk(
  "matches/update",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/matches/${id}`, data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update");
    }
  }
);

// ============================================
// EXAMPLE 4: DELETE Request
// ============================================
export const deleteMatch = createAsyncThunk(
  "matches/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/matches/${id}`);
      return id; // Return ID for local state cleanup
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete");
    }
  }
);

// ============================================
// EXAMPLE 5: Request with Headers
// ============================================
export const uploadFile = createAsyncThunk(
  "upload/file",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Upload failed");
    }
  }
);

// ============================================
// EXAMPLE 6: Request with Query Parameters
// ============================================
export const fetchMatches = createAsyncThunk(
  "matches/fetch",
  async (
    filters: { page?: number; limit?: number; status?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/matches", { params: filters });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  }
);

// ============================================
// KEY FEATURES OF GLOBAL API INSTANCE
// ============================================
// ✅ Automatically injects Bearer token from localStorage
// ✅ Handles 401 errors globally (redirects to signin)
// ✅ 10 second timeout on all requests
// ✅ Error logging in console for debugging
// ✅ Consistent error handling across all requests
// ✅ Works seamlessly with Redux async thunks

// ============================================
// ERROR HANDLING IN COMPONENTS
// ============================================
// In your component:
/*
const { data, loading, error } = useAppSelector(state => state.matches);
const dispatch = useAppDispatch();

// Fetch data
const handleFetch = async () => {
  const result = await dispatch(fetchMatches({ page: 1 }));
  if (result.type === fetchMatches.fulfilled.type) {
    console.log("Success:", result.payload);
  } else {
    console.log("Error:", result.payload);
  }
};

// Show loading/error states
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
*/

// ============================================
// TOKEN MANAGEMENT
// ============================================
// Token is automatically added to all requests via interceptor
// When user logs in: localStorage.setItem("token", data.token)
// When user logs out: localStorage.removeItem("token")
// When 401 received: api automatically clears token & redirects to signin

// ============================================
// USING IN DIFFERENT SCENARIOS
// ============================================

// Direct usage in components (if needed)
// import api from "@/services/api";
// const data = await api.get("/endpoint").then(r => r.data);

// With Redux (RECOMMENDED)
// Use createAsyncThunk pattern above, dispatch from component
// Automatically handles loading, error, and data states
