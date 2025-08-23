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
  client_password: string;
  client_role: string;
  client_status: string;
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
        "/clients/create-client",
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
        "/clients/all-clients",
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
      const response = await api().get(
        `/clients/${id}`,

        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );

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
        `/clients/update-client/${payload.client_id}`,
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

export const { setClients } = clientSlice.actions;
