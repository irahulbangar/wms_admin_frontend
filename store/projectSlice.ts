import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  GetProjectsResponse,
  ProjectResult,
} from "../model/project.interface";
import type { SingleProjectResponse } from "../model/single-project.interface";
import type { NodesResult } from "../model/nodes.interface";
import type { EdgesResult } from "../model/edges.interface";

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
  "project/admin/getAllProjects",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<GetProjectsResponse>(
        "/project/admin/all-projects",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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
  "project/admin/getProjectById",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().get<SingleProjectResponse>(
        `/project/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
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
  "project/admin/getProjectsByOrganizationId",
  async (organization_id: string, thunkAPI) => {
    try {
      const response = await api().get<GetProjectsResponse>(
        `/project/admin/organization-projects/${organization_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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
  "project/admin/addProject",
  async (project: ProjectPayload, thunkAPI) => {
    try {
      const response = await api().post<ProjectResponse>(
        `/project/admin/create-project`,
        project,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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
  "project/admin/updateProjectById",
  async (project: ProjectPayload & { id: string }, thunkAPI) => {
    try {
      const response = await api().put<ProjectResponse>(
        `/project/admin/update-project/${project.id}`,
        project,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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

interface UpdateDiagramDataPayload {
  project_id: number;
  nodes: NodesResult[];
  edges: EdgesResult[];
}

// Update diagram data (nodes and edges)
export const updateDiagramData = createAsyncThunk(
  "project/admin/updateDiagramData",
  async ({ project_id, nodes, edges }: UpdateDiagramDataPayload, thunkAPI) => {
    try {
      const response = await api().put(
        `/project/admin/update-diagram/${project_id}`,
        { nodes, edges },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update diagram data";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const { setProjects } = projectSlice.actions;

export default projectSlice.reducer;
