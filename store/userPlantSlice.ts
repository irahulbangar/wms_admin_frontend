import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  UserPlantResult,
  UserPlantsResponse,
} from "../model/user-plants.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface UserPlantState {
  userPlants: UserPlantResult[];
  loading: boolean;
  error: string | null;
  status: number;
  success: boolean;
  message: string;
}

const initialState: UserPlantState = {
  userPlants: [],
  loading: false,
  error: null,
  status: 0,
  success: false,
  message: "",
};

export const userPlantSlice = createSlice({
  name: "userPlant",
  initialState,
  reducers: {
    setUserPlants: (state, action) => {
      state.userPlants = action.payload;
      state.status = action.payload.status;
      state.success = action.payload.success;
      state.message = action.payload.message;
    },
  },
});

// GET ALL USER PLANTS
export const getAllUserPlants = createAsyncThunk(
  "userPlant/getAllUserPlants",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<UserPlantsResponse>(
        "/user-plant/admin/all-user-plants",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

interface UserPlantPayload {
  plant_id: number;
  user_id: number;
  role: string;
  status: string;
}

interface UserPlantPayloadUpdate extends UserPlantPayload {
  user_plant_id: number;
}

// POST USER PLANT
export const createUserPlant = createAsyncThunk(
  "userPlant/createUserPlant",
  async (userPlant: UserPlantPayload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().post(
        "/user-plant/admin/create-plant",
        userPlant,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

// Get user plant by user_id
export const getUserPlantByUserId = createAsyncThunk(
  "userPlant/getUserPlantByUserId",
  async (user_id: number, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<UserPlantsResponse>(`/user-plant/admin/${user_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

// PUT user plant by user_plant_id
export const updateUserPlantByUserId = createAsyncThunk(
  "userPlant/updateUserPlantByUserPlantId",
  async (userPlant: UserPlantPayloadUpdate, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().put(
        `/user-plant/admin/update-plant/${userPlant.user_plant_id}`,
        userPlant,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

export const { setUserPlants } = userPlantSlice.actions;

export default userPlantSlice.reducer;
