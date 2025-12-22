import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { HOST } from "../api.service";
import type { GetOrganizationsResponse } from "../model/organizations.interface";
import type { GetPlantsResponse } from "../model/plant.interface";
import type { DepartmentResponse } from "../model/department.interface";
import type { SystemResponse } from "../model/system.interface";
import type { DeviceResponse } from "../model/devices.interface";

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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (
    result.error &&
    (result.error.status === 401 || result.error.status === 403)
  ) {
    localStorage.clear();

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return result;
};

export const organizationApi = createApi({
  reducerPath: "organizationApi",
  baseQuery: baseQueryWithReauth,
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
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Plant"],
  endpoints: (builder) => ({
    getAllPlants: builder.query<GetPlantsResponse, void>({
      query: () => "/plant/admin/all-plants",
      providesTags: ["Plant"],
    }),
  }),
});

export const departmentApi = createApi({
  reducerPath: "departmentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Department"],
  endpoints: (builder) => ({
    getAllDepartments: builder.query<DepartmentResponse, void>({
      query: () => "/department/admin/all-departments",
      providesTags: ["Department"],
    }),
  }),
});

export const systemApi = createApi({
  reducerPath: "systemApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["System"],
  endpoints: (builder) => ({
    getAllSystems: builder.query<SystemResponse, void>({
      query: () => "/system/admin/all-systems",
      providesTags: ["System"],
    }),
  }),
});

export const deviceApi = createApi({
  reducerPath: "deviceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Device"],
  endpoints: (builder) => ({
    getAllDevices: builder.query<DeviceResponse, void>({
      query: () => "/device/admin/all-devices",
      providesTags: ["Device"],
    }),
  }),
});

export const { useGetAllOrganizationsQuery } = organizationApi;
export const { useGetAllPlantsQuery } = plantApi;
export const { useGetAllDepartmentsQuery } = departmentApi;
export const { useGetAllSystemsQuery } = systemApi;
export const { useGetAllDevicesQuery } = deviceApi;
