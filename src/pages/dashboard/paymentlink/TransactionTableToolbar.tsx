import { Stack, InputAdornment, TextField, Button, Grid, IconButton, Tooltip } from '@mui/material';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startDate: string;
  endDate: string;
  onChangeStartDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeEndDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyFilter: VoidFunction;
  onResetFilter: VoidFunction;
};

export default function TransactionTableToolbar({
  filterName,
  onFilterName,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onApplyFilter,
  onResetFilter,
}: Props) {
  // Optional: Allows users to press "Enter" to trigger the filter button
  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onApplyFilter();
    }
  };

  return (
    <Stack
      spacing={2}
      sx={{
        px: { xs: 2, md: 2.5 },
        py: 3,
        width: '100%',
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Date Range Fields */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            label="From Date"
            type="date"
            value={startDate}
            onChange={onChangeStartDate}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            label="To Date"
            type="date"
            value={endDate}
            onChange={onChangeEndDate}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Search Field */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            value={filterName}
            onChange={onFilterName}
            onKeyUp={handleKeyUp}
            placeholder="Search by Title or ID..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12} md={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="ic:round-filter-list" />}
              onClick={onApplyFilter}
              sx={{ height: 56, fontWeight: 'bold' }}
            >
              Filter
            </Button>

            <Tooltip title="Reset Filters">
              <IconButton
                onClick={onResetFilter}
                sx={{
                  height: 56,
                  width: 56,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Iconify icon="eva:refresh-fill" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
