import { loginFail, loginStart, loginSuccess } from "@/redux/authSlice";
import { response } from "@/services/axios";
import { Dispatch } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  permissionFail,
  permissionStart,
  permissionSuccess,
} from "@/redux/permissionSlice";

export const adminLogin = async (
  username: string,
  password: string,
  dispatch: Dispatch,
  navigate: ReturnType<typeof useNavigate>
) => {
  dispatch(loginStart());
  try {
    const res = await response.post("api/auth/login", {
      username,
      password,
    });
    if (typeof res === "object" && "data" in res) {
      console.log(res.data.available_roles.length)
      if (res.data.available_roles.length >= 1) {
        dispatch(loginSuccess(res.data));
        navigate("/dashboard");
      }
    }
    return res;
  } catch (error: unknown) {
    dispatch(loginFail());
    if (axios.isAxiosError(error)) {
      throw error || "No status";
    } else if (error instanceof Error) {
      throw "Request Err: " + error.message;
    } else {
      throw "Unknown error: " + error;
    }
  }
};

export const loginPermission = async (
  user_name: string,
  role_name: string,
  token: string,
  dispatch: Dispatch
) => {
  dispatch(permissionStart());
  try {
    const res = await response.post(
      "/api/auth/login-with-permission",
      {
        user_name,
        role_name,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(permissionSuccess(res.data));
    return res.data;
  } catch (error: any) {
    dispatch(permissionFail());
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data || error.message,
        error.response?.status || "No status"
      );
    } else if (error instanceof Error) {
      return "Request Err: " + error.message;
    } else {
      return "Unknown error: " + error;
    }
  }
};

export const getNewRefreshToken = async (refreshToken: string) => {
  try {
    const res = await response.get(`/api/auth/refresh`, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data || error.message,
        error.response?.status || "No status"
      );
    } else if (error instanceof Error) {
      return "Request Err: " + error.message;
    } else {
      return "Unknown error: " + error;
    }
  }
};

export const getNewAccessToken = async (refreshToken: string) => {
  try {
    const res = await response.get(`/api/auth/access`, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data || error.message,
        error.response?.status || "No status"
      );
    } else if (error instanceof Error) {
      return "Request Err: " + error.message;
    } else {
      return "Unknown error: " + error;
    }
  }
};
