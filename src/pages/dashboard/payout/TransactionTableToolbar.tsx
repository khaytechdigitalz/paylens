import { Stack, InputAdornment, TextField } from '@mui/material';
import Iconify from '../../../components/iconify';

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startDate: string; // Changed to string for native input
  endDate: string;
  onChangeStartDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeEndDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TransactionTableToolbar({
  filterName,
  onFilterName,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
}: Props) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{ xs: 'column', md: 'row' }}
      sx={{ px: 2.5, py: 3 }}
    >
      <TextField
        fullWidth
        label="Start Date"
        type="date"
        value={startDate}
        onChange={onChangeStartDate}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        label="End Date"
        type="date"
        value={endDate}
        onChange={onChangeEndDate}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search by Reference ID..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}
