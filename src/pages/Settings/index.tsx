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
import { getSystemSettings, saveSystemSettings } from "@/api/apiSettings";
import { SystemSettings } from "@/types/settings";

export default function SettingsPage() {
  const [maxPatientsPerDay, setMaxPatientsPerDay] = React.useState(30);
  const [examFee, setExamFee] = React.useState(50000);
  const [maxDiseases, setMaxDiseases] = React.useState(50);
  const [maxDrugs, setMaxDrugs] = React.useState(100);
  const [maxUnits, setMaxUnits] = React.useState(20);
  const [maxUsages, setMaxUsages] = React.useState(10);
  const [settingId, setSettingId] = React.useState<number>(1);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSystemSettings();
        setSettingId(data.id);
        setMaxPatientsPerDay(data.maxPatientsPerDay);
        setExamFee(data.examFee);
        setMaxDiseases(data.maxDiseases);
        setMaxDrugs(data.maxDrugs);
        setMaxUnits(data.maxUnits);
        setMaxUsages(data.maxUsages);
      } catch (err) {
        console.error("Lỗi khi load cấu hình:", err);
        toast.error("Không thể tải cấu hình hệ thống", {
          position: "bottom-right",
          autoClose: 2000,
        });
      }
    };
    fetchSettings();
  }, []);

  const validateSettings = (): boolean => {
    if (
      maxPatientsPerDay <= 0 ||
      examFee < 0 ||
      maxDiseases < 0 ||
      maxDrugs < 0 ||
      maxUnits < 0 ||
      maxUsages < 0
    ) {
      toast.error("Giá trị không hợp lệ. Tất cả phải lớn hơn hoặc bằng 0.", {
        position: "bottom-right",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateSettings()) return;
    const config: SystemSettings = {
      id: settingId,
      maxPatientsPerDay,
      examFee,
      maxDiseases,
      maxDrugs,
      maxUnits,
      maxUsages,
    };

    try {
      await saveSystemSettings(config);
      toast.success("Đã lưu cấu hình hệ thống!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      console.error("Lỗi khi lưu cấu hình:", err);
      toast.error("Không thể lưu cấu hình", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
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
            slotProps={{ input: { inputProps: { min: 0 } } }}
            value={maxPatientsPerDay}
            onChange={(e) => setMaxPatientsPerDay(Number(e.target.value))}
          />
          <TextField
            label="Tiền khám (VNĐ)"
            type="number"
            slotProps={{ input: { inputProps: { min: 0 } } }}
            value={examFee}
            onChange={(e) => setExamFee(Number(e.target.value))}
          />

          <Divider />

          <Typography fontWeight="bold">Giới hạn số lượng danh mục</Typography>
          <TextField
            label="Số loại bệnh"
            type="number"
            slotProps={{ input: { inputProps: { min: 0 } } }}
            value={maxDiseases}
            onChange={(e) => setMaxDiseases(Number(e.target.value))}
          />
          <TextField
            label="Số loại thuốc"
            type="number"
            slotProps={{ input: { inputProps: { min: 0 } } }}
            value={maxDrugs}
            onChange={(e) => setMaxDrugs(Number(e.target.value))}
          />
          <TextField
            label="Số đơn vị thuốc"
            type="number"
            slotProps={{ input: { inputProps: { min: 0 } } }}
            value={maxUnits}
            onChange={(e) => setMaxUnits(Number(e.target.value))}
          />
          <TextField
            label="Số cách dùng"
            type="number"
            slotProps={{ input: { inputProps: { min: 0 } } }}
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
