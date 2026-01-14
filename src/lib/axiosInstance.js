import axios from "axios";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export const axiosInstance = axios.create({
  baseURL: serverEndpoint,
  headers: {
    common: {
      "x-admin-password": ADMIN_PASSWORD,
    },
  },
});
