/* eslint-disable arrow-body-style */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-alert */
import { useState, useMemo, useEffect, useCallback } from 'react';
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
  LinearProgress,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import StatWidget from '../../../../components/widgets/StatWidget';
import CountWidget from '../../../../components/widgets/CountWidget';
import { useSettingsContext } from '../../../../components/settings';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../../../components/table';
// utils
import axios from '../../../../utils/axios';
import { fDateTime } from '../../../../utils/formatTime';
import { fCurrency } from '../../../../utils/formatNumber';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'customer', label: 'Reference & Info', align: 'left' },
  { id: 'amount', label: 'Amount Paid', align: 'left' },
  { id: 'date', label: 'Payment Date', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'mode', label: 'Mode', align: 'right' },
];

const STATUS_OPTIONS = ['all', 'success', 'failed', 'pending'];

// ----------------------------------------------------------------------

PaymentLinkDetailsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function PaymentLinkDetailsPage() {
  const { query, back, push } = useRouter();
  const { details } = query;
  const { themeStretch } = useSettingsContext();
  const { page, rowsPerPage, onChangePage, onChangeRowsPerPage } = useTable();

  // API States
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);

  // Filter States
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Fetch Dynamic Data
  const getLinkDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/paymentlinks/details/${details}`);
      if (response.data.status === 'success') {
        setLinkData(response.data.data);
        setAttempts(response.data.data.attempts || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [details]);

  useEffect(() => {
    if (details) {
      getLinkDetails();
    }
  }, [details, getLinkDetails]);

  // 2. Multi-Layer Data Filtering Logic
  const dataFiltered = useMemo(() => {
    return attempts.filter((item) => {
      const matchSearch =
        item.reference.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(filterSearch.toLowerCase());

      const matchStatus = filterStatus === 'all' || item.status === filterStatus;

      let matchDate = true;
      if (startDate) matchDate = matchDate && new Date(item.created_at) >= new Date(startDate);
      if (endDate) matchDate = matchDate && new Date(item.created_at) <= new Date(endDate);

      return matchSearch && matchStatus && matchDate;
    });
  }, [attempts, filterSearch, filterStatus, startDate, endDate]);

  // 3. Functional Export Logic
  const handleExportToExcel = () => {
    const exportData = dataFiltered.map((item) => ({
      Reference: item.reference,
      Description: item.description,
      Amount: item.amount,
      Fee: item.fee,
      Total_Payable: item.amount_payable,
      Currency: item.currency,
      Status: item.status.toUpperCase(),
      Mode: item.mode.toUpperCase(),
      Date: fDateTime(item.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payment_Attempts');
    XLSX.writeFile(wb, `Attempts_${details}_Export.xlsx`);
  };

  if (loading && !linkData) return <LinearProgress />;

  return (
    <>
      <Head>
        <title> Analytics: {linkData?.link?.title} | CredDot</title>
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
              onClick={() => push('/dashboard/payment-links')}
              underline="hover"
              color="inherit"
            >
              Payment Links
            </Link>
            <Typography color="text.primary">{linkData?.link?.title}</Typography>
            <Typography color="text.disabled">Attempts</Typography>
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
            <Typography variant="h3">{linkData?.link?.title}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Reference ID: <strong>{linkData?.link?.link_id}</strong> • Created{' '}
              {fDateTime(linkData?.link?.created_at)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
            onClick={handleExportToExcel}
          >
            Export CSV
          </Button>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Total Revenue"
              amount={fCurrency(linkData?.stats?.total_revenue, linkData?.link?.currency)}
              variant="primary"
              icon={<Iconify icon="solar:card-send-bold-duotone" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CountWidget
              title="Successful Payment"
              amount={`${linkData?.stats?.success_attempts}`}
              variant="primary"
              icon={<Iconify icon="solar:clock-circle-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CountWidget
              title="Pending Payment"
              amount={linkData?.stats?.pending_attempts}
              variant="primary"
              icon={<Iconify icon="solar:clock-circle-bold-duotone" />}
            />
          </Grid>
        </Grid>

        <Card>
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ py: 2.5, px: 3 }}>
            <TextField
              fullWidth
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search reference or description..."
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
                                icon="solar:plain-bold-duotone"
                                sx={{ color: 'primary.main' }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                                {row.reference}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {row.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {fCurrency(row.amount, row.currency)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            Fee: {fCurrency(row.fee, row.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell>{fDateTime(row.created_at)}</TableCell>
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
                        <TableCell align="right">
                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 0.5,
                              display: 'inline-block',
                              border: (theme) =>
                                `1px solid ${
                                  row.mode === 'live'
                                    ? theme.palette.success.main
                                    : theme.palette.warning.main
                                }`,
                              color: row.mode === 'live' ? 'success.main' : 'warning.main',
                              typography: 'overline',
                              fontWeight: 'bold',
                            }}
                          >
                            {row.mode}
                          </Box>
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
