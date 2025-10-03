import axios from "axios";

export const HOST = document.location.hostname === "localhost" ?
  import.meta.env.VITE_API_URL :
  document.location.origin + "/api";

export const api = (baseURL?: string) => {
  const baseURLToUse = baseURL || HOST;

  return axios.create({
    baseURL: baseURLToUse,
  });
};
