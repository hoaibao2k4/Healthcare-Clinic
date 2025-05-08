import  { useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface DateProps {
  defaultValue?: dayjs.Dayjs | null
}
export default function BasicDatePicker({defaultValue} : DateProps) {
  const [value, setValue] = useState<dayjs.Dayjs | null>(defaultValue ?? dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DatePicker']}>
        <DatePicker
          label="Ngày khám"
          value={value}
          onChange={(newValue) => setValue(newValue)}
          format="DD/MM/YYYY"
          sx={{ width: '100%', height: 60 }}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
