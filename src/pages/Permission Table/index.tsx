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
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
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
  GridRenderCellParams,
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
import { Patient, Permission, Role } from "@/types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAllRoles } from "@/api/apiRole";
import {
  getAllPermissionByRole,
  updatePermissionByRole,
} from "@/api/apiPermission";
////////////
// const roles = ["Market", "Finance", "Development"];
// const randomRole = () => {
//   return randomArrayItem(roles);
// };

const initialRows: GridRowsProp = [
  {
    id: randomId(),
    permission: "Danh sách khám bệnh",
    permission_id: null,
    permission_name: "waiting",
    can_read: false,
    can_create: false,
    can_update: false,
  },
  {
    id: randomId(),
    permission: "Danh sách đăng kí khám",
    permission_id: null,
    permission_name: "exams",
    can_read: false,
    can_create: false,
    can_update: false,
  },
  {
    id: randomId(),
    permission: "Lập phiếu khám",
    permission_id: null,
    permission_name: "records",
    can_read: false,
    can_create: false,
    can_update: false,
  },
  // {
  //   id: randomId(),
  //   permission: "Danh sách bệnh nhân (trong ngày)",
  //   permission_id: null,
  //   permission_name: "patients",
  //   can_read: false,
  //   can_create: false,
  //   can_update: false,
  // },
  // {
  //   id: randomId(),
  //   permission: "Hóa đơn (trong ngày)",
  //   permission_id: null,
  //   permission_name: "invoicez",
  //   can_read: false,
  //   can_create: false,
  //   can_update: false,
  // },
  {
    id: randomId(),
    permission: "Quản lí bệnh nhân",
    permission_id: null,
    permission_name: "patients",
    can_read: false,
    can_create: false,
    can_update: false,
  },
  {
    id: randomId(),
    permission: "Quản lí thuốc",
    permission_id: null,
    permission_name: "drugs",
    can_read: false,
    can_create: false,
    can_update: false,
  },
  {
    id: randomId(),
    permission: "Quản lí hóa đơn",
    permission_id: null,
    permission_name: "invoice",
    can_read: false,
    can_create: false,
    can_update: false,
  },
  {
    id: randomId(),
    permission: "Báo cáo",
    permission_id: null,
    permission_name: "reports",
    can_read: false,
    can_create: false,
    can_update: false,
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
        permission_id: null,
        permission: "",
        can_create: false,
        can_update: false,
        can_read: false,
        can_delete: false,
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

export default function PermissionTable() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const [role, setRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const permissionUser = useSelector(
    (state: RootState) => state.permission.login.currentUser
  );

  const mergePermission = (
    initialRows: GridRowsProp,
    apiPermission: Permission[]
  ): GridRowsProp => {
    return initialRows.map((row) => {
      const matched = apiPermission.find(
        (item) => item.permission === row.permission_name
      );
      console.log(apiPermission);
      return {
        ...row,
        permission_id: matched?.permission_id,
        can_create: matched?.can_create || false,
        can_read: matched?.can_read || false,
        can_update: matched?.can_update || false,
        can_delete: matched?.can_delete || false,
      };
    });
  };

  useEffect(() => {
    const fetchPermissionRole = async () => {
      try {
        if (permissionUser && permissionUser?.accessToken) {
          const roleRes = await getAllRoles(permissionUser?.accessToken);
          const roleWithoutAdmin = roleRes.filter(
            (item: Role) => item.role_name !== "ADMIN"
          );
          setRoles(roleWithoutAdmin);
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
    fetchPermissionRole();
  }, []);
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

  // const handleDeleteClick = (id: GridRowId) => {
  //   return async () => {
  //     setRows(rows.filter((row) => row.id !== id));
  //     const patientId = rows.find((row) => row.id === id)?.patientId;
  //     console.log("patientId", patientId);
  //     try {
  //       // const res = await deletePatient(patientId);
  //       // if (res) {
  //       //   toast.success("Xóa bệnh nhân thành công", {
  //       //     position: "bottom-right",
  //       //     autoClose: 2000,
  //       //     hideProgressBar: false,
  //       //     closeOnClick: true,
  //       //     pauseOnHover: true,
  //       //     draggable: true,
  //       //     progress: undefined,
  //       //   });
  //       // }
  //     } catch (err: any) {
  //       console.error("API request failed:", err);
  //       if (err.name === "TypeError") {
  //         console.error("Network error or CORS issue:", err.message);
  //       } else {
  //         console.error("Unexpected error:", err.message || err);
  //       }
  //     }
  //   };
  // };

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
    if (!role) {
      return toast.info("Bạn chưa chọn vai trò", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      const updatedRow: Permission = {
        ...(newRow as Permission),
        isNew: false,
      };
      const selectedRoleId = Number(role);
      const selectedRole = roles.find(
        (r) => r.role_id === selectedRoleId
      )?.role_name;
      const data: Permission = {
        permission_id: updatedRow.permission_id,
        can_create: updatedRow.can_create,
        can_read: updatedRow.can_read,
        can_update: updatedRow.can_update,
        can_delete: updatedRow.can_delete,
        role: selectedRole,
      };
      console.log(">>>>>>>>", data);
      try {
        if (permissionUser && permissionUser.accessToken) {
          const res = await updatePermissionByRole(
            permissionUser?.accessToken,
            data
          );
          if (res)
            toast.success("Cập nhật thành công", {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          else {
            toast.error("Cập nhật thất bại", {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
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
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleSetRole = async (e: SelectChangeEvent) => {
    try {
      const selectedRoleId = Number(e.target.value);
      const selectedRole = roles.find(
        (r) => r.role_id === selectedRoleId
      )?.role_name;

      if (permissionUser && permissionUser.accessToken && selectedRole) {
        const res = await getAllPermissionByRole(
          permissionUser?.accessToken,
          selectedRole
        );
        const dataPermission = mergePermission(initialRows, res.permissions);
        setRows(dataPermission);
        setRole(e.target.value);
        console.log("data: ", dataPermission);
      }
    } catch (err: unknown) {
      console.log("Err", err);
    }
  };

  const columns: GridColDef[] = [
    { field: "permission", headerName: "Trang", width: 300, editable: true },
    {
      field: "can_create",
      headerName: "Create",
      width: 100,
      align: "center",
      headerAlign: "center",
      editable: true,
      type: "boolean",
    },
    {
      field: "can_read",
      headerName: "Read",
      type: "boolean",
      width: 100,
      editable: true,
    },
    {
      field: "can_update",
      headerName: "Update",
      width: 100,
      editable: true,
      type: "boolean",
    },
    {
      field: "can_delete",
      headerName: "Delete",
      width: 100,
      editable: true,
      type: "boolean",
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
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          // <GridActionsCellItem
          //   icon={<DeleteIcon />}
          //   label="Delete"
          //   onClick={handleDeleteClick(id)}
          //   color="inherit"
          // />,
        ];
      },
    },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl">
      <div className="my-4">
        <FormControl sx={{ width: 140 }}>
          <InputLabel id="role-label">Vai trò</InputLabel>
          <Select
            labelId="role-label"
            id="role"
            value={role ?? ""}
            label="Vai trò"
            onChange={handleSetRole}
          >
            {roles?.map((value, index) => (
              <MenuItem key={index} value={value.role_id}>
                {value.role_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div>
        <Box
          sx={{
            height: 400,
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
