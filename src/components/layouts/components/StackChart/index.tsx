import Box from '@mui/material/Box';
import { BarChart } from '@mui/x-charts/BarChart';

const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const getSeries = () => [
  {
    label: 'Dưới 18',
    data: [20, 35, 30, 45, 50, 40, 25],
    stack: 'total',
    color: '#90caf9', // light blue
  },
  {
    label: '18-34',
    data: [15, 20, 25, 30, 28, 22, 18],
    stack: 'total',
    color: '#a5d6a7', // light green
  },
  {
    label: '35-55',
    data: [10, 15, 20, 25, 30, 35, 20],
    stack: 'total',
    color: '#f48fb1', // light pink
  },
  {
    label: 'Trên 55',
    data: [8, 12, 15, 18, 20, 15, 10],
    stack: 'total',
    color: '#ffe082', // light yellow-orange
  },
];

export default function PatientBarChartByWeekday() {
  return (
    <Box sx={{ width: '100%', maxWidth: 700, margin: 'auto' }}>
      <h3 className='text-center font-bold'>Số lượng bệnh nhân theo ngày trong tuần</h3>
      <BarChart
        height={350}
        xAxis={[{ scaleType: 'band', data: weekdays }]}
        series={getSeries()}
      />
    </Box>
  );
}
