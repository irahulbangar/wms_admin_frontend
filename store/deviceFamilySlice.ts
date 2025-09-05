import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  DeviceFamilyResponse,
  DeviceFamilyResult,
} from "../model/device-family.interface";

interface DeviceFamilyState {
  deviceFamilies: DeviceFamilyResult[];
  loading: boolean;
  error: string | null;
}

const initialState: DeviceFamilyState = {
  deviceFamilies: [],
  loading: false,
  error: null,
};

export const deviceFamilySlice = createSlice({
  name: "deviceFamily",
  initialState,
  reducers: {
    setDeviceFamilies: (state, action) => {
      state.deviceFamilies = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const getDeviceFamiliy = createAsyncThunk(
  "deviceFamily/getDeviceFamilies",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceFamilyResponse>(
        "/device-family/admin/all-device-family",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get device families";
      return rejectWithValue(errorMessage);
    }
  }
);

// Create device family
export const createDeviceFamily = createAsyncThunk(
  "deviceFamily/createDeviceFamily",
  async (deviceFamily: { name: string; type: string }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        "/device-family/admin/create-family",
        deviceFamily,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create device family";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update device family
export const updateDeviceFamily = createAsyncThunk(
  "deviceFamily/updateDeviceFamily",
  async (
    data: { device_family_id: number; name: string; type: string },
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().put(
        `/device-family/admin/update-family/${data.device_family_id}`,
        { name: data.name, type: data.type },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update device family";
      return rejectWithValue(errorMessage);
    }
  }
);

export const { setDeviceFamilies, setLoading, setError } =
  deviceFamilySlice.actions;

export default deviceFamilySlice.reducer;
