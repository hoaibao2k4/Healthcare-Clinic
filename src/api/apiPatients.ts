import { response } from "@/services/axios";
import { Patient } from "@/types";
import axios from "axios";
import qs from "qs";
export const getAllPatients = async () => {
  try {
    const res = await response.get("/api/public/patients/get-patients");
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );
    } else if (err instanceof Error) {
      console.error("Request Err: ", err.message);
    } else {
      console.error("Unknown: ", err);
    }
  }
};

export const initialPatient = async (patient: Patient) => {
  try {
    const formData = qs.stringify({
      fullName: patient.fullName,
      gender:
        typeof patient.gender === "string"
          ? patient.gender.toLowerCase() === "nam"
            ? "true"
            : "false"
          : patient.gender
            ? "true"
            : "false",
      address: patient.address,
      yearOfBirth: patient.yearOfBirth,
      phoneNumber: patient.phoneNumber,
      residentalIdentity: patient.residentalIdentity,
    });

    const res = await response.post(
      "/api/public/patients/add-patient",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.data;
  } catch (err: unknown) {
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

export const updatePatient = async (patient: Patient) => {
  try {
    const formData = qs.stringify({
      fullName: patient.fullName,
      gender:
        typeof patient.gender === "string"
          ? patient.gender.toLowerCase() === "nam"
            ? "true"
            : "false"
          : patient.gender
            ? "true"
            : "false",
      address: patient.address,
      yearOfBirth: patient.yearOfBirth,
      phoneNumber: patient.phoneNumber,
      residentalIdentity: patient.residentalIdentity,
    });
    console.log("formData", formData);
    console.log("patient", patient);
    const res = await response.patch(
      `/api/public/patients/edit-patient/${patient.patientId}`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.data;
  } catch (err: unknown) {
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

export const deletePatient = async (patientId: string) => {
  try {
    const res = await response.delete(
      `api/public/patients/delete-patient/${patientId}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err || "No status";
    } else {
      throw err;
    }
  }
};

export const getPatientsWaiting = async (examinationDate: string) => {
  try {
    const res = await response.get(
      `/api/public/examination/waiting?examinationDate=${examinationDate}&size=${40}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );
    } else if (err instanceof Error) {
      console.error("Request Err: ", err.message);
    } else {
      console.error("Unknown: ", err);
    }
  }
};

export const getPatientsDiagnosis = async (examinationDate: string) => {
  try {
    const res = await response.get(
      `/api/public/examination/patients?examinationDate=${examinationDate}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        err.response?.data || err.message,
        err.response?.status || "No status"
      );
    } else if (err instanceof Error) {
      console.error("Request Err: ", err.message);
    } else {
      console.error("Unknown: ", err);
    }
  }
};
