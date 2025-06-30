import { Box } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

export default function GenderPieChart() {
  return (
    <Box>
      <h3 className="text-center font-bold text-xl">Thống kê Nam/Nữ</h3>
      <PieChart
        series={[
          {
            data: [
              { id: 0, value: 60, label: "Nam", color: "#42a5f5" }, // light blue
              { id: 1, value: 40, label: "Nữ", color: "#f48fb1" }, // pink
            ],
            innerRadius: 40,
            outerRadius: 100,
          },
        ]}
        width={300}
        height={300}
      />
    </Box>
  );
}
