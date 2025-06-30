import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { useLocation } from "react-router-dom";
import { Disease, ExaminationDetail, Patient } from "@/types";
import { MenuItem } from "@mui/material";

import { Drug } from "@/types/drug";
import { predictorVitaminD, updateExam, updateRecordExam } from "@/api/apiExam";
import { toast } from "react-toastify";
import { randomId } from "@mui/x-data-grid-generator";
import {
  createQuestionaire,
  getAllLabs,
  updatePatientLab,
} from "@/api/apiVitaminD";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAllPatients } from "@/api/apiPatients";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}
// function EditToolbar(props: GridSlotProps["toolbar"]) {
//   const { setRows, setRowModesModel } = props;

//   const handleClick = () => {
//     const id = randomId();
//     setRows((oldRows) => [
//       ...oldRows,
//       { id, drugId: null, quantity: 0, note: "", isNew: true, drugs: null },
//     ]);
//     setRowModesModel((oldModel) => ({
//       ...oldModel,
//       [id]: { mode: GridRowModes.Edit, fieldToFocus: "drugName" },
//     }));
//   };

//   return (
//     <GridToolbarContainer>
//       {/* <Button
//         color="primary"
//         startIcon={<AddIcon />}
//         size="large"
//         onClick={handleClick}
//       ></Button> */}
//     </GridToolbarContainer>
//   );
// }
interface VitaminD {
  vitamin_d_deficiency: number;
  probability: number;
}
const initialRows: GridRowsProp = [
  // {
  //   id: randomId(),
  //   name: "MeanCellVolumn",
  //   result: 83.2,
  //   unit: "fL",
  // },
  // {
  //   id: randomId(),
  //   name: "fastingGlucose",
  //   result: 95,
  //   unit: "mg/dL",
  // },
  {
    id: randomId(),
    name: "RedCellDistributionWidth",
    result: 13.1,
    unit: "%",
  },
  {
    id: randomId(),
    name: "Hemoglobin",
    result: 15.4,
    unit: "mg/dL",
  },
  {
    id: randomId(),
    name: "Tryglycerides",
    result: 77,
    unit: "mg/dL",
  },
  {
    id: randomId(),
    name: "Creatinine",
    result: 0.73,
    unit: "mg/dL",
  },
  {
    id: randomId(),
    name: "HDLCholesterol",
    result: 48,
    unit: "mg/dL",
  },
];

const raceList = [
  {
    raceName: "Người Châu Á",
    raceId: 1,
  },
  {
    raceName: "Người Châu Âu",
    raceId: 2,
  },
  {
    raceName: "Người Châu Mĩ",
    raceId: 3,
  },
  {
    raceName: "Người Châu Phi",
    raceId: 4,
  },
  {
    raceName: "Chủng tộc khác",
    raceId: 5,
  },
];

const milkList = [
  {
    milkFrequency: "Không uống",
    milkId: 0,
  },
  {
    milkFrequency: "Hiếm khi uống (1 lần/ tuần)",
    milkId: 1,
  },
  {
    milkFrequency: "Thỉnh thoảng uống",
    milkId: 2,
  },
  {
    milkFrequency: "Thường xuyên uống",
    milkId: 3,
  },
];

const smokeList = [
  {
    smokeId: 1,
    label: "Có",
  },
  {
    smokeId: 0,
    label: "Không",
  },
];

interface IRecord {
  patient: Patient;
}
interface Laboratory {
  id?: number;
  labName: string;
  result: number;
  unit: string;
  isNew?: boolean;
}

