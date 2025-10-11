import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { ReportTypeResponse, ReportTypeResult } from "../model/report-type.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface ReportTypeState {
  reportTypes: ReportTypeResult[];
  loading: boolean;
  error: string | null;
  status: number;
  success: boolean;
  message: string;
}

const initialState: ReportTypeState = {
  reportTypes: [],
  loading: false,
  error: null,
  status: 0,
  success: false,
  message: "",
};

export const reportTypeSlice = createSlice({
  name: "reportType",
  initialState,
  reducers: {
    setReportTypes: (state, action) => {
      state.reportTypes = action.payload;
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
  },
  extraReducers: (builder) => {
    builder.addCase(getAllReportTypes.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllReportTypes.fulfilled, (state, action) => {
      state.loading = false;
      state.reportTypes = action.payload.data;
      state.status = action.payload.status;
      state.success = action.payload.success;
      state.message = action.payload.message;
    });
    builder.addCase(getAllReportTypes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch report types";
      state.status = 0;
      state.success = false;
      state.message = action.error.message || "Failed to fetch report types";
    });
  },
});

// Get all report types
export const getAllReportTypes = createAsyncThunk(
  "reportType/getAllReportTypes",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await api().get<ReportTypeResponse>(
        "/report-type/admin/all-report-type",
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

export const { setReportTypes, setLoading, setError } = reportTypeSlice.actions;
