import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { DepartmentResponse } from "../model/department.interface";

export const departmentSlice = createSlice({
  name: "department",
  initialState: {
    departments: [],
    loading: false,
    error: null,
  },
  reducers: {
    setDepartments: (state, action) => {
      state.departments = action.payload;
    },
  },
});

export interface DepartmentPayload {
  name: string;
  info: string;
}

// Create department
export const createDepartment = createAsyncThunk(
  "department/createDepartment",
  async (department: DepartmentPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        "/departments/create-department",
        department,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error);
    }
  }
);

// Get departments
export const getDepartments = createAsyncThunk(
  "department/getDepartments",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DepartmentResponse>(
        "/departments/all-departments",
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error);
    }
  }
);

export const { setDepartments } = departmentSlice.actions;
