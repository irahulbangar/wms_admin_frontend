import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HOST } from "../api.service";
import type { GetOrganizationsResponse } from "../model/organizations.interface";
import type { GetPlantsResponse } from "../model/plant.interface";

const baseQuery = fetchBaseQuery({
  baseUrl: HOST,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    return headers;
  },
});

export const organizationApi = createApi({
  reducerPath: "organizationApi",
  baseQuery,
  tagTypes: ["Organization"],
  endpoints: (builder) => ({
    getAllOrganizations: builder.query<GetOrganizationsResponse, void>({
      query: () => "/organization/admin/all-organizations",
      providesTags: ["Organization"],
    }),
  }),
});

export const plantApi = createApi({
  reducerPath: "plantApi",
  baseQuery,
  tagTypes: ["Plant"],
  endpoints: (builder) => ({
    getAllPlants: builder.query<GetPlantsResponse, void>({
      query: () => "/plant/admin/all-plants",
      providesTags: ["Plant"],
    }),
  }),
});

export const { useGetAllOrganizationsQuery } = organizationApi;
export const { useGetAllPlantsQuery } = plantApi;
