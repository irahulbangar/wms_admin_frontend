import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  DeviceFamilyResponse,
  DeviceFamilyResult,
} from "../model/device-family.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface DeviceFamilyState {
  deviceFamilies: DeviceFamilyResult[];
  loading: boolean;
  error: string | null;
  status: number;
  success: boolean;
}

const initialState: DeviceFamilyState = {
  deviceFamilies: [],
  loading: false,
  error: null,
  status: 0,
  success: false,
};

export const deviceFamilySlice = createSlice({
  name: "deviceFamily",
  initialState,
  reducers: {
    setDeviceFamilies: (state, action) => {
      state.deviceFamilies = action.payload;
      state.status = action.payload.status;
      state.success = action.payload.success;
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
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

export const { setDeviceFamilies, setLoading, setError } =
  deviceFamilySlice.actions;

export default deviceFamilySlice.reducer;
