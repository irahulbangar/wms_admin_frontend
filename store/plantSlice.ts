import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { NodesResult } from "../model/nodes.interface";
import type { EdgesResult } from "../model/edges.interface";
import type { GetPlantsResponse, PlantResult } from "../model/plant.interface";
import type { SinglePlantResponse } from "../model/single-plant.interface";

interface PlantResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface PlantState {
  plants: PlantResult[];
  loading: boolean;
  error: string | null;
}

const initialState: PlantState = {
  plants: [],
  loading: false,
  error: null,
};

export const plantSlice = createSlice({
  name: "plant",
  initialState,
  reducers: {
    setPlants: (state, action) => {
      state.plants = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllPlants.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllPlants.fulfilled, (state, action) => {
      state.loading = false;
      state.plants = action.payload.data;
    });
    builder.addCase(getAllPlants.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch plants";
    });
  },
});

// Get all plants
export const getAllPlants = createAsyncThunk(
  "plant/admin/getAllPlants",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<GetPlantsResponse>(
        "/plant/admin/all-plants",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch plants";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Get plant by id
export const getPlantById = createAsyncThunk(
  "plant/admin/getPlantById",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().get<SinglePlantResponse>(
        `/plant/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch plant";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Get all plants by organization id
export const getPlantsByOrganizationId = createAsyncThunk(
  "plant/admin/getPlantsByOrganizationId",
  async (organization_id: string, thunkAPI) => {
    try {
      const response = await api().get<GetPlantsResponse>(
        `/plant/admin/organization-plants/${organization_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch plants";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

interface PlantPayload {
  plant_name: string;
  latitude: string;
  longitude: string;
  address: string;
  status: string;
  organization_id?: string;
}

// Add plant
export const addPlant = createAsyncThunk(
  "plant/admin/addPlant",
  async (plant: PlantPayload, thunkAPI) => {
    try {
      const response = await api().post<PlantResponse>(
        `/plant/admin/create-plant`,
        plant,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add plant";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Update plant by id
export const updatePlantById = createAsyncThunk(
  "plant/admin/updatePlantById",
  async (plant: PlantPayload & { id: string }, thunkAPI) => {
    try {
      const response = await api().put<PlantResponse>(
        `/plant/admin/update-plant/${plant.id}`,
        plant,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update plant";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Delete plant by id
export const deletePlantById = createAsyncThunk(
  "plant/deletePlantById",
  async (id: string, thunkAPI) => {
    try {
      const response = await api().delete<PlantResponse>(
        `/plant/admin/delete-plant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete plant";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

interface UpdateDiagramDataPayload {
  plant_id: number;
  nodes: NodesResult[];
  edges: EdgesResult[];
}

// Update diagram data (nodes and edges)
export const updateDiagramData = createAsyncThunk(
  "plant/admin/updateDiagramData",
  async ({ plant_id, nodes, edges }: UpdateDiagramDataPayload, thunkAPI) => {
    try {
      const response = await api().put(
        `/plant/admin/update-diagram/${plant_id}`,
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

export const { setPlants } = plantSlice.actions;

export default plantSlice.reducer;
