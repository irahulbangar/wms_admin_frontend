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
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
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

export const { setDeviceFamilies, setLoading, setError } =
  deviceFamilySlice.actions;

export default deviceFamilySlice.reducer;
