import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import { jwtDecode } from "jwt-decode";
import type { AdminUsersResponse } from "../model/admin-users.interface";
import type { SingleAdminResponse } from "../model/single-admin.interface";
import { handleApiError } from "../src/utils/errorHandler";

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
  department?: string;
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
  department?: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
  message: string;
  status: number;
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

      if (response.data.success || response.data.status === 200) {
        localStorage.setItem("LAST_LOGIN", new Date().toLocaleString());
        localStorage.setItem("accessToken", response.data.token);

        const decodedToken = jwtDecode<CustomJwtPayload>(response.data.token);
        const admin = {
          email: decodedToken.email,
          name: decodedToken.name,
          role: decodedToken.role,
          contact_number: decodedToken.contact_number,
          status: decodedToken.status,
          created_at: decodedToken.created_at,
          location: decodedToken.location,
          department: decodedToken.department,
        };

        localStorage.setItem("admin", JSON.stringify(admin));
        thunkAPI.dispatch(setAdmin(admin));
        thunkAPI.dispatch(setToken(response.data.token));
      }

      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
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
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// Interface for creating admin user
export interface CreateAdminPayload {
  name: string;
  email: string;
  contact_number: string;
  location: string;
  department: string;
  role: string;
  password: string;
  status: string;
}

export interface AdminResponse {
  success: boolean;
  admin: CreateAdminPayload;
  message: string;
}

// Add admin user
export const addAdminUser = createAsyncThunk(
  "admin/addAdminUser",
  async (data: CreateAdminPayload, thunkAPI) => {
    try {
      const response = await api().post<AdminResponse>(
        "/admin/register",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

export interface UpdateAdminProfilePayload extends CreateAdminPayload {
  id: string;
}

// update admin profile
export const updateAdminProfile = createAsyncThunk(
  "admin/update-profile",
  async (data: UpdateAdminProfilePayload, thunkAPI) => {
    try {
      const response = await api().put<AdminResponse>(
        `/admin/update-profile/${data.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// get admin by id
export const getAdminById = createAsyncThunk(
  "admin/getAdminById",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().get<SingleAdminResponse>(
        `/admin/get-profile/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// delete admin user
export const deleteAdminUser = createAsyncThunk(
  "admin/deleteAdminUser",
  async (admin_id: string, thunkAPI) => {
    try {
      const response = await api().delete<SingleAdminResponse>(
        `/admin/delete-admin/${admin_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

export const { setAdmin, setToken, logout, setLoading, checkAuthStatus } =
  adminSlice.actions;

export default adminSlice.reducer;
