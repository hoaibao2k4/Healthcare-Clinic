import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { TextField, MenuItem, Typography } from "@mui/material";
import {
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
} from "@mui/x-data-grid";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  deleteDrugUnit,
  getAllDrugUnits,
  initialDrugUnit,
  updateDrugUnit,
} from "@/api/apiDrug";

import { getDrugsReport } from "@/api/apiReport";
import { Drug } from "@/types/drug";
import { DrugReport } from "@/types/report";

function EditToolbar({
  setRows,
  setRowModesModel,
  idNew,
  setIdNew,
}: {
  setRows: React.Dispatch<React.SetStateAction<any[]>>;

  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;

  idNew: number;

  setIdNew: React.Dispatch<React.SetStateAction<number>>;
}) {
  const handleClick = () => {
    const newId = idNew + 1;
    setIdNew(newId);
    setRows((oldRows) => [
      ...oldRows,
      {
        id: newId,
        drugId: 0,
        drugName: "",
        unitName: "",
        usedNumber: 0,
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [newId]: { mode: GridRowModes.Edit, fieldToFocus: "drugName" },
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

export default function DrugUsagePage() {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [rows, setRows] = useState<any[]>([]);
  const [topUsed, setTopUsed] = useState<any[]>([]);
  const [topN, setTopN] = useState<number>(10);
  const [showChart, setShowChart] = useState<boolean>(true);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [idNew, setIdNew] = useState<number>(1);

  useEffect(() => {
    handleFetch(false);
    fetchDrugUnit();
  }, []);
  const fetchDrugUnit = async () => {
    try {
      const res = await getAllDrugUnits();
      console.log("Danh sách đơn vị thuốc:", res.data);
    } catch (err: any) {
      console.error("Fetch API failed:", err);
      if (err.name === "TypeError") {
        console.error("Network error or CORS issue:", err.message);
      } else {
        console.error("Unexpected error:", err.message || err);
      }
    }
  };

  const handleFetch = async (showToast = true) => {
    try {
      const res = await getDrugsReport(month, year);
      const formatted = Array.isArray(res)
        ? res.map((item: any, index: number) => ({
            id: index + 1,
            drugId: item.drug?.drugId,
            drugName: item.drug?.drugName,

            unitName: item.drug?.drugsUnit?.unitName,

            usedNumber: item.usageNumber,

            isNew: false,
          }))
        : [];

      setRows(formatted);
      const sorted = [...formatted]
        .sort((a, b) => b.usedNumber - a.usedNumber)

        .slice(0, topN);

      setTopUsed(sorted);
      if (formatted.length === 0 && showToast) {
        toast.info("Không có dữ liệu sử dụng thuốc", {
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
      console.error("API Request Failed:", err);
    }
  };

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
      const unitId = rows.find((row) => row.id === id)?.unitId;
      console.log("unitId", unitId);
      try {
        const res = await deleteDrugUnit(unitId);
        if (res) {
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
    if (editedRow?.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };
  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow: DrugUnit = { ...(newRow as DrugUnit), isNew: false };
    try {
      if (newRow.isNew) {
        const res = await initialDrugUnit(updatedRow as DrugUnit);
        updatedRow.unitId = res.unitId;
        if (res)
          toast.success("Thêm đơn vị thành công", {
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
          toast.success("Cập nhật đơn vị thành công", {
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
      console.error("API update error:", err);
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
    { field: "drugId", headerName: "Mã thuốc", width: 120, editable: true },
    {
      field: "drugName",
      headerName: "Tên thuốc",
      width: 180,
      editable: true,
    },
    {
      field: "unitName",
      headerName: "Đơn vị tính",
      type: "string",
      width: 180,
      editable: true,
    },
    {
      field: "usedNumber",
      headerName: "Số lượng dùng",
      type: "string",
      width: 180,
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
      <Box mb={2} display="flex" gap={2} alignItems="center">
        <TextField
          select
          label="Tháng"
          size="small"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {[...Array(12)].map((_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              Tháng {i + 1}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Năm"
          size="small"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />

        <Button variant="contained" onClick={() => handleFetch(true)}>
          Xem báo cáo
        </Button>

        <Button variant="outlined" onClick={() => setShowChart(!showChart)}>
          {showChart ? "Ẩn biểu đồ" : "Hiện biểu đồ"}
        </Button>
      </Box>

      <Box
        sx={{
          height: 500,

          width: "100%",

          mb: 4,

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
            toolbar: { setRows, setRowModesModel, idNew, setIdNew },
          }}
          onProcessRowUpdateError={(error) => {
            console.error("Row update error:", error);
          }}
        />
      </Box>
      {showChart && (
        <Box width="100%">
          <Box
            mb={1}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="subtitle1"
              gutterBottom
              textAlign="center"
              sx={{ flexGrow: 1 }}
            >
              Top {topN} thuốc sử dụng nhiều nhất
            </Typography>
            <TextField
              label="Top N"
              size="small"
              type="number"
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              sx={{ width: 100 }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topUsed}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="drugName" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="usedNumber" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </div>
  );
}
