import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { OrganizationResult } from "../model/organizations.interface";
import { handleApiError } from "../src/utils/errorHandler";
import type { SingleOrganizationResponse } from "../model/single-organization.interface";

interface OrganizationState {
  organizations: OrganizationResult[];
  loading: boolean;
  error: string | null;
  status: number;
  success: boolean;
  message: string;
}

const initialState: OrganizationState = {
  organizations: [],
  loading: false,
  error: null,
  status: 0,
  success: false,
  message: "",
};

export const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setOrganizations: (state, action) => {
      state.organizations = action.payload;
      state.status = action.payload.status;
      state.success = action.payload.success;
      state.message = action.payload.message;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getOrganizations.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getOrganizations.fulfilled, (state, action) => {
      state.loading = false;
      state.organizations = action.payload.data;
      state.status = action.payload.status;
      state.success = action.payload.success;
      state.message = action.payload.message;
    });
    builder.addCase(getOrganizations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch organizations";
      state.status = 0;
      state.success = false;
      state.message = action.error.message || "Failed to fetch organizations";
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

interface AddOrganizationPayload {
  organization_name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email: string;
  note: string;
  introduction: string;
  governance: string;
  logo: string;
  subdomain: string;
  status: string;
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

export const getOrganizationById = createAsyncThunk(
  "organization/getOrganizationById",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().get<SingleOrganizationResponse>(
        `/organization/admin/${id}`,
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

export const deleteOrganization = createAsyncThunk(
  "organization/deleteOrganization",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().delete(
        `/organization/admin/delete-organization/${id}`,
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

export const { setOrganizations, setLoading, setError, setMessage } =
  organizationSlice.actions;

export default organizationSlice.reducer;
