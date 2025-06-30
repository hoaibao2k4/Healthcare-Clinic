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

import {
  deleteDrugUnit,
  getAllDrugUnits,
  initialDrugUnit,
  updateDrugUnit,
} from "@/api/apiDrug";
import { DrugUnit } from "@/types/drug";
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

export default function DrugUnitPage() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [id, setId] = useState<number>(1);
  useEffect(() => {
    const fetchDrugUnit = async () => {
      try {
        const res = await getAllDrugUnits();
        const dataWithId = res.data.map((item: DrugUnit, index: number) => ({
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
    fetchDrugUnit();
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
      const unitId = rows.find((row) => row.id === id)?.unitId;
      console.log("unitId", unitId);
      try {
        const res = await deleteDrugUnit(unitId);
        if (res) {
          setRows(rows.filter((row) => row.id !== id));
          toast.success("Xóa thành công", {
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
            toast.error("Thất bại do vi phạm ràng buộc với Loại Thuốc", {
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
  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow: DrugUnit = { ...(newRow as DrugUnit), isNew: false };
    if (!updatedRow.unitName) {
      toast.error("Đơn vị thuốc chưa nhập", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Null");
    } else if (!newRow.description) {
      toast.error("Mô tả không được để trống", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Unit is empty");
    }
    try {
      if (newRow.isNew) {
        const res = await initialDrugUnit(updatedRow as DrugUnit);
        updatedRow.unitId = res.unitId;
        if (res)
          toast.success("Thêm đơn vị thuốc thành công", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      } else {
        const res = await updateDrugUnit(updatedRow as DrugUnit);
        if (res)
          toast.success("Cập nhật đơn vị thuốc thành công", {
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
      console.log("err: ", error);
      if (axios.isAxiosError(error)) {
        if (
          error.response?.data.statusCode === 400 &&
          error.response.data.message.includes("exists")
        ) {
          toast.error("Đơn vị thuốc đã tồn tại", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          throw new Error("Drug Unit had been already existed");
        }
      } else if (error instanceof Error) {
        console.error("Request Err: " + error.message);
      } else {
        console.error("Unknown error: " + error);
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
      field: "unitName",
      headerName: "Đơn vị",
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
