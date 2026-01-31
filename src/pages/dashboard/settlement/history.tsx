/* eslint-disable import/no-named-as-default */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable no-nested-ternary */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import * as XLSX from 'xlsx';
// @mui
import {
  Grid,
  Card,
  Table,
  Stack,
  Button,
  Divider,
  TableBody,
  Container,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  TableContainer,
  Drawer,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import StatWidget from '../../../components/widgets/StatWidget';
import { useSettingsContext } from '../../../components/settings';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../../components/table';
// utils
import axios from '../../../utils/axios';
import { fDate } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
import TransactionTableToolbar from './TransactionTableToolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'batch_id', label: 'Batch ID', align: 'left' },
  { id: 'transaction_id', label: 'Transaction ID', align: 'left' },
  { id: 'gross_amount', label: 'Gross', align: 'left' },
  { id: 'fee', label: 'Fees', align: 'left' },
  { id: 'settled', label: 'Net Settled', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'created_at', label: 'Date', align: 'right' },
];

// ----------------------------------------------------------------------

SettlementPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function SettlementPage() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { themeStretch } = useSettingsContext();

  const { page, order, orderBy, rowsPerPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable();

  const isTestMode = user?.mode === 'test';

  // Data States
  const [tableData, setTableData] = useState([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [currency, setCurrency] = useState('NGN');
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // UI States
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);

  // --- API FETCH LOGIC ---
  const getSettlements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/settlements', {
        params: {
          currency,
          mode: user?.mode || 'live',
          search: filterName || undefined,
          start_date: filterStartDate || undefined,
          end_date: filterEndDate || undefined,
          page: page + 1, // API usually starts at 1
        },
      });
      setTableData(response.data.data.data || []);
      setSummary(response.data.summary);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load settlements', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currency, user?.mode, filterName, filterStartDate, filterEndDate, page, enqueueSnackbar]);

  useEffect(() => {
    getSettlements();
  }, [currency, user?.mode, page]);

  // --- HANDLERS ---
  const handleResetFilter = () => {
    setFilterName('');
    setFilterStartDate('');
    setFilterEndDate('');
    setTimeout(() => getSettlements(), 50);
  };

  const handleQuickDate = (range: 'today' | 'seven_days' | 'month') => {
    const end = new Date();
    let start = new Date();
    if (range === 'seven_days') start.setDate(end.getDate() - 7);
    if (range === 'month') start.setMonth(end.getMonth() - 1);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    setFilterStartDate(formatDate(start));
    setFilterEndDate(formatDate(end));
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Settlements');
    XLSX.writeFile(wb, `Settlements_${currency}_${user?.mode}.xlsx`);
  };

  return (
    <>
      <Head>
        <title> Settlement History | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 5 }}
        >
          <Box>
            <Typography variant="h3">Settlement History</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Environment:{' '}
              <strong
                style={{
                  color: isTestMode ? theme.palette.warning.main : theme.palette.success.main,
                }}
              >
                {isTestMode ? 'TEST' : 'LIVE'}
              </strong>
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={currency}
              exclusive
              onChange={(e, val) => val && setCurrency(val)}
              size="small"
              color="primary"
            >
              {['NGN', 'USD', 'GBP'].map((curr) => (
                <ToggleButton key={curr} value={curr} sx={{ fontWeight: 'bold', px: 2 }}>
                  {curr}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="eva:download-outline" />}
              onClick={handleExport}
              sx={{ bgcolor: 'text.primary', color: 'background.paper' }}
            >
              Export
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {['Today', 'Last 7 Days', 'This Month'].map((label) => (
            <Button
              key={label}
              size="small"
              variant="soft"
              onClick={() =>
                handleQuickDate(
                  label === 'Today' ? 'today' : label === 'Last 7 Days' ? 'seven_days' : 'month'
                )
              }
              sx={{ borderRadius: 1, typography: 'caption', fontWeight: 'bold' }}
            >
              {label}
            </Button>
          ))}
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={3}>
            <StatWidget
              title="Total Settled"
              amount={loading ? <Skeleton /> : summary?.total_settled || 0}
              icon={<Iconify icon="eva:checkmark-circle-2-fill" width={32} />}
              variant="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatWidget
              title="Settlement Volume"
              amount={loading ? <Skeleton /> : summary?.settlement_volume || 0}
              icon={<Iconify icon="eva:diagonal-arrow-right-up-fill" width={32} />}
              variant="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatWidget
              title="Total Fees"
              amount={loading ? <Skeleton /> : summary?.total_fee || 0}
              icon={<Iconify icon="eva:scissors-fill" width={32} />}
              variant="error"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatWidget
              title="Transaction Count"
              amount={loading ? <Skeleton /> : summary?.transaction_count || 0}
              icon={<Iconify icon="eva:layers-fill" width={32} />}
              variant="info"
            />
          </Grid>
        </Grid>

        <Card sx={{ border: isTestMode ? `1px dashed ${theme.palette.warning.main}` : 'none' }}>
          <TransactionTableToolbar
            filterName={filterName}
            startDate={filterStartDate}
            endDate={filterEndDate}
            onFilterName={(e) => setFilterName(e.target.value)}
            onChangeStartDate={(e) => setFilterStartDate(e.target.value)}
            onChangeEndDate={(e) => setFilterEndDate(e.target.value)}
            onApplyFilter={getSettlements}
            onResetFilter={handleResetFilter}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  zIndex: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress color={isTestMode ? 'warning' : 'primary'} />
              </Box>
            )}
            <Scrollbar>
              <Table sx={{ minWidth: 1000 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={onSort}
                />
                <TableBody>
                  {tableData.map((row: any) => (
                    <TableRow
                      hover
                      key={row.id}
                      onClick={() => {
                        setSelectedSettlement(row);
                        setOpenDrawer(true);
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.batch_id}</TableCell>
                      <TableCell sx={{ typography: 'caption', color: 'text.secondary' }}>
                        {row.transaction_id}
                      </TableCell>
                      <TableCell>{fCurrency(row.gross_amount || 0, currency)}</TableCell>
                      <TableCell sx={{ color: 'error.main' }}>
                        -{fCurrency(row.fee || 0, currency)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {fCurrency(row.settled || 0, currency)}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 0.75,
                            typography: 'caption',
                            fontWeight: 'bold',
                            textTransform: 'capitalize',
                            textAlign: 'center',
                            width: 80,
                            bgcolor:
                              row.status === 'success'
                                ? alpha(theme.palette.success.main, 0.16)
                                : alpha(theme.palette.warning.main, 0.16),
                            color:
                              row.status === 'success'
                                ? theme.palette.success.dark
                                : theme.palette.warning.dark,
                          }}
                        >
                          {row.status}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{fDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  <TableNoData isNotFound={!tableData.length && !loading} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={summary?.total_count || tableData.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Card>
      </Container>

      {/* Settlement Detail Drawer */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: { xs: 1, sm: 400 } } }}
      >
        {selectedSettlement && (
          <Box sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6">Settlement Details</Typography>
              <IconButton onClick={() => setOpenDrawer(false)}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>

            <Stack spacing={3}>
              <Box
                sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, textAlign: 'center' }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Net Payout
                </Typography>
                <Typography variant="h3" sx={{ color: 'success.main' }}>
                  {fCurrency(selectedSettlement.settled, currency)}
                </Typography>
              </Box>

              <Stack spacing={2}>
                <DetailRow label="Batch ID" value={selectedSettlement.batch_id} />
                <DetailRow label="Transaction ID" value={selectedSettlement.transaction_id} />
                <DetailRow
                  label="Gross Amount"
                  value={fCurrency(selectedSettlement.gross_amount, currency)}
                />
                <DetailRow
                  label="Fee Deducted"
                  value={`-${fCurrency(selectedSettlement.fee, currency)}`}
                />
                <Divider sx={{ borderStyle: 'dashed' }} />
                <DetailRow label="Processed Date" value={fDate(selectedSettlement.created_at)} />
                <DetailRow label="Status" value={selectedSettlement.status} isStatus />
              </Stack>
            </Stack>
          </Box>
        )}
      </Drawer>
    </>
  );
}

// Internal Helpers
function DetailRow({
  label,
  value,
  isStatus,
}: {
  label: string;
  value: string;
  isStatus?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textTransform: isStatus ? 'capitalize' : 'none' }}>
        {value}
      </Typography>
    </Stack>
  );
}
