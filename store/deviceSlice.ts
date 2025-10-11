import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { DeviceResponse, DeviceResult } from "../model/devices.interface";
import { handleApiError } from "../src/utils/errorHandler";

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
  device_type_id: number;
  device_family_id: number;
  visibility: string;
  report_type_id: number;
  organization_connection: string;
  device_flow_direction: string;
  params: object;
  organization_id: number;
  system_id: number | null;
  in_system_id: number | null;
  out_system_id: number | null;
  in_department_id: number | null;
  out_department_id: number | null;
  in_plant_id: number | null;
  out_plant_id: number | null;
  plant_id: number | null;
  department_id: number | null;
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
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
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
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
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
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
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
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

// get device by plant id
export const getDeviceByPlantId = createAsyncThunk(
  "device/getDeviceByPlantId",
  async (plantId: number, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceResponse>(
        `/device/admin/device-plant/${plantId}`,
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

interface GetPlantByOrganizationId {
  organizationId: number;
  plantId: number;
  departmentId: number;
}

// Get device by organizationId and plantId
export const getDeviceByOrganizationIdAndPlantIdAndDepartmentId = createAsyncThunk(
  "device/getDeviceByOrganizationIdAndPlantIdAndDepartmentId",
  async (
    { organizationId, plantId, departmentId }: GetPlantByOrganizationId,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceResponse>(
        `/device/admin/organization-plant-department/${organizationId}/${plantId}/${departmentId}`,
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
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

export const { setDevices, setLoading, setError } = deviceSlice.actions;

export default deviceSlice.reducer;
