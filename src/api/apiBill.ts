import { response } from "@/services/axios";
import axios from "axios";
export const getInvoice = async () => {
  try {
    const res = await response.get(`/api/public/examination/getAll-bill`);
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
