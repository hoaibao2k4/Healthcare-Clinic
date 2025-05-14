import * as React from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const [maxPatientsPerDay, setMaxPatientsPerDay] = React.useState(30);
  const [examFee, setExamFee] = React.useState(50000);
  const [maxDiseases, setMaxDiseases] = React.useState(50);
  const [maxDrugs, setMaxDrugs] = React.useState(100);
  const [maxUnits, setMaxUnits] = React.useState(20);
  const [maxUsages, setMaxUsages] = React.useState(10);

  const handleSave = () => {
    toast.success("Đã lưu cấu hình hệ thống!", {
      position: "bottom-right",
      autoClose: 2000,
    });

    console.log("Cấu hình mới:", {
      maxPatientsPerDay,
      examFee,
      maxDiseases,
      maxDrugs,
      maxUnits,
      maxUsages,
    });
  };

  return (
    <Box className="bg-white p-4 rounded-2xl" sx={{ maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>
        Cài đặt hệ thống
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Stack spacing={3}>
          <Typography fontWeight="bold">Quy định khám bệnh</Typography>
          <TextField
            label="Số bệnh nhân tối đa mỗi ngày"
            type="number"
            value={maxPatientsPerDay}
            onChange={(e) => setMaxPatientsPerDay(Number(e.target.value))}
          />
          <TextField
            label="Tiền khám (VNĐ)"
            type="number"
            value={examFee}
            onChange={(e) => setExamFee(Number(e.target.value))}
          />

          <Divider />

          <Typography fontWeight="bold">Giới hạn số lượng danh mục</Typography>
          <TextField
            label="Số loại bệnh"
            type="number"
            value={maxDiseases}
            onChange={(e) => setMaxDiseases(Number(e.target.value))}
          />
          <TextField
            label="Số loại thuốc"
            type="number"
            value={maxDrugs}
            onChange={(e) => setMaxDrugs(Number(e.target.value))}
          />
          <TextField
            label="Số đơn vị thuốc"
            type="number"
            value={maxUnits}
            onChange={(e) => setMaxUnits(Number(e.target.value))}
          />
          <TextField
            label="Số cách dùng"
            type="number"
            value={maxUsages}
            onChange={(e) => setMaxUsages(Number(e.target.value))}
          />

          <Button variant="contained" onClick={handleSave}>
            Lưu cài đặt
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
