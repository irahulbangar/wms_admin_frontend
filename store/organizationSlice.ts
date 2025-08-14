import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { GetOrganizationsResponse } from "../model/get-organizations.interface";

export const organizationSlice = createSlice({
  name: "organization",
  initialState: {
    organizations: [],
    loading: false,
    error: null,
  },
  reducers: {
    setOrganizations: (state, action) => {
      state.organizations = action.payload;
    },
  },
});

export const getOrganizations = createAsyncThunk(
  "organization/getOrganizations",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<GetOrganizationsResponse>(
        "/organization/all-organizations",
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
          : "Failed to fetch organizations";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const { setOrganizations } = organizationSlice.actions;

export default organizationSlice.reducer;
