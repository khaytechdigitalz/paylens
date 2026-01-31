import { Stack, InputAdornment, TextField, MenuItem, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from '../../../components/iconify';

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filterStatus: string;
  onFilterStatus: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startDate: string;
  endDate: string;
  onChangeStartDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeEndDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterClick: () => void;
  onClearFilter: () => void;
  loading?: boolean;
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

export function TransactionTableToolbar({
  filterName,
  onFilterName,
  filterStatus,
  onFilterStatus,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onFilterClick,
  onClearFilter,
  loading,
}: Props) {
  return (
    <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ px: 2.5, py: 3 }}>
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

      <TextField fullWidth select label="Status" value={filterStatus} onChange={onFilterStatus}>
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search Reference..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      <Stack direction="row" spacing={1} sx={{ shrink: 0 }}>
        <Button color="error" variant="soft" onClick={onClearFilter} sx={{ height: 56, px: 2 }}>
          <Iconify icon="solar:restart-bold" />
        </Button>

        <LoadingButton
          variant="contained"
          loading={loading}
          onClick={onFilterClick}
          startIcon={<Iconify icon="solar:filter-bold" />}
          sx={{ height: 56, px: 3, whiteSpace: 'nowrap' }}
        >
          Filter
        </LoadingButton>
      </Stack>
    </Stack>
  );
}

export default TransactionTableToolbar;
