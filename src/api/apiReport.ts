import { response } from "@/services/axios";
import axios from "axios";

export const getRevenueReport = async (month: number, year:number) => {
  try {
    const res = await response.get(
      `/api/public/month-report/get-month-report?month=${month}&year=${year}`
    );
    return res.data?.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error (
        err.response?.data || err.message, 
        err.response?.status || "No status"
      );
    throw err || new Error("Unknown axios error");
    } else {
      console.error("unknown error: ",err);
      throw err;
    }
  }
};


export const getDrugsReport = async (month: number, year: number) => {
  try {
    const res = await response.get(
     `/api/public/drugs-usage-report/get-drugs-usage-report?month=${month}&year=${year}`
    );
    return res.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message, 
        err.response?.status || "No status"
      );
    } else {
      console.error("Unknown error: ", err);
    }
    throw err instanceof Error ? err : new Error("Unknown error");
  }
};
