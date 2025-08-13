import axios from "axios";

export const HOST = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = (baseURL?: string) => {
  const baseURLToUse = baseURL || HOST;
  console.log("Creating API instance with baseURL:", baseURLToUse);

  return axios.create({
    baseURL: baseURLToUse,
  });
};
