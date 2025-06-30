import { response } from "@/services/axios";
import { Drug, DrugUnit } from "@/types/drug";
import axios from "axios";
import qs from "qs";

export const getAllDrugUnits = async () => {
  try {
    const res = await response.get("/api/public/drugs-unit/get-drugs-unit");
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

export const initialDrugUnit = async (drugUnit: DrugUnit) => {
  try {
    const formData = qs.stringify({
      unitName: drugUnit.unitName,
      description: drugUnit.description,
    });
    const res = await response.post(
      "/api/public/drugs-unit/add-drugs-unit",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );

      throw err || new Error("Unknown axios error");
    } else {
      console.error("Unknown error:", err);
      throw err;
    }
  }
};

export const updateDrugUnit = async (drugUnit: DrugUnit) => {
  try {
    const formData = qs.stringify({
      unitName: drugUnit.unitName,
      description: drugUnit.description,
    });
    const res = await response.patch(
      `/api/public/drugs-unit/edit-drugs-unit/${drugUnit.unitId}`,
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

export const deleteDrugUnit = async (unitId: number) => {
  try {
    const res = await response.delete(
      `/api/public/drugs-unit/delete-drugs-unit/${unitId}`
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

export const getAllDrugs = async () => {
  try {
    const res = await response.get("/api/public/drugs/get-drugs");
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

export const initialDrug = async (drug: Drug) => {
  try {
    const formData = qs.stringify({
      drugName: drug.drugName,
      description: drug.description,
      quantity: drug.quantity,
      importPrice: drug.importPrice,
      expirationDate: drug.expirationDate,
      unitId: drug.unitId,
    });
    const res = await response.post("/api/public/drugs/create-drug", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return res.data;
  } catch (error: unknown) {
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
    throw error;
  }
};

export const updateDrug = async (drug: Drug) => {
  try {
    const formData = qs.stringify({
      drugName: drug.drugName,
      description: drug.description,
      quantity: drug.quantity,
      importPrice: drug.importPrice,
      expirationDate: drug.expirationDate,
      unitId: drug.unitId,
    });
    const res = await response.patch(
      `/api/public/drugs/edit-drug/${drug.drugId}`,
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
      console.log(
        error.response?.data || error.message,
        error.response?.status || "No status"
      );
    } else if (error instanceof Error) {
      console.log("Request Err: " + error.message);
    } else {
      console.log("Unknown error: " + error);
    }
    throw error;
  }
};

export const deleteDrug = async (drugId: number) => {
  try {
    const res = await response.delete(
      `/api/public/drugs/delete-drug/${drugId}`
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
