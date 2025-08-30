import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  GetOrganizationsResponse,
  OrganizationResult,
} from "../model/organizations.interface";

interface OrganizationState {
  organizations: OrganizationResult[];
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  organizations: [],
  loading: false,
  error: null,
};

export const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setOrganizations: (state, action) => {
      state.organizations = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getOrganizations.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getOrganizations.fulfilled, (state, action) => {
      state.loading = false;
      state.organizations = action.payload.data;
    });
    builder.addCase(getOrganizations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch organizations";
    });
  },
});

export const getOrganizations = createAsyncThunk(
  "organization/getOrganizations",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<GetOrganizationsResponse>(
        "/organization/admin/all-organizations",
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
  organization_name: string;
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
  "organization/admin/addOrganization",
  async (organization: AddOrganizationPayload, thunkAPI) => {
    try {
      const response = await api().post(
        "/organization/admin/create-organization",
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
  "organization/admin/updateOrganization",
  async (organization: UpdateOrganizationPayload, thunkAPI) => {
    try {
      const { id, ...organizationData } = organization;
      const response = await api().put(
        `/organization/admin/update-organization/${id}`,
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
      const response = await api().get(`/organization/admin/${id}`, {
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
        `/organization/admin/delete-organization/${id}`,
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
