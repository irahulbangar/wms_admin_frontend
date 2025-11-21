import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, apiStream } from "../api.service";
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
  extraReducers: (builder) => {
    builder.addCase(getAllDevices.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllDevices.fulfilled, (state, action) => {
      state.loading = false;
      state.devices = action.payload.data;
      state.status = action.payload.status;
      state.success = action.payload.success;
    });
    builder.addCase(getAllDevices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch devices";
      state.status = 0;
      state.success = false;
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
  onChunk?: (chunk: any) => void;
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
  onChunk?: (chunk: any) => void;
}

// data sync for BRWHMS device
export const dataSyncForBRWHMSDevices = createAsyncThunk(
  "device/dataSyncForBRWHMSDevices",
  async (
    { device_id, year, month, data, onChunk }: DataSyncForBRWHMSDevicesPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await apiStream().post(
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
      return new Promise((resolve, reject) => {
        if (response.data && typeof response.data.on === "function") {
          const chunks: Uint8Array[] = [];

          response.data.on("data", (chunk: Uint8Array | Buffer) => {
            const uint8Chunk =
              chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
            chunks.push(uint8Chunk);
            if (onChunk) {
              onChunk(chunk);
            }
          });

          response.data.on("end", () => {
            try {
              const totalLength = chunks.reduce(
                (sum, chunk) => sum + chunk.length,
                0
              );
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
              }

              const combinedData = new TextDecoder().decode(combined);
              let parsedData;

              try {
                parsedData = JSON.parse(combinedData);
              } catch {
                parsedData = combinedData;
              }

              resolve(parsedData);
            } catch (error) {
              const apiError = handleApiError(error);
              reject(apiError);
            }
          });

          response.data.on("error", (error: Error) => {
            const apiError = handleApiError(error);
            reject(apiError);
          });
        } else if (response.data instanceof ReadableStream) {
          const reader = response.data.getReader();
          const decoder = new TextDecoder();
          const chunks: string[] = [];

          const readChunk = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();

                if (done) {
                  const combinedData = chunks.join("");
                  let parsedData;
                  try {
                    parsedData = JSON.parse(combinedData);
                  } catch {
                    parsedData = combinedData;
                  }
                  resolve(parsedData);
                  break;
                }

                const chunkText = decoder.decode(value, { stream: true });
                chunks.push(chunkText);

                if (onChunk) {
                  onChunk(chunkText);
                }
              }
            } catch (error) {
              const apiError = handleApiError(error);
              reject(apiError);
            }
          };

          readChunk();
        } else {
          resolve(response.data);
        }
      });
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
  onChunk?: (chunk: any) => void;
}

// data sync for BTLM devices
export const dataSyncForBTLMDevices = createAsyncThunk(
  "device/dataSyncForBTLMDevices",
  async (
    { device_id, year, month, data, onChunk }: DataSyncForBTLMDevicesPayload,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await apiStream().post(
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

      return new Promise((resolve, reject) => {
        if (response.data && typeof response.data.on === "function") {
          const chunks: Uint8Array[] = [];

          response.data.on("data", (chunk: Uint8Array | Buffer) => {
            const uint8Chunk =
              chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
            chunks.push(uint8Chunk);
            if (onChunk) {
              onChunk(chunk);
            }
          });

          response.data.on("end", () => {
            try {
              const totalLength = chunks.reduce(
                (sum, chunk) => sum + chunk.length,
                0
              );
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
              }

              const combinedData = new TextDecoder().decode(combined);
              let parsedData;

              try {
                parsedData = JSON.parse(combinedData);
              } catch {
                parsedData = combinedData;
              }

              resolve(parsedData);
            } catch (error) {
              const apiError = handleApiError(error);
              reject(apiError);
            }
          });

          response.data.on("error", (error: Error) => {
            const apiError = handleApiError(error);
            reject(apiError);
          });
        } else if (response.data instanceof ReadableStream) {
          const reader = response.data.getReader();
          const decoder = new TextDecoder();
          const chunks: string[] = [];

          const readChunk = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();

                if (done) {
                  const combinedData = chunks.join("");
                  let parsedData;

                  try {
                    parsedData = JSON.parse(combinedData);
                  } catch {
                    parsedData = combinedData;
                  }

                  resolve(parsedData);
                  break;
                }

                const chunkText = decoder.decode(value, { stream: true });
                chunks.push(chunkText);

                if (onChunk) {
                  onChunk(chunkText);
                }
              }
            } catch (error) {
              const apiError = handleApiError(error);
              reject(apiError);
            }
          };

          readChunk();
        } else {
          resolve(response.data);
        }
      });
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

export const { setDevices, setLoading, setError } = deviceSlice.actions;

export default deviceSlice.reducer;
