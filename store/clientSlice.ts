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

export const { setClients } = clientSlice.actions;
