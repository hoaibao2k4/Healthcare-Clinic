import { response } from "@/services/axios";
import axios from "axios";

export const getAllLabs = async (token: string, id: number) => {
  try {
    const res = await response.get(`/lab/get-all/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

export const createQuestionaire = async (
  token: string,
  id: number,
  milk: number,
  smoke: boolean
) => {
  try {
    const res = await response.post(
      `/questionaire/create-questionaire/${id}?milk=${milk}&smoke=${smoke}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
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

export const updatePatientLab = async (
  token: string,
  id: number,
  bmi: number,
  pir: number,
  race: number
) => {
  try {
    const res = await response.patch(
      `/api/public/patients/patient-lab/${id}?BMI=${bmi}&PIR=${pir}&race=${race}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
