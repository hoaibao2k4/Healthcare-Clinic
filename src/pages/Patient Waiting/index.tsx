import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
import dayjs, { Dayjs } from "dayjs";
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
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from "@mui/x-data-grid-generator";
import {
  deletePatient,
  getPatientsWaiting,
  initialPatient,
  updatePatient,
} from "@/api/apiPatients";
import { Patient } from "@/types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BasicDatePicker from "@/components/layouts/components/DatePicker";
import { Tooltip } from "@mui/material";
import { updateExam } from "@/api/apiExam";
import axios from "axios";
////////////
const roles = ["Market", "Finance", "Development"];
const randomRole = () => {
  return randomArrayItem(roles);
};

const initialRows: GridRowsProp = [
  {
    id: randomId(),
    name: randomTraderName(),
    age: 25,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
  {
    id: randomId(),
    name: randomTraderName(),
    age: 36,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
  {
    id: randomId(),
    name: randomTraderName(),
    age: 19,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
  {
    id: randomId(),
    name: randomTraderName(),
    age: 28,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
  {
    id: randomId(),
    name: randomTraderName(),
    age: 23,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
];

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}
////////////

function EditToolbar(props: GridSlotProps["toolbar"]) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Math.floor(Math.random() * 100);
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        fullName: "",
        gender: "",
        yearOfBirth: "",
        address: "",
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "fullName" },
    }));
  };

  return (
    <GridToolbarContainer>
      {/* <Button
        color="primary"
        startIcon={<AddIcon />}
        size="large"
        onClick={handleClick}
      ></Button> */}
    </GridToolbarContainer>
  );
}

export default function PatientWaiting() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [id, setId] = useState<number>(1);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [check, setCheck] = useState(0);
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (selectedDate) {
          const res = await getPatientsWaiting(
            selectedDate?.format("YYYY-MM-DD")
          );
          const dataWithId = res.data.map((item: Patient, index: number) => ({
            ...item,
            id: id + index,
          }));
          setRows(dataWithId);
          setId(id + res.data.length);
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
  }, [selectedDate]);
  // console.log(rows);
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

  const handleDeleteClick = (id: GridRowId) => {
    return async () => {
      setRows(rows.filter((row) => row.id !== id));
      const patientId = rows.find((row) => row.id === id)?.patientId;
      console.log("patientId", patientId);
      try {
        const res = await deletePatient(patientId);
        if (res) {
          toast.success("Xóa bệnh nhân thành công", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } catch (err: any) {
        console.error("API request failed:", err);
        if (err.name === "TypeError") {
          console.error("Network error or CORS issue:", err.message);
        } else {
          console.error("Unexpected error:", err.message || err);
        }
      }
    };
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

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow: Patient = { ...(newRow as Patient), isNew: false };
    try {
      if (newRow.isNew) {
        const res = await initialPatient(updatedRow as Patient);
        updatedRow.patientId = res.patientId;
        if (res)
          toast.success("Thêm bệnh nhân thành công", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      } else {
        const res = await updatePatient(updatedRow as Patient);
        if (res)
          toast.success("Cập nhật bệnh nhân thành công", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      }
    } catch (err: any) {
      console.error("API request failed:", err);
      if (err.name === "TypeError") {
        console.error("Network error or CORS issue:", err.message);
      } else {
        console.error("Unexpected error:", err.message || err);
      }
    }
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };
  const handleExaminate = (id: GridRowId) => {
    const patient = rows.find((row) => row.id === id);
    console.log(patient);

    if (patient?.isExam === true) {
      navigate("/records", { state: { patient } });
    } else {
      toast.error("Không thể do đã hủy khám bệnh nhân", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleCancelExam = async (id: GridRowId) => {
    const patient = rows.find((row) => row.id === id);
    console.log(patient);
    try {
      const res = await updateExam(patient?.examId, null, null, false);
      if (res) {
        toast.success("Hủy khám thành công", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setCheck(1);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error || "No status";
      } else if (error instanceof Error) {
        throw "Request Err: " + error.message;
      } else {
        throw "Unknown error: " + error;
      }
    }
  };
  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Họ và tên", width: 200, editable: true },
    {
      field: "gender",
      headerName: "Giới tính",
      width: 100,
      align: "left",
      headerAlign: "left",
      editable: true,
      type: "singleSelect",
      valueOptions: [
        {
          value: true,
          label: "Nam",
        },
        {
          value: false,
          label: "Nữ",
        },
      ],
      valueGetter: (param, row) => {
        return row.gender;
      },
    },
    {
      field: "yearOfBirth",
      headerName: "Năm sinh",
      type: "string",
      width: 100,
      editable: true,
    },
    {
      field: "address",
      headerName: "Địa chỉ",
      width: 260,
      editable: true,
      type: "string",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 160,
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
          // <GridActionsCellItem
          //   icon={<EditIcon />}
          //   label="Edit"
          //   className="textPrimary"
          //   onClick={handleEditClick(id)}
          //   color="inherit"
          // />,
          <GridActionsCellItem
            icon={
              <Tooltip title="Hủy khám">
                <DeleteIcon />
              </Tooltip>
            }
            label="Delete"
            onClick={() => handleCancelExam(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={
              <Tooltip title="Khám bệnh">
                <AssignmentAddIcon />
              </Tooltip>
            }
            label="Khám bệnh"
            onClick={() => handleExaminate(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl">
      <div className="flex pb-4">
        <BasicDatePicker value={selectedDate} onChange={setSelectedDate} />{" "}
      </div>
      <div>
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
            onProcessRowUpdateError={(error) => {
              console.error("Row update error:", error);
            }}
          />
        </Box>
      </div>
    </div>
  );
}
