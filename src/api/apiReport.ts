import { response } from "@/services/axios";
import axios from "axios";

export const getRevenueReport = async (month: number, year: string) => {
  try {
    const res = await response.get(
      `/api/public/month-report/get-month-report?month=${month}&year=${year}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return (
        err.response?.data || err.message, err.response?.status || "No status"
      );
    } else if (err instanceof Error) {
      return err.message;
    } else {
      return "Unknown err: " + err;
    }
  }
};


export const getDrugsReport = async (month: number, year: number) => {
  try {
    const res = await response.get(
      `/api/public/drugs-usage-report/get-drugs-usage-report=${month}&year=${year}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return (
        err.response?.data || err.message, err.response?.status || "No status"
      );
    } else if (err instanceof Error) {
      return err.message;
    } else {
      return "Unknown err: " + err;
    }
  }
};
