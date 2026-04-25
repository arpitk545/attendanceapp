import axios, { AxiosRequestConfig, Method } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create axios instance
export const axiosInstance = axios.create({
  withCredentials: true,
});

import { router } from "expo-router";

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Error fetching token from AsyncStorage", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userName");
      router.replace("/");
    }
    return Promise.reject(error);
  }
);

// Generic API connector
export const apiConnector = (
  method: Method,
  url: string,
  bodyData?: any,
  headers?: Record<string, string>,
  params?: Record<string, any>
) => {
  const config: AxiosRequestConfig = {
    method,
    url,
    data: bodyData || undefined,
    headers: headers || {},
    params: params || {},
  };

  return axiosInstance(config);
};