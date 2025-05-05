import { loginFail, loginStart, loginSuccess } from "@/redux/authSlice";
import { response } from "@/services/axios";
import { Dispatch } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const adminLogin = async (
  username: string,
  password: string,
  dispatch: Dispatch,
  navigate: ReturnType<typeof useNavigate>
) => {
    dispatch(loginStart())
  try {
    const res = await response.post("api/auth/login", {
      username,
      password,
    });
    dispatch(loginSuccess(res.data))
    navigate("/dashboard")
    return res;
  } catch (error: any) {
    dispatch(loginFail())
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
