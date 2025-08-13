import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";

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
  message?: string;
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
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
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

export const { setAdmin, setToken, logout, clearError, setLoading } =
  adminSlice.actions;

export default adminSlice.reducer;
