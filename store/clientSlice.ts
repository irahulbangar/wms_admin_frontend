import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  ClientUsersResponse,
  ClientUsersResult,
} from "../model/client-users.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface ClientState {
  clients: ClientUsersResult[];
  loading: boolean;
  error: string | null;
  status: number;
  success: boolean;
}

const initialState: ClientState = {
  clients: [],
  loading: false,
  error: null,
  status: 0,
  success: false,
};

export const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.clients = action.payload;
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
    builder.addCase(getAllClients.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllClients.fulfilled, (state, action) => {
      state.loading = false;
      state.clients = action.payload.data;
      state.status = action.payload.status;
      state.success = action.payload.success;
    });
    builder.addCase(getAllClients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch clients";
      state.status = 0;
      state.success = false;
    });
  },
});

export interface CreateClientPayload {
  client_name: string;
  client_email: string;
  client_phone: string;
  client_password: string;
  status: string;
  organization_id: number;
}

export interface UpdateClientPayload extends CreateClientPayload {
  client_id: number;
}

// POST /clients/create-client
export const createClient = createAsyncThunk(
  "client/createClient",
  async (payload: CreateClientPayload, thunkAPI) => {
    try {
      const response = await api().post<ClientUsersResponse>(
        "/clients/admin/create-client",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// GET ALL CLIENTS
export const getAllClients = createAsyncThunk(
  "client/getAllClients",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<ClientUsersResponse>(
        "/clients/admin/all-clients",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// GET CLIENT BY ID
export const getClientById = createAsyncThunk(
  "client/getClientById",
  async (id: number, thunkAPI) => {
    try {
      const response = await api().get(`/clients/admin/client/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // Handle both single client and array responses
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }

      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// PUT /clients/update-client/:id
export const updateClient = createAsyncThunk(
  "client/updateClient",
  async (payload: UpdateClientPayload, thunkAPI) => {
    try {
      const response = await api().put<ClientUsersResponse>(
        `/clients/admin/update-client/${payload.client_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// DELETE /clients/delete-client/:id
export const deleteClient = createAsyncThunk(
  "client/deleteClient",
  async (id: number, thunkAPI) => {
    try {
      const response = await api().delete<ClientUsersResponse>(
        `/clients/admin/delete-client/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// GET clients by organization id
export const getClientsByOrganizationId = createAsyncThunk(
  "client/getClientsByOrganizationId",
  async (organizationId: number, thunkAPI) => {
    try {
      const response = await api().get<ClientUsersResponse>(
        `/clients/admin/organization/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

export const { setClients, setLoading, setError } = clientSlice.actions;

export default clientSlice.reducer;
