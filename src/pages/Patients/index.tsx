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
import SearchIcon from "@mui/icons-material/Search";
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
  GridFilterModel,
} from "@mui/x-data-grid";
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from "@mui/x-data-grid-generator";
import {
  deletePatient,
  getAllPatients,
  getPatientsDiagnosis,
  initialPatient,
  updatePatient,
} from "@/api/apiPatients";
import { Patient } from "@/types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BasicDatePicker from "@/components/layouts/components/DatePicker";
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
        phoneNumber: "",
        residentalIdentity: "",
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
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

export default function PatientList() {
  const [searchTerm, setSearchTerm] = useState(""); //thêm search
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [id, setId] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const navigate = useNavigate();
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (selectedDate) {
          const res = await getPatientsDiagnosis(
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
  //Thêm filter chỗ Search Box
  const filterModel: GridFilterModel = {
    items: searchTerm
      ? [
          {
            field: "fullName",
            operator: "contains",
            value: searchTerm,
          },
        ]
      : [],
  };
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
  const checkIdentity = (identity: string) => {
    const regex = /^\d{12}$/;
    return regex.test(identity);
  };
  const chekckPhoneNumber = (phoneNumber: string) => {
    return /^0\d{9}$/.test(phoneNumber);
  };
  const processRowUpdate = async (newRow: GridRowModel) => {
    if (!checkIdentity(newRow?.residentalIdentity)) {
      toast.error("CMND/CCCD không hợp lệ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid CCCD");
    } else if (!chekckPhoneNumber(newRow?.phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid phone number");
    }
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
    navigate("/records", { state: { patient } });
  };
  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Họ và tên", width: 200, editable: true },
    {
      field: "examinationDate",
      headerName: "Ngày khám",
      type: "string",
      width: 160,
      editable: true,
    },
    {
      field: "nameDisease",
      headerName: "Chẩn đoán",
      width: 160,
      editable: true,
      type: "string",
    },
    {
      field: "symptoms",
      headerName: "Triệu chứng",
      width: 160,
      editable: true,
      type: "string",
    },
    // {
    //   field: "actions",
    //   type: "actions",
    //   headerName: "Actions",
    //   width: 160,
    //   cellClassName: "actions",
    //   getActions: ({ id }) => {
    //     const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

    //     if (isInEditMode) {
    //       return [
    //         <GridActionsCellItem
    //           icon={<SaveIcon />}
    //           label="Save"
    //           sx={{
    //             color: "primary.main",
    //           }}
    //           onClick={handleSaveClick(id)}
    //         />,
    //         <GridActionsCellItem
    //           icon={<CancelIcon />}
    //           label="Cancel"
    //           className="textPrimary"
    //           onClick={handleCancelClick(id)}
    //           color="inherit"
    //         />,
    //       ];
    //     }

    //     return [
    //       <GridActionsCellItem
    //         icon={<EditIcon />}
    //         label="Edit"
    //         className="textPrimary"
    //         onClick={handleEditClick(id)}
    //         color="inherit"
    //       />,
    //       <GridActionsCellItem
    //         icon={<DeleteIcon />}
    //         label="Delete"
    //         onClick={handleDeleteClick(id)}
    //         color="inherit"
    //       />,
    //       <GridActionsCellItem
    //         icon={<AssignmentAddIcon />}
    //         label="Khám bệnh"
    //         onClick={() => handleExaminate(id)}
    //         color="inherit"
    //       />,
    //     ];
    //   },
    // },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl">
      {/* <div className="flex pb-4">
        <BasicDatePicker value={selectedDate} onChange={setSelectedDate}/>
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
        > */}
      <div className="flex justify-between items-center pb-4">
        {/* thêm search box bên trái */}
        <Box
          display="flex"
          alignItems="center"
          bgcolor="#f4f6f8"
          borderRadius={2}
          px={2}
          py={1}
          width={300}
          boxShadow={1}
        >
          <SearchIcon sx={{ color: "gray", marginRight: 1 }} />
          <input
            placeholder="Tìm kiếm tên bệnh nhân"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              flex: 1,
              fontSize: "16px",
            }}
          />
        </Box>

        {/*Sửa ngày khám bên phải */}
        <BasicDatePicker value={selectedDate} onChange={setSelectedDate} />
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
            filterModel={filterModel}
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
