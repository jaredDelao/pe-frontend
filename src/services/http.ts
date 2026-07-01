import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";
import { useNotify } from "@/composables/useNotify";

declare module "axios" {
  export interface AxiosRequestConfig {
    successMessage?: string;
    silent?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res?.config?.successMessage) {
      const notify = useNotify();
      notify.success(res.config.successMessage);
    }
    return res;
  },
  (err) => {
    if (!err.config?.silent) {
      const notify = useNotify();
      const status = err.response?.status ?? 0;
      const message =
        err.response?.data?.message ??
        (status === 0
          ? "No se pudo conectar con el servidor"
          : "La solicitud no pudo completarse");
      notify.error(`Error ${status || ""}`.trim(), message);
    }
    return Promise.reject(err);
  },
);

export default api;
