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
import { Patient } from "@/types";
import { toast } from "react-toastify";
import { Autocomplete, Chip, TextField } from "@mui/material";
////////////
interface UserRow {
  id: number;
  name: string;
  role: string[]; // mỗi ô chứa mảng các vai trò
}
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
        role: [],
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

export default function StaffSupporters() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const [originalRows, setOriginalRows] = useState<UserRow[]>([]);

  const [id, setId] = useState<number>(1);

  const rowsMock = [
    { id: 1, fullName: "Nguyễn Văn A", role: ["ADMIN", "DOCTOR"] },
    { id: 2, fullName: "Trần Thị B", role: ["SUPPORTER"] },
  ];
  const roleOptions = ["ADMIN", "DOCTOR", "SUPPORTER"];

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // const res = await getAllPatients();
        // const dataWithId = res.data.map((item: Patient, index: number) => ({
        //   ...item,
        //   id: id + index,
        // }));
        setRows(rowsMock);
        // setId(id + res.data.length);
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
    setOriginalRows([...rows] as UserRow[]);
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
    else {
    const original = originalRows.find((row) => row.id === id);
    if (original) {
      setRows(rows.map((row) => (row.id === id ? original : row)));
    }
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

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Họ và tên", width: 160, editable: true },
    {
      field: "role",
      headerName: "Vai trò",
      width: 500,
      sortable: false,
      filterable: false,
      editable: false,
      renderCell: (params: GridRenderCellParams<string[], UserRow>) => {
        console.log(params)
        const { id, field, api } = params;
        const value: string[] = Array.isArray(params.value) ? params.value : [];
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        const [inputValue, setInputValue] = React.useState("");

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
                onInputChange={(_e, newInputValue) =>
                  setInputValue(newInputValue)
                }
                onChange={(event, newValue) => {
                  handleAddRole(event, newValue);
                  setInputValue("");
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
