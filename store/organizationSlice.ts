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

interface AddOrganizationPayload {
  org_name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email: string;
  note: string;
}

interface UpdateOrganizationPayload extends AddOrganizationPayload {
  id: string;
}

export const addOrganization = createAsyncThunk(
  "organization/addOrganization",
  async (organization: AddOrganizationPayload, thunkAPI) => {
    try {
      const response = await api().post(
        "/organization/create-organization",
        organization,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add organization";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "organization/updateOrganization",
  async (organization: UpdateOrganizationPayload, thunkAPI) => {
    try {
      const { id, ...organizationData } = organization;
      const response = await api().put(
        `/organization/update-organization/${id}`,
        organizationData,
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
          : "Failed to update organization";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const getOrganizationById = createAsyncThunk(
  "organization/getOrganizationById",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().get(`/organization/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get organization";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  "organization/deleteOrganization",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().delete(
        `/organization/delete-organization/${id}`,
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
          : "Failed to delete organization";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const { setOrganizations } = organizationSlice.actions;

export default organizationSlice.reducer;
