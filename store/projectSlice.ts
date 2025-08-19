import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { GetProjectsResponse } from "../model/project.interface";

export const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
  },
});

// Get all projects
export const getAllProjects = createAsyncThunk(
  "project/getAllProjects",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<GetProjectsResponse>(
        "/project/all-projects",
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
      const response = await api().get<GetProjectsResponse>(
        `/organization/project/${id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
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

// Add project
