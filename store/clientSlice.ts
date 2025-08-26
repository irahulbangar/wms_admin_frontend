import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  ClientUsersResponse,
  ClientUsersResult,
} from "../model/client-users.interface";

interface ClientState {
  clients: ClientUsersResult[];
}

const initialState: ClientState = {
  clients: [],
};

export const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.clients = action.payload;
    },
  },
});

export interface CreateClientPayload {
  client_name: string;
  client_email: string;
  client_phone: string;
  client_password: string;
  role: string;
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
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create client";
      return thunkAPI.rejectWithValue(errorMessage);
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
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch clients";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// GET CLIENT BY ID
export const getClientById = createAsyncThunk(
  "client/getClientById",
  async (id: number, thunkAPI) => {
    try {
      const response = await api().get(`/clients/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch client";
      return thunkAPI.rejectWithValue(errorMessage);
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
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update client";
      return thunkAPI.rejectWithValue(errorMessage);
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
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete client";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const { setClients } = clientSlice.actions;
