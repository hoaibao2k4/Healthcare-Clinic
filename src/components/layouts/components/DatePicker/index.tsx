import { useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface DateProps {
  value?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  defaultValue?: Dayjs | null;
  disable?: boolean
}

export default function BasicDatePicker({ value, onChange, defaultValue, disable }: DateProps) {
  const isControlled = value !== undefined && onChange !== undefined;
  const [internalValue, setInternalValue] = useState<Dayjs | null>(defaultValue ?? dayjs());

  const handleChange = (newValue: Dayjs | null) => {
    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DatePicker']}>
        <DatePicker
          label="Ngày khám"
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          format="DD/MM/YYYY"
          sx={{ width: '100%', height: 60 }}
          disabled={disable}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
