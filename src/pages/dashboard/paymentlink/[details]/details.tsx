/* eslint-disable arrow-body-style */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-alert */
import { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
// @mui
import {
  Grid,
  Card,
  Table,
  Stack,
  Button,
  TableBody,
  Container,
  TableRow,
  TableCell,
  Typography,
  TableContainer,
  Box,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import StatWidget from '../../../../components/widgets/StatWidget';
import { useSettingsContext } from '../../../../components/settings';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../../../components/table';
// utils
import { fDateTime } from '../../../../utils/formatTime';
import { fCurrency } from '../../../../utils/formatNumber';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'customer', label: 'Customer', align: 'left' },
  { id: 'amount', label: 'Amount Paid', align: 'left' },
  { id: 'date', label: 'Payment Date', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'reference', label: 'Reference', align: 'right' },
];

const STATUS_OPTIONS = ['all', 'success', 'failed', 'pending'];

const MOCK_SALES = [
  {
    id: 'txn_001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    amount: 50.0,
    currency: 'USD',
    status: 'success',
    date: '2026-01-10T10:30:00Z',
    reference: 'PL-TRX-9921',
  },
  {
    id: 'txn_002',
    email: 'sarah.smith@provider.net',
    name: 'Sarah Smith',
    amount: 50.0,
    currency: 'USD',
    status: 'success',
    date: '2026-01-12T14:20:00Z',
    reference: 'PL-TRX-9925',
  },
  {
    id: 'txn_003',
    email: 'mike@startup.io',
    name: 'Mike Johnson',
    amount: 50.0,
    currency: 'USD',
    status: 'failed',
    date: '2026-01-15T09:15:00Z',
    reference: 'PL-TRX-9930',
  },
  {
    id: 'txn_004',
    email: 'linda.w@webmail.com',
    name: 'Linda Wong',
    amount: 50.0,
    currency: 'USD',
    status: 'pending',
    date: '2026-01-17T11:45:00Z',
    reference: 'PL-TRX-9942',
  },
];

// ----------------------------------------------------------------------

PaymentLinkDetailsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function PaymentLinkDetailsPage() {
  const { query, back, push } = useRouter();
  const { id } = query;
  const { themeStretch } = useSettingsContext();
  const { page, rowsPerPage, onChangePage, onChangeRowsPerPage } = useTable();

  // Filter States
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const linkInfo = {
    name: 'Standard Consultation',
    totalRevenue: 600.0,
    currency: 'USD',
    visits: 145,
  };

  // 1. Multi-Layer Data Filtering Logic
  const dataFiltered = useMemo(() => {
    return MOCK_SALES.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.email.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.reference.toLowerCase().includes(filterSearch.toLowerCase());

      const matchStatus = filterStatus === 'all' || item.status === filterStatus;

      let matchDate = true;
      if (startDate) matchDate = matchDate && new Date(item.date) >= new Date(startDate);
      if (endDate) matchDate = matchDate && new Date(item.date) <= new Date(endDate);

      return matchSearch && matchStatus && matchDate;
    });
  }, [filterSearch, filterStatus, startDate, endDate]);

  const currentRevenue = dataFiltered
    .filter((i) => i.status === 'success')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Functional Export Logic
  const handleExportToExcel = () => {
    const exportData = dataFiltered.map((item) => ({
      Customer: item.name,
      Email: item.email,
      Amount: item.amount,
      Currency: item.currency,
      Status: item.status.toUpperCase(),
      Date: fDateTime(item.date),
      Reference: item.reference,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered_Sales');
    XLSX.writeFile(wb, `Sales_${id}_Export.xlsx`);
  };

  return (
    <>
      <Head>
        <title> Sales Analysis: {linkInfo.name} | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <IconButton onClick={() => back()}>
            <Iconify icon="eva:arrow-back-fill" />
          </IconButton>
          <Breadcrumbs
            separator={
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
            }
          >
            <Link
              component="button"
              onClick={() => push('/payment-links')}
              underline="hover"
              color="inherit"
            >
              Links
            </Link>
            <Typography color="text.primary">{linkInfo.name}</Typography>
            <Typography color="text.disabled">Analytics</Typography>
          </Breadcrumbs>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'flex-end' }}
          sx={{ mb: 5 }}
          spacing={2}
        >
          <Box>
            <Typography variant="h3">{linkInfo.name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Monitoring performance for Link ID: <strong>{id}</strong>
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
            onClick={handleExportToExcel}
          >
            Export Filtered Sales
          </Button>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Total Link Revenue"
              amount={fCurrency(currentRevenue, linkInfo.currency)}
              variant="primary"
              icon={<Iconify icon="solar:wallet-money-bold-duotone" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Successful Sales"
              amount={dataFiltered.filter((i) => i.status === 'success').length}
              variant="info"
              icon={<Iconify icon="solar:users-group-rounded-bold-duotone" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Filtered View Transactions"
              amount={dataFiltered.length}
              variant="success"
              icon={<Iconify icon="solar:checklist-bold-duotone" width={32} />}
            />
          </Grid>
        </Grid>

        <Card>
          {/* ADVANCED FILTER TOOLBAR */}
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ py: 2.5, px: 3 }}>
            <TextField
              fullWidth
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search customer, email or ref..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ textTransform: 'capitalize' }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                label="From"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                label="To"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Stack>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <TableContainer>
            <Scrollbar>
              <Table sx={{ minWidth: 800 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />
                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                bgcolor: 'background.neutral',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Iconify
                                icon="solar:user-circle-bold"
                                sx={{ color: 'text.disabled' }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2">{row.name}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {row.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {fCurrency(row.amount, row.currency)}
                        </TableCell>
                        <TableCell>{fDateTime(row.date)}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.75,
                              typography: 'caption',
                              fontWeight: 'bold',
                              bgcolor:
                                row.status === 'success'
                                  ? 'success.lighter'
                                  : row.status === 'failed'
                                  ? 'error.lighter'
                                  : 'warning.lighter',
                              color:
                                row.status === 'success'
                                  ? 'success.darker'
                                  : row.status === 'failed'
                                  ? 'error.darker'
                                  : 'warning.darker',
                            }}
                          >
                            {row.status.toUpperCase()}
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                          {row.reference}
                        </TableCell>
                      </TableRow>
                    ))}
                  <TableNoData isNotFound={!dataFiltered.length} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={dataFiltered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
