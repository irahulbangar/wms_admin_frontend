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
  formula: string;
  compliance_limits: object;
  hide_data: boolean;
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

interface DataSyncForDWLRDevicesPayload {
  device_id: number;
  year: string;
  month: string;
  data: object;
}

// data sync for DWLR devices
export const dataSyncForDWLRDevices = createAsyncThunk(
  "device/dataSyncForDWLRDevices",
  async (
    { device_id, year, month, data }: DataSyncForDWLRDevicesPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post<DataSyncResponse>(
        `/dwlr/device/dwlr-new-data-sync/${device_id}`,
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

interface DataSyncForBDWFMSDevicesPayload {
  device_id: number;
  year: string;
  month: string;
  data: object;
}

// data sync for BDWFMS devices
export const dataSyncForBDWFMSDevices = createAsyncThunk(
  "device/dataSyncForBDWFMSDevices",
  async (
    { device_id, year, month, data }: DataSyncForBDWFMSDevicesPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post<DataSyncResponse>(
        `/bdwfms/device/bdwfms-new-data-sync/${device_id}`,
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
        `/fm/admin/device/fm-logs/${plantId}/${deviceId}`,
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

interface GetBRWHMSRuntimeDataPayload {
  plantId: number;
  deviceId: number;
  date: string;
}
// get BRWHMS runtime data
export const getBRWHMSRuntimeData = createAsyncThunk(
  "device/getBRWHMSRuntimeData",
  async (
    { plantId, deviceId, date }: GetBRWHMSRuntimeDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/brwhms/admin/device/brwhms-logs/${plantId}/${deviceId}`,
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

interface GetBRWHMSCustomReportDataPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

// get BRWHMS custom report data
export const getBRWHMSCustomReportData = createAsyncThunk(
  "device/getBRWHMSCustomReportData",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetBRWHMSCustomReportDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/brwhms/admin/device/brwhms-reports/${plantId}/${deviceId}`,
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

interface GetBTLMRuntimeDataPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

// get BTLM runtime data
export const getBTLMRuntimeData = createAsyncThunk(
  "device/getBTLMRuntimeData",
  async ({ plantId, deviceId, date }: GetBTLMRuntimeDataPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/tank/admin/device/tank-logs/${plantId}/${deviceId}`,
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

interface GetBTLMCustomReportDataPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

// get BTLM custom report data
export const getBTLMCustomReportData = createAsyncThunk(
  "device/getBTLMCustomReportData",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetBTLMCustomReportDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/tank/admin/device/tank-reports/${plantId}/${deviceId}`,
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

interface GetPHMCRuntimeDataPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

// get PHMC runtime data
export const getPHMCRuntimeData = createAsyncThunk(
  "device/getPHMCRuntimeData",
  async ({ plantId, deviceId, date }: GetPHMCRuntimeDataPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/phmc/admin/device/phmc-logs/${plantId}/${deviceId}`,
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

interface GetPHMCCustomReportDataPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

// get PHMC custom report data
export const getPHMCCustomReportData = createAsyncThunk(
  "device/getPHMCCustomReportData",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetPHMCCustomReportDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/phmc/admin/device/phmc-reports/${plantId}/${deviceId}`,
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

interface GetARGRuntimeDataPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

// get ARG runtime data
export const getARGRuntimeData = createAsyncThunk(
  "device/getARGRuntimeData",
  async ({ plantId, deviceId, date }: GetARGRuntimeDataPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/arg/admin/device/arg-logs/${plantId}/${deviceId}`,
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

interface GetARGCustomReportDataPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

// get ARG custom report data
export const getARGCustomReportData = createAsyncThunk(
  "device/getARGCustomReportData",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetARGCustomReportDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/arg/admin/device/arg-reports/${plantId}/${deviceId}`,
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

interface GetDWLRRuntimeDataPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

// get DWLR runtime data
export const getDWLRRuntimeData = createAsyncThunk(
  "device/getDWLRRuntimeData",
  async ({ plantId, deviceId, date }: GetDWLRRuntimeDataPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/dwlr/admin/device/dwlr-logs/${plantId}/${deviceId}`,
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

interface GetDWLRCustomReportDataPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

// get DWLR custom report data
export const getDWLRCustomReportData = createAsyncThunk(
  "device/getDWLRCustomReportData",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetDWLRCustomReportDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/dwlr/admin/device/dwlr-reports/${plantId}/${deviceId}`,
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

interface GetBDWFMSRuntimeDataPayload {
  plantId: number;
  deviceId: number;
  date: string;
}
// get BDWFMS runtime data
export const getBDWFMSRuntimeData = createAsyncThunk(
  "device/getBDWFMSRuntimeData",
  async (
    { plantId, deviceId, date }: GetBDWFMSRuntimeDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/bdwfms/admin/device/bdwfms-logs/${plantId}/${deviceId}`,
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

interface GetBDWFMSCustomReportDataPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

// get BDWFMS custom report data
export const getBDWFMSCustomReportData = createAsyncThunk(
  "device/getBDWFMSCustomReportData",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetBDWFMSCustomReportDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/bdwfms/admin/device/bdwfms-reports/${plantId}/${deviceId}`,
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

interface GetSMARTRuntimeDataPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

// get PHMC runtime data
export const getSMARTRuntimeData = createAsyncThunk(
  "device/getSMARTRuntimeData",
  async ({ plantId, deviceId, date }: GetSMARTRuntimeDataPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/smart/admin/device/smart-logs/${plantId}/${deviceId}`,
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

interface GetSMARTCustomReportDataPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

// get PHMC custom report data
export const getSMARTCustomReportData = createAsyncThunk(
  "device/getSMARTCustomReportData",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetSMARTCustomReportDataPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        `/smart/admin/device/smart-reports/${plantId}/${deviceId}`,
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
