import { jwtDecode } from "jwt-decode";
import { AppDispatch, persistor } from "./store";
import { PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { BE_BASE_URL } from "@/services/axios";
import { UserPermission } from "@/types";
import { getNewAccessToken, getNewRefreshToken } from "@/api/apiAdmin";

interface JWTPayload {
  exp?: number;
}

export const createInstance = (
  user: UserPermission,
  dispatch: AppDispatch,
  stateAuth: (payload: UserPermission) => PayloadAction<UserPermission>
) => {
  const newInstance = axios.create({
    baseURL: BE_BASE_URL,
  });

  newInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const date = new Date();
      const currentTime = date.getTime() / 1000;

      const decodeToken = jwtDecode<JWTPayload>(user.accessToken);
      const decodeRefresh = jwtDecode<JWTPayload>(user.refreshToken);

      if (decodeRefresh.exp && decodeRefresh.exp < currentTime) {
        persistor.purge();
      } else if (decodeRefresh.exp && decodeRefresh.exp < currentTime + 300) {
        try {
          const res = await getNewRefreshToken(user.refreshToken);
          const refreshUser: UserPermission = {
            ...user,
            refreshToken: res,
          };
          dispatch(stateAuth(refreshUser));
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${res.access_token}`;
        } catch (error) {
          return Promise.reject(error);
        }
      } else if (decodeToken.exp && decodeToken.exp < currentTime) {
        try {
          const data = await getNewAccessToken(user.accessToken);
          const refreshUser: UserPermission = {
            ...user,
            accessToken: data,
          };
          dispatch(stateAuth(refreshUser));
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${data.access_token}`;
        } catch (error) {
          return Promise.reject(error);
        }
      }
      return config
    },
    (error: AxiosError) => Promise.reject(error)
  );

    // Interceptor cho response
  newInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    (error: AxiosError) => {
      if (error.response) {
        console.error("Response Error: ", error.response?.data);
        console.error("Error Status: ", error.response?.status);
        return Promise.reject(error.response.data);
      }
      return Promise.reject(error);
    }
  );

  return newInstance;
};
