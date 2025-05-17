import { response } from "@/services/axios";
import { Permission } from "@/types";
import axios from "axios";
export const getAllPermissionByRole = async (
  token: string,
  roleName: string
) => {
  try {
    const res = await response.get(
      `/api/admin/role-with-permissions/${roleName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );
    } else if (err instanceof Error) {
      console.error("Request Err: ", err.message);
    } else {
      console.error("Unknown: ", err);
    }
  }
};

export const updatePermissionByRole = async (
  token: string,
  permission: Permission
) => {
  try {
    const res = await response.put(
      `/api/admin/role/update-role-privilegde`,
      permission,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );
    } else if (err instanceof Error) {
      console.error("Request Err: ", err.message);
    } else {
      console.error("Unknown: ", err);
    }
  }
};
