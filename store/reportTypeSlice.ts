import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { ReportTypeResponse, ReportTypeResult } from "../model/report-type.interface";

interface ReportTypeState {
  reportTypes: ReportTypeResult[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportTypeState = {
  reportTypes: [],
  loading: false,
  error: null,
};

export const reportTypeSlice = createSlice({
  name: "reportType",
  initialState,
  reducers: {
    setReportTypes: (state, action) => {
      state.reportTypes = action.payload;
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
    });
    builder.addCase(getAllReportTypes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch report types";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch report types";
      return rejectWithValue(errorMessage);
    }
  }
);

export const { setReportTypes, setLoading, setError } = reportTypeSlice.actions;
