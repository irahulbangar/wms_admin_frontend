import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import { DeviceResponse } from "../model/devices.interface";
import { DeviceFamilyResponse } from "../model/device-family.interface";
import { DeviceTypeResponse } from "../model/device-type.interface";

export const deviceSlice = createSlice({
  name: "device",
  initialState: {
    devices: [],
    loading: false,
    error: null,
  },
  reducers: {
    setDevices: (state, action) => {
      state.devices = action.payload;
    },
  },
});

interface CreateDevicePayload {
  device_name: string;
  device_status: string;
  imei: string;
  project_id: number;
  device_type: string;
  deviceFId: number;
}

interface UpdateDevicePayload extends CreateDevicePayload {
  id: number;
}

// Create device
export const createDevice = createAsyncThunk(
  "device/createDevice",
  async (device: CreateDevicePayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post("/devices/create-device", device, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create device";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get device
export const getDevices = createAsyncThunk(
  "device/getDevices",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceResponse>("/devices/all-devices", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get devices";
      return rejectWithValue(errorMessage);
    }
  }
);

// get device by id
export const getDeviceById = createAsyncThunk(
  "device/getDeviceById",
  async (id: number, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceResponse>(`/devices/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get device by id";
      return rejectWithValue(errorMessage);
    }
  }
);

// update device
export const updateDevice = createAsyncThunk(
  "device/updateDevice",
  async (device: UpdateDevicePayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().put(`/devices/${device.id}`, device, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update device";
      return rejectWithValue(errorMessage);
    }
  }
);

// get device by project id
export const getDeviceByProjectId = createAsyncThunk(
  "device/getDeviceByProjectId",
  async (projectId: number, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceResponse>(
        `/devices/device-by-projectId/${projectId}`,
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
          : "Failed to get device by project id";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get device by family wise
export const getDeviceByFamilyWise = createAsyncThunk(
  "device/getDeviceByFamilyWise",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceFamilyResponse>(
        `/devices/allDeviceFamilies`,
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
          : "Failed to get device by family wise";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get devices by device type
export const getDevicesByDeviceType = createAsyncThunk(
  "device/getDevicesByDeviceType",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceTypeResponse>(
        `/devices/allDeviceTypes`,
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
          : "Failed to get devices by device type";
      return rejectWithValue(errorMessage);
    }
  }
);
