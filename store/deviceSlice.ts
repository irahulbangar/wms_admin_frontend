import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  DeviceReporting,
  DeviceResponse,
  DeviceResult,
} from "../model/devices.interface";
import { handleApiError } from "../src/utils/errorHandler";
import type { DataSyncResponse } from "../model/data-sync.interface";

interface DeviceState {
  devices: DeviceResult[];
  loading: boolean;
  error: string | null;
  status: number;
  success: boolean;
}

const initialState: DeviceState = {
  devices: [],
  loading: false,
  error: null,
  status: 0,
  success: false,
};

export const deviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    setDevices: (state, action) => {
      state.devices = action.payload;
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
  // extraReducers: (builder) => {
  //   builder.addCase(getAllDevices.pending, (state) => {
  //     state.loading = true;
  //   });
  //   builder.addCase(getAllDevices.fulfilled, (state, action) => {
  //     state.loading = false;
  //     state.devices = action.payload.data;
  //     state.status = action.payload.status;
  //     state.success = action.payload.success;
  //   });
  //   builder.addCase(getAllDevices.rejected, (state, action) => {
  //     state.loading = false;
  //     state.error = action.error.message || "Failed to fetch devices";
  //     state.status = 0;
  //     state.success = false;
  //   });
  // },
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
  device_reporting: DeviceReporting | null;
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
// export const getAllDevices = createAsyncThunk(
//   "device/getAllDevices",
//   async (_, thunkAPI) => {
//     const { rejectWithValue } = thunkAPI;
//     try {
//       const response = await api().get<DeviceResponse>(
//         "/device/admin/all-devices",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );
//       return response.data;
//     } catch (error: unknown) {
//       const apiError = handleApiError(error);
//       return rejectWithValue(apiError);
//     }
//   }
// );

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

interface GetDeviceByOrganizationIdPlantIdDepartmentIdAndSystemId {
  organizationId: number;
  plantId: number;
  departmentId: number;
  systemId: number;
}

// Get device by organizationId and plantId
export const getDeviceByOrganizationIdPlantIdDepartmentIdAndSystemId =
  createAsyncThunk(
    "device/getDeviceByOrganizationIdPlantIdDepartmentIdAndSystemId",
    async (
      {
        organizationId,
        plantId,
        departmentId,
        systemId,
      }: GetDeviceByOrganizationIdPlantIdDepartmentIdAndSystemId,
      thunkAPI
    ) => {
      const { rejectWithValue } = thunkAPI;
      try {
        const response = await api().get<DeviceResponse>(
          `/device/admin/organization-plant-department-system/${organizationId}/${plantId}/${departmentId}/${systemId}`,
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

// get device by systemId
export const getDeviceBySystemId = createAsyncThunk(
  "device/getDeviceBySystemId",
  async (systemId: number, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<DeviceResponse>(
        `/device/admin/device-system/${systemId}`,
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
      const response = await api().delete<DeviceResponse>(
        `/device/admin/delete-device/${id}`,
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

interface DataSyncForFMDevicesPayload {
  device_id: number;
  year: string;
  month: string;
  data: object;
}

// data sync for FM devices
export const dataSyncForFMDevices = createAsyncThunk(
  "device/dataSyncForFMDevices",
  async (
    { device_id, year, month, data }: DataSyncForFMDevicesPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post<DataSyncResponse>(
        `/fm/device/fm-new-data-sync/${device_id}`,
        {
          year,
          month,
          data,
        },
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

interface DataSyncForBRWHMSDevicesPayload {
  device_id: number;
  year: string;
  month: string;
  data: object;
}

// data sync for BRWHMS device
export const dataSyncForBRWHMSDevices = createAsyncThunk(
  "device/dataSyncForBRWHMSDevices",
  async (
    { device_id, year, month, data }: DataSyncForBRWHMSDevicesPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post<DataSyncResponse>(
        `/brwhms/device/brwhms-new-data-sync/${device_id}`,
        {
          year,
          month,
          data,
        },
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

interface DataSyncForBTLMDevicesPayload {
  device_id: number;
  year: string;
  month: string;
  data: object;
}

// data sync for BTLM devices
export const dataSyncForBTLMDevices = createAsyncThunk(
  "device/dataSyncForBTLMDevices",
  async (
    { device_id, year, month, data }: DataSyncForBTLMDevicesPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post<DataSyncResponse>(
        `/tank/device/tank-new-data-sync/${device_id}`,
        {
          year,
          month,
          data,
        },
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

interface DataSyncForPHMCDevicesPayload {
  device_id: number;
  year: string;
  month: string;
  data: object;
}

// data sync for PHMC devices
export const dataSyncForPHMCDevices = createAsyncThunk(
  "device/dataSyncForPHMCDevices",
  async (
    { device_id, year, month, data }: DataSyncForPHMCDevicesPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post<DataSyncResponse>(
        `/phmc/device/phmc-new-data-sync/${device_id}`,
        {
          year,
          month,
          data,
        },
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

interface GetFMRuntimeDataPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

// get FM runtime data
export const getFMRuntimeData = createAsyncThunk(
  "device/getFMRuntimeData",
  async ({ plantId, deviceId, date }: GetFMRuntimeDataPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/fm/admin/device/fm-runtime-data/${plantId}/${deviceId}`,
        {
          date,
        },
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

interface GetFMCustomReportDataPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

// get FM custom report data
export const getFMCustomReportData = createAsyncThunk(
  "device/getFMCustomReportData",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetFMCustomReportDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/fm/admin/device/fm-reports/${plantId}/${deviceId}`,
        {
          from_date,
          to_date,
          duration,
        },
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

export const { setDevices, setLoading, setError } = deviceSlice.actions;

export default deviceSlice.reducer;
