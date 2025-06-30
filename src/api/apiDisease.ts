import { response } from "@/services/axios";
import { Disease } from "@/types";
import axios from "axios";
import qs from "qs";

export const getAllDiseases = async () => {
  try {
    const res = await response.get("/api/public/diseases/get-diseases");
    return res.data;
  } catch (error: any) {
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

export const initialDisease = async (disease: Disease) => {
  try {
    const formData = qs.stringify({
      diseaseName: disease.diseaseName,
      description: disease.description,
    });
    const res = await response.post(
      "/api/public/diseases/add-diseases",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.log(
        error.response?.data || error.message,
        error.response?.status || "No status"
      );
    } else if (error instanceof Error) {
      console.error("Request Err: " + error.message);
    } else {
      console.error("Unknown error: " + error);
    }
    throw error;
  }
};

export const updateDisease = async (disease: Disease) => {
  try {
    const formData = qs.stringify({
      diseaseName: disease.diseaseName,
      description: disease.description,
    });
    const res = await response.patch(
      `/api/public/diseases/edit-diseases/${disease.diseaseId}`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.log(
        error.response?.data || error.message,
        error.response?.status || "No status"
      );
    } else if (error instanceof Error) {
      console.log("Request Err: " + error.message);
    } else {
      console.log("Unknown error: " + error);
    }
  }
};

export const deleteDisease = async (diseaseId: number) => {
  try {
    const res = await response.delete(
      `/api/public/diseases/delete-diseases/${diseaseId}`
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw error || "No status";
    } else if (error instanceof Error) {
      throw "Request Err: " + error.message;
    } else {
      throw "Unknown error: " + error;
    }
  }
};
