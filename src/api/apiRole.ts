import axios from "axios";
import { response } from "@/services/axios";
export const getAllRoles = async (token: string) => {
  try {
    const res = await response.get("/api/admin/all-roles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err || "No status";
    } else if (err instanceof Error) {
      throw err.message;
    } else {
      throw "Unknown err: " + err;
    }
  }
};

export const createRole = async (
  token: string,
  role_name: string,
  description: string
) => {
  try {
    const res = await response.post(
      `/api/admin/role/create`,
      { role_name, description },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err || "No status";
    } else if (err instanceof Error) {
      throw err.message;
    } else {
      throw "Unknown err: " + err;
    }
  }
};

export const deleteRole = async (id: number, token: string) => {
  try {
    const res = await response.delete(`/api/admin/role/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error || "No status";
    } else if (error instanceof Error) {
      throw "Request Err: " + error.message;
    } else {
      throw "Unknown error: " + error;
    }
  }
};
