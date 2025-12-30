import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { NodesResult } from "../model/nodes.interface";
import type { EdgesResult } from "../model/edges.interface";
import type { GetPlantsResponse, PlantResult } from "../model/plant.interface";
import type {
  PlantReporting,
  SinglePlantResponse,
} from "../model/single-plant.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface PlantResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  status: number;
}

interface PlantState {
  plants: PlantResult[];
  loading: boolean;
  error: string | null;
  status: number;
  success: boolean;
}

const initialState: PlantState = {
  plants: [],
  loading: false,
  error: null,
  status: 0,
  success: false,
};

export const plantSlice = createSlice({
  name: "plant",
  initialState,
  reducers: {
    setPlants: (state, action) => {
      state.plants = action.payload;
    },
  },
  // extraReducers: (builder) => {
  //   builder.addCase(getAllPlants.pending, (state) => {
  //     state.loading = true;
  //   });
  //   builder.addCase(getAllPlants.fulfilled, (state, action) => {
  //     state.loading = false;
  //     state.plants = action.payload.data;
  //     state.status = action.payload.status;
  //     state.success = action.payload.success;
  //   });
  //   builder.addCase(getAllPlants.rejected, (state, action) => {
  //     state.loading = false;
  //     state.error = action.error.message || "Failed to fetch plants";
  //     state.status = 0;
  //     state.success = false;
  //   });
  // },
});

// Get all plants
// export const getAllPlants = createAsyncThunk(
//   "plant/admin/getAllPlants",
//   async (_, thunkAPI) => {
//     try {
//       const response = await api().get<GetPlantsResponse>(
//         "/plant/admin/all-plants",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );
//       return response.data;
//     } catch (error: unknown) {
//       const apiError = handleApiError(error);
//       return thunkAPI.rejectWithValue(apiError);
//     }
//   }
// );

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
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
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
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
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
  unit: string;
  plant_reporting: PlantReporting;
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
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

interface UpdatePlantPayload extends PlantPayload {
  id: string;
}

// Update plant by id
export const updatePlantById = createAsyncThunk(
  "plant/admin/updatePlantById",
  async (plant: UpdatePlantPayload, thunkAPI) => {
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
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
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
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
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
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

export const { setPlants } = plantSlice.actions;

export default plantSlice.reducer;
