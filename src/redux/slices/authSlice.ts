import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: number;
  avatar?: string;
  role?: "user" | "admin" | "superAdmin" | string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAdmin: false,
};

// Async thunk for login
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (payload: { email?: string; phone?: string; password: string }, { rejectWithValue }) => {
    try {
      console.log("SignIn payload:", payload);
      
      // Determine if input is email or phone
      const loginPayload = payload.email ? 
        { login: payload.email, password: payload.password } :
        { login: payload.phone, password: payload.password };
      
      const response = await api.post("/auth/login", loginPayload);
      const data = response.data;
      console.log("SignIn response:", data);

      // Validate role for admin dashboard
      const user = data.user;
      const allowedRoles = ["admin", "superAdmin", "clubAdmin"];
      
      if (!allowedRoles.includes(user?.role)) {
        console.error("Unauthorized: User does not have admin access");
        return rejectWithValue("You don't have permission to access the admin dashboard");
      }

      // Save token to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      return data; // { token, user }
    } catch (err: any) {
      console.error("SignIn exception:", err);
      const message = err.response?.data?.message || "Something went wrong";
      return rejectWithValue(message);
    }
  }
);

// Async thunk for updating profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload: Partial<User>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      console.log("Sending update profile payload:", payload);
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        const value = payload[key as keyof User];
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await api.put("/users/profile", formData);
      const data = response.data;
      console.log("Update profile response:", data);

      if (data.user) {
        // Update localStorage with new user data
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      } else {
        return rejectWithValue("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Update profile exception:", err);
      const message = err.response?.data?.message || err.message || "Failed to update profile";
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAdmin = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    restoreAuth: (state) => {
      // Restore auth from localStorage on app load
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.token = token;
          state.user = user;
          state.isAdmin = ["admin", "superAdmin", "clubAdmin"].includes(user.role);
        } catch (err) {
          console.error("Failed to restore auth:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAdmin = ["admin", "superAdmin", "clubAdmin"].includes(
          action.payload.user?.role
        );
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, restoreAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;
