import { response } from "@/services/axios";
import axios from "axios";
import qs from "qs";
export const updateExam = async (
  examinationId: number,
  symptoms: string,
  diseaseId: string
) => {
  const formData = qs.stringify({
    symptoms,
    diseaseId,
  });
  try {
    const res = await response.patch(
      `/api/public/examination/update-examination/${examinationId}`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
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

export const updateRecordExam = async (examinationId: number, records: any) => {
  const dataRecord = records.map((record: any) => ({
    drugId: record.drugId,
    note: record.note,
    quantity: record.quantity,
  }));

  try {
    const res = await response.patch(
      `/api/public/examination/update-record-examination/${examinationId}`,
      dataRecord
    );
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

export const predictorVitaminD = async (inputData: any) => {
  try {
    const res = response.post("http://localhost:8080/predict", inputData);
    return res;
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

export const createExam = async (id: number) => {
  try {
    const res = await response.post(`/api/public/examination/create-examination/${id}`)
    return res
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
