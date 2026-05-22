import axios from "axios";
import {store} from "../app/store";
import { logout, setAccessToken } from "../features/authSlice";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});


API.interceptors.request.use(
    (config) => {
    const token = store.getState().auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle refresh token)
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Prevent infinite loop
    if (err.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/v1/auth/refresh-token")) {
      originalRequest._retry = true;

      try {
        const { data } = await API.post("/v1/auth/refresh-token");

        store.dispatch(setAccessToken(data.accessToken));

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return API(originalRequest);
      } catch (error) {
        console.error(error.message);
        store.dispatch(logout());
      }
    }

    return Promise.reject(err);
  }
);

export default API;