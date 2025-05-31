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
  Legend,
} from "recharts";
import { getRevenueReport } from "@/api/apiReport";
import { DayReport, Revenue } from "@/types/report";

function EditToolbar(props: GridSlotProps["toolbar"]) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Math.floor(Math.random() * 100).toString();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        date: "",
        numberOfPatients: 0,
        revenue: 0,
        ratio: 0,
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "date" },
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

export default function RevenuePage() {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [rows, setRows] = useState<DayReport[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [showChart, setShowChart] = useState<boolean>(true);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const handleFetch = async (showToast = true) => {
    try {
      const res: Revenue = await getRevenueReport(month, year.toString());

      const dayReports = res?.dayReports || [];

      const formatted = dayReports.map((item, index) => ({
        ...item,
        id: (index + 1).toString(),
      }));

      setRows(formatted);
      setTotalRevenue(res?.totalRevenue || 0);

      if (formatted.length === 0 && showToast) {
        toast.info("Không có dữ liệu doanh thu", {
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

  useEffect(() => {
    handleFetch(false);
  }, []);
  const handleEditClick = (id: GridRowId) => {
    return () => {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };
  };

  const handleSaveClick = (id: GridRowId) => {
    return () => {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };
  };

  const handleDeleteClick = (id: GridRowId) => {
    return async () => {
      try {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));

        toast.success("Đã xóa dòng", {
          position: "bottom-right",

          autoClose: 2000,

          hideProgressBar: false,

          closeOnClick: true,

          pauseOnHover: true,

          draggable: true,

          progress: undefined,
        });
      } catch (err: any) {
        console.error("Xóa thất bại: ", err);
        if (err.name === "TypeError") {
          console.error("Network error or CORS issue:", err.message);
        } else {
          console.error("Unexpected error:", err.message || err);
        }
      }
    };
  };

  const handleCancelClick = (id: GridRowId) => {
    return () => {
      setRowModesModel({
        ...rowModesModel,

        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      });

      const editedRow = rows.find((row) => row.id === id);

      if (editedRow?.isNew) {
        setRows(rows.filter((row) => row.id !== id));
      }
    };
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };
  const processRowUpdate = (newRow: GridRowModel) => {
    try {
      const updatedRow: DayReport = { ...(newRow as DayReport), isNew: false };

      setRows((prevRows) =>
        prevRows.map((row) => (row.id === newRow.id ? updatedRow : row))
      );

      toast.success("Đã cập nhật dòng", {
        position: "bottom-right",

        autoClose: 2000,

        hideProgressBar: false,

        closeOnClick: true,

        pauseOnHover: true,

        draggable: true,

        progress: undefined,
      });

      return updatedRow;
    } catch (err: any) {
      console.error("Cập nhật dòng thất bại:", err);

      if (err.name === "TypeError") {
        console.error("Network error or CORS issue:", err.message);
      } else {
        console.error("Unexpected error:", err.message || err);
      }

      toast.error("Cập nhật dòng thất bại", {
        position: "bottom-right",

        autoClose: 2000,

        hideProgressBar: false,

        closeOnClick: true,

        pauseOnHover: true,

        draggable: true,

        progress: undefined,
      });

      return newRow;
    }
  };
  const setRowsFromGrid = (
    updater: (oldRows: readonly GridRowModel[]) => readonly GridRowModel[]
  ) => {
    setRows((prevRows) => updater(prevRows) as DayReport[]);
  };

  const setRowModesModelFromGrid = (
    model: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => {
    setRowModesModel(model);
  };

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Ngày",
      type: "string",
      width: 180,
      editable: true,
    },
    {
      field: "numberOfPatients",
      headerName: "Số bệnh nhân",
      type: "number",
      width: 180,
      editable: true,
    },
    {
      field: "revenue",
      headerName: "Doanh thu",
      type: "number",
      width: 180,
      editable: true,
    },
    {
      field: "ratio",
      headerName: "Tỉ lệ",
      type: "number",
      width: 180,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      cellClassName: "actions",
      headerName: "Thao tác",
      width: 100,
      getActions: (params) => {
        const isInEditMode =
          rowModesModel[params.id]?.mode === GridRowModes.Edit;
        const actions = [];
        if (isInEditMode) {
          actions.push(
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(params.id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(params.id)}
              color="inherit"
            />
          );
        } else {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(params.id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={handleDeleteClick(params.id)}
              color="inherit"
            />
          );
        }
        return actions;
      },
    },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl">
      <Box
        mb={2}
        display="flex"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h6" color="primary">
          Tổng doanh thu: {totalRevenue.toLocaleString("vi-VN")} đ
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
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
          rowModesModel={rowModesModel}
          editMode="row"
          onRowModesModelChange={handleRowModesModelChange}
          processRowUpdate={processRowUpdate}
          disableRowSelectionOnClick
          hideFooterPagination
          slots={{ toolbar: EditToolbar }}
          slotProps={{
            toolbar: {
              setRows: setRowsFromGrid,
              setRowModesModel: setRowModesModelFromGrid,
            },
          }}
        />
      </Box>
      {showChart && (
        <Box width="100%">
          <Typography variant="subtitle1" gutterBottom textAlign="center">
            Doanh thu theo ngày trong tháng
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={rows}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1976d2"
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </div>
  );
}
