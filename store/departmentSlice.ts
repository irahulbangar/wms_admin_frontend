import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { DepartmentResponse, DepartmentResult } from "../model/department.interface";

interface DepartmentState {
  departments: DepartmentResult[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
};

export const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    setDepartments: (state, action) => {
      state.departments = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllDepartments.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllDepartments.fulfilled, (state, action) => {
      state.loading = false;
      state.departments = action.payload.data;
    });
    builder.addCase(getAllDepartments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to get departments";
    });
  },
});

export interface DepartmentPayload {
  department_name: string;
  department_info: string;
  plant_id: number;
  organization_id: number;
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
export const getAllDepartments = createAsyncThunk(
  "department/getAllDepartments",
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

// Get department by organization id and plant id
export const getDepartmentByOrganizationIdAndPlantId = createAsyncThunk(
  "department/getDepartmentByOrganizationIdAndPlantId",
  async ({ organization_id, plant_id }: { organization_id: number; plant_id: number }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get(
        `/department/admin/department-organization/${organization_id}/${plant_id}`,
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

export const { setDepartments, setLoading, setError } = departmentSlice.actions;

export default departmentSlice.reducer;
