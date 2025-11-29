import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HOST } from "../api.service";
import type { GetOrganizationsResponse } from "../model/organizations.interface";

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

export const { useGetAllOrganizationsQuery } = organizationApi;
