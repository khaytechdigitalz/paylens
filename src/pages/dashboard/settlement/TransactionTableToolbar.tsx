import { Stack, InputAdornment, TextField, Button } from '@mui/material';
import Iconify from '../../../components/iconify';

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startDate: string;
  endDate: string;
  onChangeStartDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeEndDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyFilter: () => void;
  onResetFilter: () => void;
};

export function TransactionTableToolbar({
  filterName,
  onFilterName,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onApplyFilter,
  onResetFilter,
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
        sx={{ maxWidth: { md: 200 } }}
      />

      <TextField
        fullWidth
        label="End Date"
        type="date"
        value={endDate}
        onChange={onChangeEndDate}
        InputLabelProps={{ shrink: true }}
        sx={{ maxWidth: { md: 200 } }}
      />

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search by Reference, Batch or ID..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      <Stack direction="row" spacing={1} flexShrink={0} sx={{ width: { xs: 1, md: 'auto' } }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Iconify icon="ic:round-filter-list" />}
          onClick={onApplyFilter}
        >
          Filter
        </Button>

        <Button
          fullWidth
          variant="soft"
          color="error"
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:refresh-outline" />}
        >
          Reset
        </Button>
      </Stack>
    </Stack>
  );
}

export default TransactionTableToolbar;