export default function BloodRecord({ patient }: IRecord) {
  const [rows, setRows] = React.useState<GridRowsProp>(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [patients, setPatients] = useState<number>();
  const [drugs, setDrugs] = useState<Drug[] | null>([]);
  const [race, setRace] = useState("");
  const [milk, setMilk] = useState("");
  const [smoke, setSmoke] = useState("");
  const [selectedPIR, setSelectedPIR] = useState(0);
  const [selectedBMI, setSelectedBMI] = useState(0);
  const [vitaminD, setVitaminD] = useState<number | null>(null);

  const permissionUser = useSelector(
    (state: RootState) => state.permission.login.currentUser
  );

  useEffect(() => {
    const fetchLaboratory = async () => {
      try {
        const patientDB = await getAllPatients();
        const patientId = patientDB.data.find(
          (item: Patient) => item.fullName === patient.fullName
        ).patientId;
        setPatients(patientId);
        if (permissionUser && permissionUser.accessToken) {
          const res = await getAllLabs(permissionUser.accessToken, patientId);
          const dataWithId = res.map((item: Laboratory) => ({
            ...item,
            id: randomId(),
          }));
          setRows(dataWithId);
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
    fetchLaboratory();
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
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
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

  const processRowUpdate = (newRow: GridRowModel) => {
    const selectedDrug = drugs?.find((drug) => drug.drugId === newRow.drugId);
    const updatedRow: ExaminationDetail = {
      ...(newRow as ExaminationDetail),
      isNew: false,
      drugs: selectedDrug!,
    };

    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    toast.success("Thêm thuốc thành công", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handlePredictRecord = async () => {
    const age = 2026 - Number(patient.yearOfBirth);
    const inputData: any = {
      BMI: selectedBMI,
      PIR: selectedPIR,
      smokeFam: smoke,
      milkConsumption: milk,
      race: race,
      age: age,
      gender: patient.gender ? 1 : 0,
    };

    (rows as Laboratory[]).forEach((item) => {
      if (item.labName === "MeanCellVolumn") {
        inputData.meanCellVolumn = item.result;
      } else if (item.labName === "RedCellDistributionWidth") {
        inputData.redCellDistributionWidth = item.result;
      } else if (item.labName === "Hemoglobin") {
        inputData.hemoglobin = item.result;
      } else if (item.labName === "Tryglycerides") {
        inputData.tryglycerides = item.result;
      } else if (item.labName === "Creatinine") {
        inputData.creatinine = item.result;
      } else if (item.labName === "HDLCholesterol") {
        inputData.HDLCholesterol = item.result;
      } else if (item.labName === "fastingGlucose") {
        inputData.fastingGlucose = item.result;
      }
    });
    if (permissionUser && permissionUser.accessToken && patients) {
      const updatePatient = await updatePatientLab(
        permissionUser.accessToken,
        patients,
        selectedBMI,
        selectedPIR,
        Number(race)
      );
      console.log(">>>>>update Lab: ", updatePatient);

      const createQuestion = await createQuestionaire(
        permissionUser.accessToken,
        patients,
        Number(milk),
        Boolean(smoke)
      );
      console.log(">>>ques: ", createQuestion);
    }

    console.log(">>>>>>input: ", inputData);
    const res = await predictorVitaminD(inputData);
    const result: VitaminD = res;
    console.log(">>>>res: ", res);
    setVitaminD(result.probability);
  };

  const columns: GridColDef[] = [
    {
      field: "labName",
      headerName: "Tên xét nghiệm",
      width: 500,
      editable: true,
    },
    {
      field: "result",
      headerName: "Kết quả",
      type: "string",
      width: 200,
      align: "left",
      headerAlign: "left",
      editable: false,
    },
    {
      field: "unit",
      headerName: "Đơn vị",
      width: 240,
      editable: true,
      type: "string",
    },
    // {
    //   field: "actions",
    //   type: "actions",
    //   headerName: "Actions",
    //   width: 120,
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
      <div className="flex justify-between w-full">
        <h1 className="text-2xl font-bold p-2 ">Kết quả xét nghiệm</h1>
        <div className="flex">
          <div className="mx-6 my-2">
            <Button variant="contained" onClick={handlePredictRecord}>
              Dự đoán Vitamin D
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 pb-4">
        <TextField
          id="patientName"
          label="Họ tên"
          variant="outlined"
          size="small"
          value={patient?.fullName}
        />
        <TextField
          id="milk"
          label="Thói quen uống sữa"
          variant="outlined"
          size="small"
          select
          value={milk}
          onChange={(e) => setMilk(e.target.value)}
        >
          {milkList?.map((value, index) => (
            <MenuItem key={index} value={value.milkId}>
              {value.milkFrequency}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="race"
          label="Chủng tộc"
          variant="outlined"
          size="small"
          select
          onChange={(e) => setRace(e.target.value)}
          value={race}
        >
          {raceList?.map((value, index) => (
            <MenuItem key={index} value={value.raceId}>
              {value.raceName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="smoke"
          label="Gia đình có người dùng thuốc lá"
          variant="outlined"
          size="small"
          select
          onChange={(e) => setSmoke(e.target.value)}
          value={smoke}
        >
          {smokeList?.map((value, index) => (
            <MenuItem key={index} value={value.smokeId}>
              {value.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="bmi"
          label="BMI"
          variant="outlined"
          size="small"
          type="number"
          onChange={(e) => setSelectedBMI(Number(e.target.value))}
          value={selectedBMI}
        />
        <TextField
          id="pir"
          label="PIR"
          variant="outlined"
          size="small"
          type="number"
          onChange={(e) => setSelectedPIR(Number(e.target.value))}
          value={selectedPIR}
        />
        <div className="py-3 flex ">
          <h2 className="font-bold pr-3">Chẩn đoán: </h2>
          <span>
            {vitaminD === undefined || vitaminD === null
              ? ""
              : `Có ${Math.round(vitaminD * 100)}% khả năng thiếu Vitamin D`}
          </span>
        </div>
      </div>
      <Box
        sx={{
          height: "100%",
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
          //slots={{ toolbar: EditToolbar }}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
      </Box>
    </div>
  );
}
