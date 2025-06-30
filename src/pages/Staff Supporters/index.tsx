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
  initialPatient,
  updatePatient,
} from "@/api/apiPatients";
import { Patient, Role, Supporter } from "@/types";
import { toast } from "react-toastify";
import { Autocomplete, Chip, TextField } from "@mui/material";
import {
  changeUserRole,
  createSupporter,
  deleteUser,
  getAllSupporters,
  updateStaff,
} from "@/api/apiStaff";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAllRoles } from "@/api/apiRole";
import axios from "axios";
////////////
interface UserRow {
  id: number;
  name: string;
  roleUpdate: string[]; // mỗi ô chứa mảng các vai trò
}

interface CellRole {
  roles: string[];
}
// const roles = ["Market", "Finance", "Development"];
// const randomRole = () => {
//   return randomArrayItem(roles);
// };

const initialRows: GridRowsProp = [
  {
    id: randomId(),
    name: randomTraderName(),
    age: 25,
    joinDate: randomCreatedDate(),
    //role: randomRole(),
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
        username: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        staffTitle: "",
        isNew: true,
        roles: [],
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

export default function StaffSupporters() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const [originalRows, setOriginalRows] = useState<UserRow[]>([]);

  const [id, setId] = useState<number>(1);

  const permissionUser = useSelector(
    (state: RootState) => state.permission.login.currentUser
  );

  const [roleOptions, setRoleOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        if (permissionUser && permissionUser.accessToken) {
          const res = await getAllSupporters(permissionUser?.accessToken);
          const roleResponse = await getAllRoles(permissionUser.accessToken);
          const roleWithoutAdmin = roleResponse.filter(
            (item: Role) => item.role_name !== "ADMIN"
          );
          const roleNames = roleWithoutAdmin.map(
            (item: Role) => item.role_name
          );
          setRoleOptions(roleNames);

          const dataWithId = res.map((item: Role, index: number) => ({
            ...item,
            id: id + index,
          }));
          setRows(dataWithId);
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
    fetchSupporters();
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
    setOriginalRows([...rows] as UserRow[]);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => {
    return async () => {
      setRows(rows.filter((row) => row.id !== id));
      const supporterId = rows.find((row) => row.id === id)?.supporterId;
      console.log("supporterId", supporterId);
      try {
        if (permissionUser) {
          const res = await deleteUser(permissionUser.accessToken, supporterId);
          if (res) {
            toast.success("Xóa nhân viên thành công", {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
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
    } else {
      const original = originalRows.find((row) => row.id === id);
      if (original) {
        setRows(rows.map((row) => (row.id === id ? original : row)));
      }
    }
  };

  const checkPhoneNumber = (phoneNumber: string) => {
    return /^0\d{9}$/.test(phoneNumber);
  };
  const checkMail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow: Supporter = { ...(newRow as Supporter), isNew: false };
    console.log(">>>>>>>>>>>: ", updatedRow);

    if (!updatedRow.fullName) {
      toast.error("Họ tên chưa được nhập", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid null");
    } else if (!updatedRow.email) {
      toast.error("Email chưa được nhập", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid null");
    } else if (!updatedRow.phoneNumber) {
      toast.error("Số điện thoại chưa được nhập", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid null");
    } else if (!updatedRow.username) {
      toast.error("Tài khoản chưa được nhập", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid null");
    } else if (!updatedRow.password) {
      toast.error("Mật khẩu chưa được nhập", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid null");
    } else if (!updatedRow.staffTitle) {
      toast.error("Vị trí chưa được nhập", {
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
    if (!checkPhoneNumber(updatedRow.phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid null");
    } else if (!checkMail(updatedRow.email)) {
      toast.error("Email không hợp lệ", {
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
    const supporter = rows.find(
      (r) => r.supporterId === updatedRow.supporterId
    );

    try {
      if (newRow.isNew && permissionUser) {
        if (newRow.password !== supporter?.password) {
        }
        const res = await createSupporter(
          permissionUser?.accessToken,
          updatedRow as Supporter
        );
        updatedRow.supporterId = res.id;
        if (newRow.role && newRow.roles !== newRow.role) {
          const roleRes = await changeUserRole(
            permissionUser.accessToken,
            updatedRow.username,
            newRow.role
          );
          console.log(roleRes);
        }
        console.log("Supporter: ", res);
        if (res)
          toast.success("Thêm nhân viên thành công", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      } else {
        if (permissionUser && permissionUser.accessToken) {
          if (newRow.role && newRow.roles !== newRow.role) {
            const roleRes = await changeUserRole(
              permissionUser.accessToken,
              updatedRow.username,
              newRow.role
            );
            console.log(roleRes);
          }
          const res = await updateStaff(
            permissionUser?.accessToken,
            updatedRow as Supporter
          );
          if (res)
            toast.success("Cập nhật nhân viên thành công", {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
        }
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (
          err.response?.data.statusCode === 409 &&
          err.response.data.message.includes("Username")
        ) {
          toast.error("Tài khoản đã tồn tại", {
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
          throw new Error("Data existed");
        } else if (
          err.response?.data.statusCode === 409 &&
          err.response?.data.message.includes("Email")
        ) {
          toast.error("Email đã tồn tại", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          throw new Error("Data existed");
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

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Họ và tên", width: 160, editable: true },
    { field: "email", headerName: "Email", width: 180, editable: true },
    {
      field: "phoneNumber",
      headerName: "Số điện thoại",
      width: 110,
      editable: true,
      type: "string",
    },
    { field: "username", headerName: "Tài khoản", width: 110, editable: true },
    {
      field: "password",
      headerName: "Mật khẩu",
      width: 140,
      editable: true,
      renderCell: (params) => "•".repeat(params.value?.length || 6),
    },
    { field: "staffTitle", headerName: "Vị trí", width: 100, editable: true },

    {
      field: "role",
      headerName: "Vai trò",
      width: 500,
      sortable: false,
      filterable: false,
      editable: false,
      renderCell: (params: GridRenderCellParams<CellRole, Supporter>) => {
        const { id, field, api, row } = params;
        const value: string[] = Array.isArray(params.value)
          ? params.value
          : (row.roles ?? []);
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        const [inputValue, setInputValue] = useState("");

        const handleDelete = (roleToDelete: string) => {
          if (!isInEditMode) return;
          const updated = value.filter((r) => r !== roleToDelete);
          api.updateRows([{ id, [field]: updated }]);
        };

        const handleAddRole = (_event: any, newValue: string | null) => {
          if (!isInEditMode) return;
          if (newValue && !value.includes(newValue)) {
            const updated = [...value, newValue];
            api.updateRows([{ id, [field]: updated }]);
          }
        };

        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {value.map((role: string) => (
              <Chip
                key={role}
                label={role}
                size="small"
                onDelete={isInEditMode ? () => handleDelete(role) : undefined}
                deleteIcon={isInEditMode ? <CancelIcon /> : undefined}
              />
            ))}
            {isInEditMode && (
              <Autocomplete
                size="small"
                disableClearable={false}
                options={roleOptions.filter((r) => !value.includes(r))}
                inputValue={inputValue}
                // onInputChange={(_e, newInputValue) =>
                //   setInputValue(newInputValue);
                //   setInputValue("")
                // }
                onChange={(event, newValue) => {
                  handleAddRole(event, newValue);
                  //setInputValue("");
                }}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" size="small" />
                )}
                sx={{ width: 100 }}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, 4],
                        },
                      },
                    ],
                    sx: {
                      width: 200,
                      maxHeight: 250,
                      overflowY: "auto",
                      zIndex: 1300,
                    },
                  },
                  listbox: {
                    sx: {
                      fontSize: "0.75rem",
                      paddingY: 0.5,
                      alignItems: "center",
                      textAlign: "center",
                    },
                  },
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
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
