import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { useAuthStore } from "../store/auth-store";

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web") {
    return "http://localhost:4000/api";
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:4000/api`;
    }
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000/api";
  }

  return "http://localhost:4000/api";
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const identity = useAuthStore.getState().identity;

  if (identity?.clerkUserId) {
    config.headers["x-clerk-user-id"] = identity.clerkUserId;
    config.headers["x-clerk-email"] = identity.email;
    config.headers["x-clerk-name"] = identity.name;
  }

  return config;
});
