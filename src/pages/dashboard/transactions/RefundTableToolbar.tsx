import { Stack, InputAdornment, TextField, MenuItem, Button } from '@mui/material';
import Iconify from '../../../components/iconify';

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filterStatus: string;
  onFilterStatus: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filterType: string;
  onFilterType: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startDate: string;
  endDate: string;
  onChangeStartDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeEndDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: VoidFunction;
};

const STATUS_OPTIONS = ['all', 'pending', 'success', 'declined'];

export function RefundTableToolbar({
  filterName,
  onFilterName,
  filterStatus,
  onFilterStatus,
  filterType,
  onFilterType,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onSubmit,
}: Props) {
  // Handle "Enter" key press to submit
  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <Stack spacing={2.5} sx={{ px: 2.5, py: 3 }}>
      {/* Top Row: Type, Status, and Search Reference */}
      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }}>
         
        <TextField
          fullWidth
          select
          label="Status"
          value={filterStatus || 'all'}
          onChange={onFilterStatus}
          sx={{ maxWidth: { md: 160 } }}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          value={filterName}
          onChange={onFilterName}
          onKeyUp={handleKeyUp}
          placeholder="Search Reference..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* Bottom Row: Date Range + Action Button */}
      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: 1 }}>
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
        </Stack>

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<Iconify icon="eva:search-fill" />}
          onClick={onSubmit}
          sx={{
            height: 56,
            whiteSpace: 'nowrap',
            minWidth: { md: 200 },
            width: { md: 'auto' },
          }}
        >
          Search
        </Button>
      </Stack>
    </Stack>
  );
}

export default RefundTableToolbar;
