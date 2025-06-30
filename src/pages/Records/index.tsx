import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import BasicDatePicker from "@/components/layouts/components/DatePicker";
import { useState, useEffect } from "react";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridSlotProps,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { useLocation } from "react-router-dom";
import { Disease, ExaminationDetail, Patient } from "@/types";
import { getAllDiseases } from "@/api/apiDisease";
import { MenuItem, Modal } from "@mui/material";
import { getAllDrugs } from "@/api/apiDrug";
import { Drug } from "@/types/drug";
import { getPatientRecord, updateExam, updateRecordExam } from "@/api/apiExam";
import { toast } from "react-toastify";
import BloodLab from "@/components/layouts/components/Modal/LIS";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

function EditToolbar(props: GridSlotProps["toolbar"]) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      { id, drugId: null, quantity: 0, note: "", isNew: true, drugs: null },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "drugName" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        size="large"
        onClick={handleClick}
      ></Button>
    </GridToolbarContainer>
  );
}

export default function PatientRecords() {
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const location = useLocation();
  const [patient, setPatient] = useState<Patient | null>(() => {
    return location.state?.patient;
  });
  const [drugs, setDrugs] = useState<Drug[] | null>([]);
  const [diseases, setDiseases] = useState<Disease[] | null>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [selectedSymptom, setSelectedSymptom] = useState("");

  //modal

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (patient && patient.examId) {
          const fetchDiseases = await getAllDiseases();
          setDiseases(fetchDiseases?.data);
          const fetchDrug = await getAllDrugs();
          setDrugs(fetchDrug?.data);
          const res = await getPatientRecord(patient.examId);

          const disease = fetchDiseases?.data.find(
            (r: Disease) => r.diseaseName === res.diseaseName
          );
          console.log(res);
          if (res && disease && res.diseaseName) {
            setSelectedDiagnosis(disease.diseaseId);
            setSelectedSymptom(res.symptoms);

            const dataWithId = res.examinationDetails.map(
              (item: ExaminationDetail) => ({
                ...item,
                id: randomId(),
                drugId: fetchDrug?.data.find(
                  (drug: Drug) => drug.drugName === item.drugName
                )?.drugId,
              })
            );
            setRows(dataWithId);
            console.log(dataWithId);
          }
        }
      } catch (err: any) {
        console.error("Fetch API failed:");
        if (err.name === "TypeError") {
          console.error("Network error or CORS issue:", err.message);
        } else {
          console.error("Unexpected error:", err.message || err);
        }
      }
    };
    fetchPatients();
  }, []);
  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    toast.success("Xóa thuốc thành công", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const selectedDrug = drugs?.find((drug) => drug.drugId === newRow.drugId);
    const updatedRow: ExaminationDetail = {
      ...(newRow as ExaminationDetail),
      isNew: false,
      drugs: selectedDrug!,
    };
    console.log(updatedRow);
    const quantity = Number(updatedRow.quantity);
    if (!updatedRow.drugId) {
      toast.error("Thuốc chưa được chọn", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Null");
    } else if (!updatedRow.note) {
      toast.error("Cách dùng chưa nhập", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Null");
    } else if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error("Số lượng không hợp lệ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Null");
    } else if (quantity > selectedDrug?.quantity!) {
      toast.error("Số lượng thuốc không đủ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Null");
    } else {
      setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
      toast.success("Thêm thuốc thành công", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleSaveRecord = async () => {
    if (!patient) {
      toast.error("Chưa có thông tin bệnh nhân", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else if (!(rows && selectedDiagnosis && selectedSymptom)) {
      toast.error("Bệnh nhân chưa được khám", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else if (!selectedSymptom || !selectedDiagnosis) {
      toast.error("Bác sĩ chưa chẩn đoán bệnh", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else if (patient?.examId) {
      try {
        const res = await updateExam(
          patient.examId,
          selectedSymptom,
          selectedDiagnosis
        );
        const resRecord = await updateRecordExam(patient?.examId, rows);
        console.log("res: ", res);
        console.log("res cord: ", resRecord);
        if (res) {
          toast.success("Lưu thông tin thành công", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        return res;
      } catch (error: unknown) {
        if (error instanceof Error) {
          return "Request Err: " + error.message;
        } else {
          return "Error: " + error;
        }
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "drugId",
      headerName: "Thuốc",
      width: 240,
      editable: true,
      type: "singleSelect",
      valueGetter: (value) => value || "",
      valueOptions: (params) => {
        const selectedDrugIds = rows
          .filter((row) => row.id !== params.id && row.drugId)
          .map((row) => row.drugId);

        const availableDrugs = drugs?.filter(
          (drug) => !selectedDrugIds.includes(drug.drugId)
        );

        return (
          availableDrugs?.map((drug) => ({
            label: drug.drugName,
            value: drug.drugId,
          })) || []
        );
      },
    },

    {
      field: "unitName",
      headerName: "Đơn vị",
      type: "string",
      width: 100,
      align: "left",
      headerAlign: "left",
      editable: false,
      valueGetter: (params, row) => {
        return row.unitName || row.drugs?.drugsUnit?.unitName || "Chưa có";
      },
    },
    {
      field: "quantity",
      headerName: "Số lượng",
      type: "number",
      align: "left",
      headerAlign: "left",
      width: 100,
      editable: true,
    },
    {
      field: "note",
      headerName: "Cách dùng",
      width: 240,
      editable: true,
      type: "string",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 120,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl">
      <div className="flex justify-between w-full">
        <h1 className="text-2xl font-bold p-2 ">Lập phiếu khám</h1>
        <div className="flex">
          <div className="my-2">
            <Button variant="contained" onClick={handleOpen}>
              KQXN
            </Button>
          </div>
          <div className="mx-6 my-2">
            <Button variant="contained" onClick={handleSaveRecord}>
              Lưu kết quả
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 pb-4">
        <TextField
          id="outlined-basic"
          label="Họ tên"
          variant="outlined"
          size="medium"
          disabled
          value={patient?.fullName}
          sx={{
            "& .MuiInputLabel-root": {
              top: 10,
            },
            "& .MuiInputBase-root": {
              marginTop: 1,
            },
          }}
        />
        <BasicDatePicker disable={true} />
        <TextField
          id="symptom"
          label="Triệu chứng"
          variant="outlined"
          size="medium"
          value={selectedSymptom}
          onChange={(e) => setSelectedSymptom(e.target.value)}
        />
        <TextField
          id="diagnosis"
          label="Chẩn đoán"
          variant="outlined"
          size="medium"
          select
          onChange={(e) => setSelectedDiagnosis(e.target.value)}
          value={selectedDiagnosis}
        >
          {diseases?.map((value, index) => (
            <MenuItem key={index} value={value.diseaseId}>
              {value.diseaseName}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <Box
        sx={{
          height: 500,
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{ toolbar: EditToolbar }}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {
          <>
            <BloodLab patient={patient!} />
          </>
        }
      </Modal>
    </div>
  );
}
