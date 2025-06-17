import { response } from "@/services/axios";
import axios from "axios";
import { SystemSettings } from "@/types/settings";
export const getSystemSettings = async ()=> {
  try {
    const res = await response.get("/api/public/parameter/get-parameter");
    const data = Array.isArray(res.data) ? res.data[0] : res.data;
    return data as SystemSettings;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );
    } else {
      console.error("Unknown error:", err);
    }
    throw err;
  }
};


export const saveSystemSettings = async (data: SystemSettings & { id: number }) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    const res = await response.patch(
      "/api/public/parameter/edit-parameter",
      formData
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );
    } else {
      console.error("Unknown error:", err);
    }
    throw err;
  }
};