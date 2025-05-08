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
import { toast } from "react-toastify";
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
    dispatch(loginSuccess(res.data));
    navigate("/dashboard");
    if (typeof res === "object" && "data" in res) {
      if (res.statusCode === 200) {
        toast.success("Đăng nhập thành công!", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } else {
      toast.error("Lỗi đăng nhập! Không nhận được phản hồi đúng.", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    return res;
  } catch (error: unknown) {
    toast.error("Lỗi đăng nhập! Vui lòng kiểm tra lại thông tin.", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    dispatch(loginFail());
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
