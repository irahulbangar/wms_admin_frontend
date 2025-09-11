import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import { jwtDecode } from "jwt-decode";
import type { AdminUsersResponse } from "../model/admin-users.interface";

// Extend JwtPayload to include custom properties
interface CustomJwtPayload {
  exp?: number;
  email?: string;
  name?: string;
  role?: string;
  contact_number?: string;
  status?: string;
  created_at?: string;
  location?: string;
}

interface Admin {
  id: string;
  email: string;
  name?: string;
  role?: string;
  contact_number?: string;
  status?: string;
  created_at?: string;
  location?: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
  message: string;
}

interface AdminState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.clear();
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    checkAuthStatus: (state) => {
      try {
        const token = localStorage.getItem("accessToken");
        const admin = localStorage.getItem("admin");

        if (token && admin) {
          const decodedToken = jwtDecode<CustomJwtPayload>(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            state.admin = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.clear();
            window.location.reload();
          } else {
            state.admin = JSON.parse(admin);
            state.token = token;
            state.isAuthenticated = true;
          }
        } else {
          state.admin = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.clear();
      }
    },
  },
});

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginAdmin = createAsyncThunk(
  "admin/loginAdmin",
  async (data: LoginPayload, thunkAPI) => {
    try {
      thunkAPI.dispatch(setLoading(true));
      const response = await api().post<LoginResponse>("/admin/login", data);
      if (response.data.success) {
        localStorage.setItem("LAST_LOGIN", new Date().toLocaleString());
        localStorage.setItem("accessToken", response.data.token);
        const decodedToken = jwtDecode<CustomJwtPayload>(response.data.token);
        const admin = {
          email: decodedToken.email,
          name: decodedToken.name,
          role: decodedToken.role,
          contact_number: decodedToken.contact_number,
          status: decodedToken.status,
        };
        localStorage.setItem("admin", JSON.stringify(admin));
        thunkAPI.dispatch(setAdmin(admin));
        thunkAPI.dispatch(setToken(response.data.token));
      }
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return thunkAPI.rejectWithValue(errorMessage);
    } finally {
      thunkAPI.dispatch(setLoading(false));
    }
  }
);

// get all users
export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<AdminUsersResponse>("/admin/all-users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const { setAdmin, setToken, logout, setLoading, checkAuthStatus } =
  adminSlice.actions;

export default adminSlice.reducer;
