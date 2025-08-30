import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import { jwtDecode } from "jwt-decode";
import type { AdminUsersResponse } from "../model/admin-users.interface";

interface Admin {
  id: string;
  email: string;
  name?: string;
  role?: string;
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
      sessionStorage.clear();
      localStorage.clear();
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    checkAuthStatus: (state) => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const admin = sessionStorage.getItem("admin");

        if (token && admin) {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            state.admin = null;
            state.token = null;
            state.isAuthenticated = false;
            sessionStorage.clear();
            localStorage.clear();
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
        sessionStorage.clear();
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
        sessionStorage.setItem("LAST_LOGIN", new Date().toLocaleString());
        sessionStorage.setItem("accessToken", response.data.token);
        const decodedToken = jwtDecode(response.data.token);
        sessionStorage.setItem("admin", JSON.stringify(decodedToken));
        thunkAPI.dispatch(setAdmin(decodedToken));
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
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
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
