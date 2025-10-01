import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { SystemResult } from "../model/system.interface";

interface SystemState {
  systems: SystemResult[];
  loading: boolean;
  error: string | null;
}

const initialState: SystemState = {
  systems: [],
  loading: false,
  error: null,
};

export const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    setSystems: (state, action) => {
      state.systems = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllSystems.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllSystems.fulfilled, (state, action) => {
      state.loading = false;
      state.systems = action.payload.data;
    });
    builder.addCase(getAllSystems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to get systems";
    });
  },
});

// Get all systems
export const getAllSystems = createAsyncThunk(
  "system/getAllSystems",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get("/system/admin/all-systems", {
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

export interface SystemPayload {
  system_name: string;
  system_description: string;
  status: string;
  plant_id: number;
  organization_id: number;
  department_id: number;
}

// Create system
export const createSystem = createAsyncThunk(
  "system/createSystem",
  async (system: SystemPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post("/system/admin/create-system", system, {
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

export interface UpdateSystemPayload extends SystemPayload {
  system_id: number;
}

// Update system
export const updateSystem = createAsyncThunk(
  "system/updateSystem",
  async (system: UpdateSystemPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().put(
        `/system/admin/update-system/${system.system_id}`,
        system,
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

// Get system by id
export const getSystemById = createAsyncThunk(
  "system/getSystemById",
  async (id: number, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get(`/system/admin/${id}`, {
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

export const { setSystems, setLoading, setError } = systemSlice.actions;
export default systemSlice.reducer;