import { response } from "@/services/axios";
import axios from "axios";
import { SystemSettings } from "@/types";
export const getSystemSettings = async () => {
  try {
    const res = await response.get("/api/admin/settings");
    return res.data?.data as SystemSettings;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );
      throw err;
    } else {
      console.error("Unknown error:", err);
      throw err;
    }
  }
};


export const saveSystemSettings = async (data: SystemSettings) => {
  try {
    const res = await response.post("/api/admin/settings", data);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );
      throw err;
    } else {
      console.error("Unknown error:", err);
      throw err;
    }
  }
};