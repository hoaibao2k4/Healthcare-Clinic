import { PieChart } from '@mui/x-charts/PieChart';

export default function BasicPie() {
  return (
    <PieChart
      series={[
        {
          data: [
            { id: 0, value: 10, label: 'series A' },
            { id: 1, value: 15, label: 'series B' },
            { id: 2, value: 20, label: 'series C' },
          ],
          innerRadius: 30,
          outerRadius: 100,
          //paddingAngle: 5,
          //cornerRadius: 5,
          //startAngle: -45,
          //endAngle: 225,
          //cx: 150,
          //cy: 150,
        },
      ]}
      width={200}
      height={250}
    />
  );
}