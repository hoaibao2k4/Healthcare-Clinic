import * as React from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import { getSystemSettings, saveSystemSettings } from "@/api/apiSettings";
import { SettingItem } from "@/types/settings";

export default function SettingsPage() {
  const [numberPatientMax, setNumberPatientMax] = React.useState(40);
  const [examFee, setExamFee] = React.useState(30000);
  const [drugFeePercent, setDrugFeePercent] = React.useState(1);

  const fetchSettings = async () => {
    try {
      const data = await getSystemSettings();
      data.map((item: any) => {
        setNumberPatientMax(item.numberPatientMax);
        setExamFee(item.examFee);
        setDrugFeePercent(drugFeePercent);
      });
      console.log(data)

      const map = Object.fromEntries(data.map((s: any) => [s.key, s.value]));
      if (map["numberPatientMax"] !== undefined) {
        setNumberPatientMax(data[0].numberPatientMax);
      }
      if (map["examFee"] !== undefined) {
        setExamFee(Number(map["examFee"]));
      }
      if (map["drugFeePercent"] !== undefined) {
        setDrugFeePercent(Number(map["drugFeePercent"]));
      }
    } catch (err) {
      console.error("Lỗi khi load cấu hình:", err);
      toast.error("Không thể tải cấu hình hệ thống", {
        position: "bottom-right",
        autoClose: 2000,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (
      numberPatientMax <= 0 ||
      examFee < 0 ||
      drugFeePercent < 0 ||
      drugFeePercent > 100
    ) {
      toast.error("Giá trị không hợp lệ. Kiểm tra các trường nhập.", {
        position: "bottom-right",
        autoClose: 2000,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const payload: SettingItem[] = [
      { key: "numberPatientMax", value: numberPatientMax.toString() },
      { key: "examFee", value: examFee.toString() },
      { key: "drugFeePercent", value: drugFeePercent.toString() },
    ];

    try {
      await saveSystemSettings(payload);
      toast.success("Đã lưu cấu hình thành công!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Lỗi khi lưu cấu hình:", err);
      toast.error("Không thể lưu cấu hình hệ thống", {
        position: "bottom-right",
        autoClose: 2000,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <Box className="bg-white p-4 rounded-2xl" sx={{ maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Cài đặt hệ thống
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Stack spacing={3}>
          <TextField
            label="Số bệnh nhân tối đa mỗi ngày"
            type="number"
            fullWidth
            value={numberPatientMax}
            onChange={(e) => setNumberPatientMax(Number(e.target.value))}
            slotProps={{
              input: {
                inputProps: {
                  min: 0,
                  inputMode: "numeric",
                },
              },
            }}
          />
          <TextField
            label="Tiền khám (VNĐ)"
            type="number"
            fullWidth
            value={examFee}
            onChange={(e) => setExamFee(Number(e.target.value))}
            slotProps={{
              input: {
                inputProps: {
                  min: 0,
                  inputMode: "numeric",
                },
              },
            }}
          />
          <TextField
            label="Tỉ lệ phần trăm phụ phí thuốc (%)"
            type="number"
            fullWidth
            value={drugFeePercent}
            onChange={(e) => setDrugFeePercent(Number(e.target.value))}
            slotProps={{
              input: {
                inputProps: {
                  min: 0,
                  inputMode: "numeric",
                },
              },
            }}
          />
          <Button variant="contained" onClick={handleSave}>
            Lưu cài đặt
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
