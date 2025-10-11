import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  DeviceTypeResponse,
  DeviceTypeResult,
} from "../model/device-type.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface DeviceTypeState {
  deviceTypes: DeviceTypeResult[];
  loading: boolean;
  error: string | null;
}

const initialState: DeviceTypeState = {
  deviceTypes: [],
  loading: false,
  error: null,
};

export const deviceTypeSlice = createSlice({
  name: "deviceType",
  initialState,
  reducers: {
    setDeviceTypes: (state, action) => {
      state.deviceTypes = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const getDeviceTypes = createAsyncThunk(
  "deviceType/getDeviceTypes",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceTypeResponse>(
        "/device-type/admin/all-device-type",
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

export const { setDeviceTypes, setLoading, setError } = deviceTypeSlice.actions;

export default deviceTypeSlice.reducer;
