import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
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
import { toast } from "react-toastify";

import { deleteDrugUnit } from "@/api/apiDrug";
import { createRole, deleteRole, getAllRoles } from "@/api/apiRole";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Role } from "@/types";
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
        unitName: "",
        description: "",
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
        onClick={handleClick}
      ></Button>
    </GridToolbarContainer>
  );
}

export default function RoleTable() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [id, setId] = useState<number>(1);
  const permissionUser = useSelector(
    (state: RootState) => state.permission.login.currentUser
  );
  useEffect(() => {
    const fetchAllRoles = async () => {
      try {
        if (permissionUser && permissionUser.accessToken) {
          const res = await getAllRoles(permissionUser.accessToken);
          console.log("res", res);
          const dataWithId = res.map((item: Role, index: number) => ({
            ...item,
            id: id + index,
          }));
          const roleWithoutAdmin = dataWithId.filter(
            (item: Role) => item.role_name !== "ADMIN"
          );
          setRows(roleWithoutAdmin);
          setId(id + res.length);
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
    fetchAllRoles();
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

  const handleDeleteClick = (id: GridRowId) => {
    return async () => {
      const roleId = rows.find((row) => row.id === id)?.role_id;
      console.log("roleId", roleId);
      try {
        if (permissionUser && permissionUser.accessToken) {
          const res = await deleteRole(roleId, permissionUser?.accessToken);
          if (res) {
            toast.success("Xóa thành công", {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        }
      } catch (err: unknown) {
        console.error("API request failed:", err);
        if (axios.isAxiosError(err)) {
          if (
            err.response?.data.statusCode === 500 &&
            err.response.data.message.includes("execute statement")
          ) {
            toast.error("Thất bại do vi phạm ràng buộc với Quản lí quyền!", {
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
      setRows(rows.filter((row) => row.id !== id));
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
    const matchedRole = (rows as Role[]).find(
      (item) => item.role_name === newRow.role_name
    );
    const updatedRow: Role = { ...(newRow as Role), isNew: false };
    if (!updatedRow.role_name) {
      toast.error("Chưa nhập vai trò", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid null");
    } else if (!updatedRow.description) {
      toast.error("Chưa nhập mô tả", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid null");
    } else if (matchedRole?.role_name === updatedRow.role_name) {
      toast.error("Vai trò đã tồn tại", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid null");
    }
    try {
      if (permissionUser && permissionUser.accessToken) {
        const res = await createRole(
          permissionUser?.accessToken,
          updatedRow.role_name,
          updatedRow.description
        );
        updatedRow.role_id = res.role_id;
        if (res)
          toast.success("Thêm vai trò thành công", {
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
      console.error("API request failed:", err);
      if (axios.isAxiosError(err)) {
        if (
          err.response?.data.statusCode === 500 &&
          err.response.data.message.includes("execute statement")
        ) {
          toast.error("Lỗi!", {
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
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: "role_name",
      headerName: "Tên vai trò",
      width: 180,
      editable: true,
    },
    {
      field: "description",
      headerName: "Mô tả",
      type: "string",
      width: 520,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
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
  );
}
