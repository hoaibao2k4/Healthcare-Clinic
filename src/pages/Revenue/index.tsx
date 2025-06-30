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
import BarChartIcon from "@mui/icons-material/BarChart";
import { TextField, MenuItem, Typography } from "@mui/material";
import {
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowId,
  GridRowModel,
  GridSlotProps,
} from "@mui/x-data-grid";
import { toast } from "react-toastify";
import {
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

function validateRevenueInputs(
  month: number,
  year: number,
  MIN_YEAR: number,
  MAX_YEAR: number
): boolean {
  if (month < 1 || month > 12) {
    toast.error("Tháng phải từ 1 đến 12", { position: "bottom-right" });
    return false;
  }
  if (year < MIN_YEAR || year > MAX_YEAR) {
    toast.error(`Năm không hợp lệ (${MIN_YEAR}-${MAX_YEAR})`, {
      position: "bottom-right",
    });
    return false;
  }
  return true;
}

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
        title="Thêm dòng"
      ></Button>
    </GridToolbarContainer>
  );
}

export default function RevenuePage() {
  const today = new Date();
  const MIN_YEAR = 1900;
  const MAX_YEAR = new Date().getFullYear() + 5;
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [rows, setRows] = useState<DayReport[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [showChart, setShowChart] = useState<boolean>(true);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const handleFetch = async (showToast = true) => {
    if (!validateRevenueInputs(month, year, MIN_YEAR, MAX_YEAR)) return;
    try {
      console.log(month);
      const res = await getRevenueReport(month, year);
      console.log("API response: ", res);

      const dayReports: DayReport[] = res[0]?.dayReports || [];
      console.log("dayReports API:", dayReports);

      //
      // const calculatedTotal = dayReports.reduce(
      //   (acc, item) => acc + (item.revenue || 0),
      //   0
      // );

      // const formatted = dayReports.map((item, index) => {
      //   const ratio = calculatedTotal > 0 ? item.revenue / calculatedTotal : 0;

      //   return {
      //     ...item,
      //     id: (index + 1).toString(),
      //     ratio,
      //   };
      // });

      // formatted.sort(
      //   (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      // );

      // setRows(formatted);
      // setTotalRevenue(calculatedTotal);

      //

      const formatted = dayReports.map((item, index) => ({
        ...item,
        id: (index + 1).toString(),
      }));
      const allRevenue = dayReports.reduce(
        (total, current) => total + current.revenue,
        0
      );
      setRows(formatted);
      setTotalRevenue(allRevenue || 0);

      if (formatted.length === 0 && showToast) {
        toast.info("No revenue data found", {
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

      if (
        !navigator.onLine ||
        (err.message && err.message.includes("Failed to fetch"))
      ) {
        console.error("Network error or CORS issue:", err.message);
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.", {
          position: "bottom-right",
          autoClose: 3000,
        });
        return;
      } else {
        console.error("Unexpected error:", err.message || err);
        toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.", {
          position: "bottom-right",
          autoClose: 3000,
        });
        return;
      }
    }
  };

  // useEffect(() => {
  //   if (!rows || rows.length === 0) return;

  //   const calculatedTotal = rows.reduce(
  //     (acc, item) => acc + (item.revenue || 0),
  //     0
  //   );

  //   const updatedRows = rows.map((item) => ({
  //     ...item,

  //     ratio: calculatedTotal > 0 ? item.revenue / calculatedTotal : 0,
  //   }));

  //   setTotalRevenue(calculatedTotal);
  //   console.log("Rows updated from local calculation:", updatedRows);
  //   setRows(updatedRows);
  // }, [JSON.stringify(rows)]);
  //

  useEffect(() => {
    handleFetch(false);
  }, [month, year]);

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
    console.log("Row updated: ", newRow);
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newRow.date)) {
      toast.error(
        "Ngày không hợp lệ. Vui lòng nhập theo định dạng yyyy-MM-dd",
        {
          position: "bottom-right",
          autoClose: 3000,
        }
      );
      throw new Error("Invalid date format");
    }
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
      description: "yyyy-MM-dd",
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
    // {
    //   field: "actions",
    //   type: "actions",
    //   cellClassName: "actions",
    //   headerName: "Thao tác",
    //   width: 100,
    //   getActions: (params) => {
    //     const isInEditMode =
    //       rowModesModel[params.id]?.mode === GridRowModes.Edit;
    //     const actions = [];
    //     if (isInEditMode) {
    //       actions.push(
    //         <GridActionsCellItem
    //           icon={<SaveIcon />}
    //           label="Save"
    //           sx={{
    //             color: "primary.main",
    //           }}
    //           onClick={handleSaveClick(params.id)}
    //         />,
    //         <GridActionsCellItem
    //           icon={<CancelIcon />}
    //           label="Cancel"
    //           className="textPrimary"
    //           onClick={handleCancelClick(params.id)}
    //           color="inherit"
    //         />
    //       );
    //     } else {
    //       actions.push(
    //         <GridActionsCellItem
    //           icon={<EditIcon />}
    //           label="Edit"
    //           className="textPrimary"
    //           onClick={handleEditClick(params.id)}
    //           color="inherit"
    //         />,
    //         <GridActionsCellItem
    //           icon={<DeleteIcon />}
    //           label="Delete"
    //           onClick={handleDeleteClick(params.id)}
    //           color="inherit"
    //         />
    //       );
    //     }
    //     return actions;
    //   },
    //},
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
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            select
            id="month"
            label="Tháng"
            size="small"
            value={month}
            sx={{ width: 100 }}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {i + 1}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="year"
            label="Năm"
            size="small"
            type="number"
            sx={{ width: 100 }}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <Button
            variant="contained"
            onClick={() => handleFetch(true)}
            title="Tìm kiếm dữ liệu"
            sx={{
              minWidth: 40,
              minHeight: 40,
              padding: 0,
              borderRadius: 2,
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            <SearchIcon sx={{ color: "white", fontSize: 20 }} />
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowChart(!showChart)}
            title="Xem biểu đồ doanh thu"
            sx={{
              minWidth: 40,
              minHeight: 40,
              padding: 0,
              borderRadius: 2,
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            <BarChartIcon sx={{ color: "white", fontSize: 20 }} />
          </Button>
        </Box>
        <TextField
          label="Tổng doanh thu"
          size="small"
          value={`${totalRevenue.toLocaleString("vi-VN")} đ`}
          variant="outlined"
          slotProps={{
            input: {
              readOnly: true,
              style: {
                fontWeight: "bold",
                color: "#1976d2",
              },
            },
          }}
          sx={{ width: 180 }}
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
              data={[...rows].sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )}
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
