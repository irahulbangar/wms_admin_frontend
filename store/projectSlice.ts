import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  GetProjectsResponse,
  ProjectResult,
} from "../model/project.interface";

interface ProjectResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface ProjectState {
  projects: ProjectResult[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllProjects.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload.data;
    });
    builder.addCase(getAllProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch projects";
    });
  },
});

// Get all projects
export const getAllProjects = createAsyncThunk(
  "project/getAllProjects",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<GetProjectsResponse>(
        "/project/admin/all-projects",
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch projects";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Get project by id
export const getProjectById = createAsyncThunk(
  "project/getProjectById",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().get<GetProjectsResponse>(`/project/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch project";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Get all projects by organization id
export const getProjectsByOrganizationId = createAsyncThunk(
  "project/getProjectsByOrganizationId",
  async (organization_id: string, thunkAPI) => {
    try {
      const response = await api().get<GetProjectsResponse>(
        `/project/organization-projects/${organization_id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch projects";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

interface ProjectPayload {
  project_name: string;
  latitude: string;
  longitude: string;
  address: string;
  status: string;
  organization_id?: string;
}

// Add project
export const addProject = createAsyncThunk(
  "project/addProject",
  async (project: ProjectPayload, thunkAPI) => {
    try {
      const response = await api().post<ProjectResponse>(
        `/project/create-project`,
        project,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add project";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Update project by id
export const updateProjectById = createAsyncThunk(
  "project/updateProjectById",
  async (project: ProjectPayload & { id: string }, thunkAPI) => {
    try {
      const response = await api().put<ProjectResponse>(
        `/project/update-project/${project.id}`,
        project,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update project";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Delete project by id
export const deleteProjectById = createAsyncThunk(
  "project/deleteProjectById",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().delete<ProjectResponse>(
        `/project/delete-project/${id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete project";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const { setProjects } = projectSlice.actions;

export default projectSlice.reducer;
