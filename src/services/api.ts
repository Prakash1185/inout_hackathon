import axios from "axios";
import { Platform } from "react-native";

import { useAuthStore } from "../store/auth-store";

const DEFAULT_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:4000/api"
    : "http://localhost:4000/api";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE_URL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
