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
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getDrugsReport } from "@/api/apiReport";
import { getAllDrugUnits } from "@/api/apiDrug";
import { DrugUnit } from "@/types/drug";
import { DrugReport, DrugUsageRow } from "@/types/report";

function validateInputs(month: number, year: number, topN: number): boolean {
  const MAX_YEAR = new Date().getFullYear() + 5;
  if (month < 1 || month > 12) {
    toast.error("Tháng phải từ 1 đến 12", { position: "bottom-right" });
    return false;
  }
  if (year < 1900 || year > MAX_YEAR) {
    toast.error(`Năm không hợp lệ (1900-${MAX_YEAR})`, {
      position: "bottom-right",
    });
    return false;
  }
  if (topN <= 0) {
    toast.error("Giá trị Top N phải lớn hơn 0", { position: "bottom-right" });
    return false;
  }
  return true;
}

function EditToolbar(props: GridSlotProps["toolbar"]) {
  const { setRows, setRowModesModel } = props;
  const [idNew, setIdNew] = useState<number>(100);
  const handleClick = () => {
    const id = idNew;
    setIdNew(idNew + 1);
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        drugId: 0,
        drugName: "",
        unitName: "",
        usedNumber: 0,
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "usedNumber" },
    }));
  };
  return (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        size="large"
        onClick={handleClick}
        title="Thêm dòng mới"
      ></Button>
    </GridToolbarContainer>
  );
}

export default function DrugUsagePage() {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [rows, setRows] = useState<DrugUsageRow[]>([]);
  const [topUsed, setTopUsed] = useState<DrugUsageRow[]>([]);
  const [topN, setTopN] = useState<number>(10);
  const [showChart, setShowChart] = useState<boolean>(true);
  const [unitOptions, setUnitOptions] = useState<DrugUnit[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  useEffect(() => {
    fetchDrugUnit().then(() => handleFetch(false));
  }, [month, year]);
  const fetchDrugUnit = async () => {
    try {
      const res = await getAllDrugUnits();

      setUnitOptions(res);
    } catch (err: any) {
      console.error("Fetch API failed:", err);
      if (err.name === "TypeError") {
        console.error("Network error or CORS issue:", err.message);
      } else {
        console.error("Unexpected error:", err.message || err);
      }
    }
  };
  let hasShownError = false;
  const handleFetch = async (showToast = true) => {
    if (!validateInputs(month, year, topN)) return;
    try {
      const res : DrugReport[] = await getDrugsReport(month, year);
      console.log(res);
      if (!res || !Array.isArray(res)) {
        if (!hasShownError) {
          toast.error("Invalid API response.", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          hasShownError = true;
        }
        return;
      }
      hasShownError = false;
      const formatted = Array.isArray(res)
        ? res.map((item: DrugReport, index: number) => ({
            id: index + 1,

            drugId: item.drug.drugId ?? 0,

            drugName: item.drug.drugName ?? "",

            unitName: item.drug.drugsUnit?.unitName ?? "",

            usedNumber: item.usageNumber,

            isNew: false,
          }))
        : [];

      console.log(formatted)

      setRows(formatted);
      const sorted = [...formatted]
        .sort((a, b) => b.usedNumber - a.usedNumber)

        .slice(0, topN);

      setTopUsed(sorted);
      // setTopUsed(res?.topUsed || []);
      if (formatted.length === 0 && showToast) {
        toast.info("No drug usage data found", {
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

  const processRowUpdate = async (newRow: GridRowModel) => {
    if (newRow.usedNumber < 0) {
      toast.error("Số lượng sử dụng không được âm", {
        position: "bottom-right",
      });
      throw new Error("Invalid usedNumber");
    }
    const updatedRow: DrugUsageRow = {
      id: newRow.id,

      drugId: newRow.drugId,

      drugName: newRow.drugName,

      unitName: newRow.unitName,

      usedNumber: newRow.usedNumber,

      isNew: false,
    };
    try {
      if (newRow.isNew) {
        toast.success("Thêm thành công", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
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
    } catch (err: any) {
      console.error("API update error:", err);
      if (err.name === "TypeError") {
        console.error("Network error or CORS issue:", err.message);
      } else {
        console.error("Unexpected error:", err.message || err);
      }
    }
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === newRow.id ? updatedRow : row))
    );
    return updatedRow;
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
      try {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));

        toast.success("Xóa thành công", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
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

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };
  const setRowsFromGrid = (
    updater: (oldRows: readonly GridRowModel[]) => readonly GridRowModel[]
  ) => {
    setRows((prevRows) => {
      const result = updater([...prevRows]);
      return result.map((r) => ({ ...r })) as DrugUsageRow[];
    });
  };

  const setRowModesModelFromGrid = (
    model: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => {
    setRowModesModel(model);
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
      type: "singleSelect",
      width: 180,
      valueOptions: Array.isArray(unitOptions)
        ? unitOptions.map((u) => u.unitName)
        : [],
      editable: true,
    },
    {
      field: "usedNumber",
      headerName: "Số lượng dùng",
      type: "string",
      width: 180,
      editable: true,
    },
    // {
    //   field: "actions",
    //   type: "actions",
    //   headerName: "Thao tác",
    //   width: 100,
    //   cellClassName: "actions",

    //   getActions: ({ id }) => {
    //     const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

    //     if (isInEditMode) {
    //       return [
    //         <GridActionsCellItem
    //           icon={<SaveIcon />}
    //           label="Save"
    //           sx={{
    //             color: "primary.main",
    //           }}
    //           onClick={handleSaveClick(id)}
    //         />,
    //         <GridActionsCellItem
    //           icon={<CancelIcon />}
    //           label="Cancel"
    //           className="textPrimary"
    //           onClick={handleCancelClick(id)}
    //           color="inherit"
    //         />,
    //       ];
    //     }

    //     return [
    //       <GridActionsCellItem
    //         icon={<EditIcon />}
    //         label="Edit"
    //         className="textPrimary"
    //         onClick={handleEditClick(id)}
    //         color="inherit"
    //       />,
    //       <GridActionsCellItem
    //         icon={<DeleteIcon />}
    //         label="Delete"
    //         onClick={handleDeleteClick(id)}
    //         color="inherit"
    //       />,
    //     ];
    //   },
    // },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl">
      <Box mb={2} display="flex" gap={2} alignItems="center">
        <TextField
          select
          id="month"
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
          title="Xem biểu đồ sử dụng thuốc"
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
        <DataGrid<DrugUsageRow>
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{ toolbar: EditToolbar }}
          slotProps={{
            toolbar: {
              setRows: setRowsFromGrid,
              setRowModesModel: setRowModesModelFromGrid,
            },
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
              slotProps={{
                input: {
                  inputProps: {
                    min: 1,
                    inputMode: "numeric",
                  },
                },
              }}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val <= 0) {
                  toast.error("Giá trị Top N phải lớn hơn 0", {
                    position: "bottom-right",
                  });
                }
                setTopN(val);
              }}
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
