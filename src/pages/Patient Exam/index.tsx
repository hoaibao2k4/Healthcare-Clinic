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
  initialPatient,
  updatePatient,
} from "@/api/apiPatients";
import { Patient, Permission } from "@/types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BasicDatePicker from "@/components/layouts/components/DatePicker";
import axios from "axios";
import { createExam } from "@/api/apiExam";
import Tooltip from "@mui/material/Tooltip";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
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

export const hasPermission = (
  permissions: Permission[],
  permissionKey: string,
  action: "create" | "update" | "read" | "delete"
): boolean => {
  const permission = permissions.find((p) => p.permission === permissionKey);

  if (!permission) return false;

  switch (action) {
    case "create":
      return permission.can_create;
    case "update":
      return permission.can_update;
    case "read":
      return permission.can_read;
    case "delete":
      return permission.can_delete;
    default:
      return false;
  }
};

function EditToolbar(props: GridSlotProps["toolbar"]) {
  const { setRows, setRowModesModel } = props;
  const permissions = useSelector(
    (state: RootState) => state.permission.login.currentUser
  );
  const handleClick = (permissions: any) => {
    let checkPermission;
    if (permissions && permissions.permissionList) {
      checkPermission = hasPermission(
        permissions.permissionList,
        "exams",
        "create"
      );

      if (!checkPermission) {
        toast.error("Không thể tạo mới do không đủ quyền hạn", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        throw new Error("Not Allow");
      }
    }
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
      <Button
        color="primary"
        startIcon={<AddIcon />}
        size="large"
        onClick={() => handleClick(permissions)}
      ></Button>
    </GridToolbarContainer>
  );
}

export default function PatientExam() {
  const [rows, setRows] = React.useState(initialRows);
  const [searchTerm, setSearchTerm] = useState(""); //thêm search
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [id, setId] = useState<number>(1);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getAllPatients();
        const dataWithId = res.data.map((item: Patient, index: number) => ({
          ...item,
          id: id + index,
        }));
        setRows(dataWithId);
        setId(id + res.data.length);
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
  //Thêm filter chỗ Search Box
  const filterModel: GridFilterModel = {
    items: searchTerm
      ? [
          {
            field: "residentalIdentity",
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
      const patientId = rows.find((row) => row.id === id)?.patientId;
      console.log("patientId", patientId);
      try {
        const res = await deletePatient(patientId);
        if (res) {
          setRows(rows.filter((row) => row.id !== id));
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
      } catch (error: unknown) {
        console.error("API request failed:", error);
        if (axios.isAxiosError(error)) {
          if (
            error.response?.data.statusCode === 500 &&
            error.response.data.message.includes("execute statement")
          ) {
            toast.error("Xóa thất bại do bệnh nhân đã được đăng kí khám", {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            throw new Error("Foreign key");
          }
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
    console.log("new row: ", newRow);
    if (newRow.fullName === "") {
      toast.info("Chưa nhập tên bệnh nhân", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Null");
    } else if (newRow.gender === null) {
      toast.info("Chưa chọn giới tính", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Null");
    } else if (!newRow.address) {
      toast.info("Chưa nhập địa chỉ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Null");
    }
    if (
      newRow?.yearOfBirth < 1930 ||
      newRow?.yearOfBirth > 2025 ||
      Number.isNaN(newRow?.yearOfBirth)
    ) {
      toast.error("Năm sinh không hợp lệ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Year of birth");
    }
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
        console.log("res: ", res);
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
        updatedRow.patientId = res.patientId;
        handleRegisterExam(updatedRow.patientId!);
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
    } catch (err: unknown) {
      console.log("err: ", err);
      if (axios.isAxiosError(err)) {
        if (
          err.response?.data.statusCode === 500 &&
          err.response.data.message.includes("2 results")
        ) {
          toast.error("Số điện thoại và CCCD đã tồn tại", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          throw new Error("CCCD và Số điện thoại đã tồn tại");
        } else if (
          err.response?.data.statusCode === 409 &&
          err.response.data.message.includes("Phone")
        ) {
          toast.error("Số điện thoại đã tồn tại", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          throw new Error("Số điện thoại đã tồn tại");
        } else if (
          err.response?.data.statusCode === 409 &&
          err.response?.data.message.includes("Residental")
        ) {
          toast.error("CCCD đã tồn tại", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          throw new Error("CCCD đã tồn tại");
        }
        throw err.response?.data || new Error("Unknown axios error");
      } else {
        console.error("Unknown error:", err);
        throw err;
      }
    }
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRegisterExam = async (id: number) => {
    try {
      const registerExam = await createExam(id);
      if (registerExam) {
        toast.success("Đăng kí khám bệnh thành công", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data.message.includes("Maximum number")) {
          toast.error("Thất bại do đủ giới hạn 40 bệnh nhân trong ngày", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } else {
        throw new Error("Unknown err");
      }
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Họ và tên", width: 160, editable: true },
    {
      field: "gender",
      headerName: "Giới tính",
      width: 80,
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
      width: 80,
      editable: true,
    },
    {
      field: "address",
      headerName: "Địa chỉ",
      width: 100,
      editable: true,
      type: "string",
    },
    {
      field: "phoneNumber",
      headerName: "Số điện thoại",
      width: 160,
      editable: true,
      type: "string",
    },
    {
      field: "residentalIdentity",
      headerName: "CMND/CCCD",
      width: 120,
      editable: true,
      type: "string",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 160,
      cellClassName: "actions",
      getActions: ({ id, row }) => {
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
          <GridActionsCellItem
            icon={
              <Tooltip title="Đăng kí khám bệnh">
                <AssignmentAddIcon />
              </Tooltip>
            }
            label="Khám bệnh"
            onClick={() => handleRegisterExam(row.patientId)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl">
      <div className="flex justify-between items-center pb-4">
        {/* thêm search box bên trái */}
        <Box
          display="flex"
          alignItems="center"
          bgcolor="#f4f6f8"
          borderRadius={2}
          px={2}
          py={1}
          width={350}
          boxShadow={1}
        >
          <SearchIcon sx={{ color: "gray", marginRight: 1 }} />
          <input
            placeholder="Tìm kiếm bệnh nhân bằng CCCD"
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
