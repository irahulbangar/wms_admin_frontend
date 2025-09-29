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
  department_name: string;
  department_info: string;
  plant_id: number;
}

// Create department
export const createDepartment = createAsyncThunk(
  "department/createDepartment",
  async (department: DepartmentPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        "/department/admin/create-department",
        department,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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
        "/department/admin/all-departments",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error);
    }
  }
);

// Update department
export const updateDepartment = createAsyncThunk(
  "department/updateDepartment",
  async (
    department: DepartmentPayload & { department_id: number },
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().put(
        `/department/admin/update-department/${department.department_id}`,
        department,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error);
    }
  }
);

// Get department by id
export const getDepartmentById = createAsyncThunk(
  "department/getDepartmentById",
  async (department_id: number, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get(`/department/admin/${department_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error);
    }
  }
);

// GET department by plant id
export const getDepartmentByPlantId = createAsyncThunk(
  "department/getDepartmentByPlantId",
  async (plant_id: number, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get(
        `/department/admin/department-plant/${plant_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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

export default departmentSlice.reducer;
