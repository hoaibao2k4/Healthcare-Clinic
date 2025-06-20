import { response } from "@/services/axios";
import axios from "axios";
import { SettingItem } from "@/types/settings";

export const getSystemSettings = async () => {
  try {
    const res = await response.get("/api/public/parameter/get-parameter");
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

export const saveSystemSettings = async (data: SettingItem[]) => {
  try {
    const formData = new FormData();
    data.forEach((item) => {
      formData.append(item.key, String(item.value ?? ""));
    });

    await response.patch("/api/public/parameter/edit-parameter", formData);
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
