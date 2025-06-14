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
} from "@mui/x-data-grid-generator";
import { deletePatient } from "@/api/apiPatients";
import { Doctor, Role } from "@/types";
import { toast } from "react-toastify";
import { Autocomplete, Chip, TextField } from "@mui/material";
import {
  changeUserRole,
  createDoctor,
  deleteUser,
  getAllDoctors,
  updateStaff,
} from "@/api/apiStaff";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAllRoles } from "@/api/apiRole";
////////////
interface UserRow {
  id: number;
  name: string;
  roleUpdate: string[];
}

interface CellRole {
  roles: string[];
}

const initialRows: GridRowsProp = [
  {
    id: randomId(),
    name: randomTraderName(),
    age: 25,
    joinDate: randomCreatedDate(),
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
        specialization: "",
        qualification: "",
        yearsOfExperience: 0,
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

export default function StaffDoctors() {
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
    const fetchDoctors = async () => {
      try {
        if (permissionUser && permissionUser.accessToken) {
          const res = await getAllDoctors(permissionUser?.accessToken);
          const roleResponse = await getAllRoles(permissionUser.accessToken);
          const roleNames = roleResponse.map((item: Role) => item.role_name);
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
    fetchDoctors();
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
      const doctorId = rows.find((row) => row.id === id)?.doctorId;
      console.log("doctorId", doctorId);
      try {
        if (permissionUser && permissionUser.accessToken) {
          const res = await deleteUser(permissionUser.accessToken, doctorId);
          if (res) {
            toast.success("Xóa bác sĩ thành công", {
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

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow: Doctor = { ...(newRow as Doctor), isNew: false };
    console.log(">>>>>>>>>>>: ", updatedRow);
    const doctor = rows.find((r) => r.doctorId === updatedRow.doctorId);

    try {
      if (newRow.isNew && permissionUser) {
        if (newRow.password !== doctor?.password) {
        }
        const res = await createDoctor(
          permissionUser?.accessToken,
          updatedRow as Doctor
        );
        updatedRow.doctorId = res.id;
        console.log("SUpporter: ", res);
        if (newRow.role && newRow.roles !== newRow.role) {
          const roleRes = await changeUserRole(
            permissionUser.accessToken,
            updatedRow.username,
            newRow.role
          );
          console.log(roleRes);
        }

        if (res)
          toast.success("Thêm bác sĩ thành công", {
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
            updatedRow as Doctor
          );
          if (res)
            toast.success("Cập nhật bác sĩ thành công", {
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
    { field: "password", headerName: "Mật khẩu", width: 140, editable: true },
    {
      field: "specialization",
      headerName: "Chuyên khoa",
      width: 100,
      editable: true,
    },
    {
      field: "qualification",
      headerName: "Bằng cấp",
      width: 100,
      editable: true,
    },
    {
      field: "yearsOfExperience",
      headerName: "Năm kinh nghiệm",
      width: 100,
      editable: true,
    },
    {
      field: "role",
      headerName: "Vai trò",
      width: 500,
      sortable: false,
      filterable: false,
      editable: false,
      renderCell: (params: GridRenderCellParams<CellRole, Doctor>) => {
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
