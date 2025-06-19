import { response } from "@/services/axios";
import { Doctor, Supporter } from "@/types";
import axios from "axios";

export const getAllSupporters = async (token: string) => {
  try {
    const res = await response.get("/api/admin/all-supporters", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return error.response?.data || error.message, error.status || "No status";
    } else if (error instanceof Error) {
      return "Request Err: " + error.message;
    } else {
      return "Unknown error: " + error;
    }
  }
};

export const getAllDoctors = async (token: string) => {
  try {
    const res = await response.get("/api/admin/all-doctors", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return error.response?.data || error.message, error.status || "No status";
    } else if (error instanceof Error) {
      return "Request Err: " + error.message;
    } else {
      return "Unknown error: " + error;
    }
  }
};

export const updateStaff = async (token: string, staff: Doctor | Supporter) => {
  try {
    let id: number | undefined;
    if ("doctorId" in staff) {
      id = staff.doctorId;
    } else if ("supporterId" in staff) {
      id = staff.supporterId;
    } else {
      throw new Error("Unknown staff type");
    }

    const res = await response.patch(
      `/api/user-update-info/${id}`,
      staff,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error;
    } else if (error instanceof Error) {
      throw "Request Err: " + error.message;
    } else {
      throw "Unknown error: " + error;
    }
  }
};

export const createSupporter = async (token: string, supporter: Supporter) => {
  try {
    const res = await response.post(`/api/admin/register-supporter`, supporter, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error || "No status";
    } else if (error instanceof Error) {
      throw "Request Err: " + error.message;
    } else {
      throw "Unknown error: " + error;
    }
  }
}

export const createDoctor = async (token: string, doctor: Doctor) => {
  try {
    const res = await response.post(`/api/admin/register-doctor`, doctor, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error
    } else if (error instanceof Error) {
      throw "Request Err: " + error.message;
    } else {
      throw "Unknown error: " + error;
    }
  }
}

export const changeUserRole = async (token: string, username: string, roleList: string[]) => {
  try {
    const res = await response.post('/api/admin/add-role-user', {
      username: username,
      roleNameList: roleList
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res.data
  }
  catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error
    } else if (error instanceof Error) {
      throw "Request Err: " + error.message;
    } else {
      throw "Unknown error: " + error;
    }
  }
}

export const deleteUser = async (token: string, id: number) => {
  try {
    const res  = await response.delete(`/api/delete-user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res
  }
    catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return error.response?.data || error.message, error.status || "No status";
    } else if (error instanceof Error) {
      return "Request Err: " + error.message;
    } else {
      return "Unknown error: " + error;
    }
  }
}
