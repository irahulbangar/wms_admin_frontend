import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  DeviceTypeResponse,
  DeviceTypeResult,
} from "../model/device-type.interface";

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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get device types";
      return rejectWithValue(errorMessage);
    }
  }
);

// Create device type
export const createDeviceType = createAsyncThunk(
  "deviceType/createDeviceType",
  async (
    deviceType: {
      device_family_id: number;
      device_type_name: string;
      topic: string;
    },
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        "/device-type/admin/create-type",
        deviceType,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create device type";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update device type
export const updateDeviceType = createAsyncThunk(
  "deviceType/updateDeviceType",
  async (
    data: {
      device_type_id: number;
      device_family_id: number;
      device_type_name: string;
      topic: string;
    },
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().put(
        `/device-type/admin/update-device-type/${data.device_type_id}`,
        {
          device_family_id: data.device_family_id,
          device_type_name: data.device_type_name,
          topic: data.topic,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update device type";
      return rejectWithValue(errorMessage);
    }
  }
);

export const { setDeviceTypes, setLoading, setError } = deviceTypeSlice.actions;

export default deviceTypeSlice.reducer;
