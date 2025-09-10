import axios from "axios";

export const HOST =
  import.meta.env.VITE_API_URL || "https://test.wmsonline.in/api";

export const api = (baseURL?: string) => {
  const baseURLToUse = baseURL || HOST;

  return axios.create({
    baseURL: baseURLToUse,
  });
};
