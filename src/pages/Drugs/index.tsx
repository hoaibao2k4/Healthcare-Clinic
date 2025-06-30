import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
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
import { toast } from "react-toastify";

import {
  deleteDrug,
  getAllDrugs,
  getAllDrugUnits,
  initialDrug,
  updateDrug,
} from "@/api/apiDrug";
import { Drug, DrugUnit } from "@/types/drug";
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
        drugName: "",
        description: "",
        quantity: 0,
        importPrice: 0,
        expirationDate: "",
        unitId: null,
        isNew: true,
        drugsUnit: null,
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

export default function DrugsPage() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [id, setId] = useState<number>(1);
  const [drugUnits, setDrugUnits] = useState<DrugUnit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchDrug = async () => {
      try {
        const res = await getAllDrugs();
        const response = await getAllDrugUnits();
        setDrugUnits(response.data);
        const dataWithId = res.data.map((item: Drug, index: number) => ({
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
    fetchDrug();
  }, []);
  //FilterModel tìm kiếm theo tên thuốc
  const filterModel: GridFilterModel = {
    items: searchTerm
      ? [
          {
            field: "drugName",
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
      const drugId = rows.find((row) => row.id === id)?.drugId;
      console.log("drugId", drugId);
      try {
        const res = await deleteDrug(drugId);
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
            toast.error("Thất bại do vi phạm ràng buộc với Phiếu Khám", {
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
    console.log(newRow);
    if (!newRow.drugName) {
      toast.error("Tên thuốc không được để trống", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Invalid Null");
    } else if (!newRow.unitId) {
      toast.error("Đơn vị không được để trống", {
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
    else if (!newRow.description) {
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
    const quantity = Number(newRow.quantity);
    const importPrice = Number(newRow.importPrice);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Số lượng không hợp lệ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("Quantity must be greater than 0");
    } else if (importPrice <= 0 || !Number.isInteger(importPrice)) {
      toast.error("Giá nhập không hợp lệ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw new Error("ImportPrice must be greater than 0");
    }
    const drugUnitApi = await getAllDrugUnits();
    let expirationDateString = "";
    try {
      expirationDateString = new Date(newRow.expirationDate)
        .toISOString()
        .split("T")[0];
    } catch (err) {
      console.error("Invalid expiration date: ", newRow.expirationDate, err);
      toast.error("Ngày hết hạn không hợp lệ", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      throw err;
    }
    const updatedRows: Drug = {
      ...(newRow as Drug),
      isNew: false,
      expirationDate: expirationDateString,
    };
    const drugUnit = drugUnitApi.data[updatedRows.unitId! - 1];
    console.log(drugUnit);
    const updatedRow = {
      ...updatedRows,
      drugsUnit: drugUnit,
    };
    console.log("updatedRow", updatedRow);
    try {
      if (newRow.isNew) {
        const res = await initialDrug(updatedRow as Drug);
        updatedRow.drugId = res.drugId;
        if (res)
          toast.success("Thêm thuốc thành công", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      } else {
        const res = await updateDrug(updatedRow as Drug);
        if (res)
          toast.success("Cập nhật thành công", {
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
      console.log(error);
      if (axios.isAxiosError(error)) {
        if (
          error.response?.data.statusCode === 400 &&
          error.response.data.message.includes("exists")
        ) {
          toast.error("Thuốc đã tồn tại", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          throw new Error("Drug had been already existed");
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
      field: "drugName",
      headerName: "Tên thuốc",
      width: 180,
      editable: true,
    },
    {
      field: "description",
      headerName: "Mô tả",
      type: "string",
      width: 160,
      editable: true,
    },
    {
      field: "quantity",
      headerName: "Số lượng",
      type: "string",
      width: 80,
      editable: true,
    },
    {
      field: "importPrice",
      headerName: "Giá nhập",
      type: "string",
      width: 80,
      editable: true,
    },
    {
      field: "expirationDate",
      headerName: "Ngày hết hạn",
      type: "date",
      width: 150,
      editable: true,
      valueGetter: (param, row) => {
        return new Date(row.expirationDate);
      },
    },
    {
      field: "unitId",
      headerName: "Đơn vị thuốc",
      type: "singleSelect",
      valueOptions: [
        ...drugUnits.map((unit) => ({
          value: unit.unitId,
          label: unit.unitName,
        })),
      ],
      width: 80,
      editable: true,
      valueGetter: (params, row) => {
        return row.drugsUnit?.unitId;
      },
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
      {/* Thêm search box */}
      <Box
        display="flex"
        alignItems="center"
        bgcolor="#f4f6f8"
        borderRadius={2}
        px={2}
        py={1}
        width={300}
        mb={2}
        boxShadow={1}
      >
        <SearchIcon sx={{ color: "gray", marginRight: 1 }} />
        <input
          placeholder="Tìm kiếm tên thuốc"
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
            throw error;
          }}
        />
      </Box>
    </div>
  );
}
