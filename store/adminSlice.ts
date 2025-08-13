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

const initialState = {
  admin: null as Admin | null,
  token: null as string | null,
  isAuthenticated: false,
};

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
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
      const response = await api().post<LoginResponse>("/admin/login", data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const { setAdmin, setToken, logout } = adminSlice.actions;

export default adminSlice.reducer;
