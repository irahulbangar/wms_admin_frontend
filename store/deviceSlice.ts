import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { DeviceResponse, DeviceResult } from "../model/devices.interface";

interface DeviceState {
  devices: DeviceResult[];
  loading: boolean;
  error: string | null;
}

const initialState: DeviceState = {
  devices: [],
  loading: false,
  error: null,
};

export const deviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    setDevices: (state, action) => {
      state.devices = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllDevices.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllDevices.fulfilled, (state, action) => {
      state.loading = false;
      state.devices = action.payload.data;
    });
    builder.addCase(getAllDevices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch devices";
    });
  },
});

export interface CreateDevicePayload {
  device_name: string;
  device_status: string;
  hwid: string;
  project_id: number;
  device_type_id: number;
  device_family_id: number;
  department_id: number;
  visibility: string;
  department_connection: string;
  project_connection: string;
  organization_connection: string;
  device_flow_direction: string;
  params: object;
  organization_id: number;
}

interface UpdateDevicePayload extends CreateDevicePayload {
  device_id: number;
}

// Create device
export const createDevice = createAsyncThunk(
  "device/createDevice",
  async (device: CreateDevicePayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post("/device/admin/create-device", device, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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
export const getAllDevices = createAsyncThunk(
  "device/getAllDevices",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceResponse>(
        "/device/admin/all-devices",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
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
      const response = await api().get(`/device/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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
  async ({ device_id, ...device }: UpdateDevicePayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().put(
        `/device/admin/update-device/${device_id}`,
        device,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
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
        `/device/admin/device-project/${projectId}`,
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
          : "Failed to get device by plant id";
      return rejectWithValue(errorMessage);
    }
  }
);

interface GetProjectByOrganizationId {
  projectId: number;
  organizationId: number;
}

// Get device by organizationId and projectId
export const getDeviceByOrganizationIdAndProjectId = createAsyncThunk(
  "device/getDeviceByOrganizationIdAndProjectId",
  async (
    { projectId, organizationId }: GetProjectByOrganizationId,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceResponse>(
        `/device/admin/project-organization/${projectId}/${organizationId}`,
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
          : "Failed to get device by organizationId and projectId";
      return rejectWithValue(errorMessage);
    }
  }
);

// delete device
export const deleteDevice = createAsyncThunk(
  "device/deleteDevice",
  async (id: string, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().delete(`/device/admin/delete-device/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete device";
      return rejectWithValue(errorMessage);
    }
  }
);

export const { setDevices, setLoading, setError } = deviceSlice.actions;

export default deviceSlice.reducer;
