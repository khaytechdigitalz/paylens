/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable prefer-const */
/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import * as XLSX from 'xlsx';
import Head from 'next/head';
// next
import { useRouter } from 'next/router';
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
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import StatWidget from '../../../components/widgets/StatWidget';
import { useSettingsContext } from '../../../components/settings';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../../components/table';
// utils
import { fDate } from '../../../utils/formatTime';
// Internal Component
import { TransactionTableToolbar } from './TransactionTableToolbar';

// ----------------------------------------------------------------------

interface Settlement {
  id: string; // Batch ID
  transactionId: string;
  date: string;
  grossAmount: number;
  fee: number;
  netSettled: number;
  paymentType: string;
  status: 'settled' | 'pending' | 'failed';
}

const TABLE_HEAD = [
  { id: 'id', label: 'Batch ID', align: 'left' },
  { id: 'transactionId', label: 'Transaction ID', align: 'left' },
  { id: 'grossAmount', label: 'Gross Amount', align: 'left' },
  { id: 'fee', label: 'Fee', align: 'left' },
  { id: 'netSettled', label: 'Net Settled', align: 'left' },
  { id: 'paymentType', label: 'Payment Type', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'date', label: 'Date', align: 'right' },
];

const TABLE_DATA: Settlement[] = [
  {
    id: 'BAT-9001',
    transactionId: 'TX-1234882',
    date: '2026-01-10',
    grossAmount: 50000.0,
    fee: 750.0,
    netSettled: 49250.0,
    paymentType: 'Card',
    status: 'settled',
  },
  {
    id: 'BAT-9002',
    transactionId: 'TX-5678119',
    date: '2026-01-12',
    grossAmount: 10000.0,
    fee: 150.0,
    netSettled: 9850.0,
    paymentType: 'Transfer',
    status: 'pending',
  },
  {
    id: 'BAT-9003',
    transactionId: 'TX-9012334',
    date: '2026-01-15',
    grossAmount: 2500.0,
    fee: 37.5,
    netSettled: 2462.5,
    paymentType: 'USSD',
    status: 'settled',
  },
];

// ----------------------------------------------------------------------

SettlementPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function SettlementPage() {
  const { push } = useRouter();
  const { themeStretch } = useSettingsContext();
  const { page, order, orderBy, rowsPerPage, setPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable();

  // States
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  // Handlers
  const handleCurrencyChange = (_: React.MouseEvent<HTMLElement>, newCurrency: string | null) => {
    if (newCurrency) setCurrency(newCurrency);
  };

  const handleQuickDate = (range: 'today' | 'seven_days' | 'month') => {
    const end = new Date();
    let start = new Date();
    if (range === 'seven_days') start.setDate(end.getDate() - 7);
    if (range === 'month') start.setMonth(end.getMonth() - 1);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    setFilterStartDate(formatDate(start));
    setFilterEndDate(formatDate(end));
    setPage(0);
  };

  const dataFiltered = applyFilter({
    inputData: TABLE_DATA,
    comparator: getComparator(order, orderBy),
    filterName,
    filterStartDate,
    filterEndDate,
  });

  // Aggregates
  const totalFees = dataFiltered.reduce((acc, curr) => acc + curr.fee, 0);
  const totalNet = dataFiltered.reduce((acc, curr) => acc + curr.netSettled, 0);

  const formatValue = (val: number) => {
    const symbols: Record<string, string> = { USD: '$', NGN: '₦', GBP: '£' };
    return `${symbols[currency]}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const handleExport = () => {
    const exportData = dataFiltered.map((row) => ({
      'Batch ID': row.id,
      'Transaction ID': row.transactionId,
      'Gross Amount': row.grossAmount,
      Fee: row.fee,
      'Net Settled': row.netSettled,
      'Payment Type': row.paymentType,
      Status: row.status,
      Date: row.date,
      Currency: currency,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Settlements');
    XLSX.writeFile(
      wb,
      `Settlement_Report_${currency}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
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
              View and reconcile funds paid out to your wallet.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={currency}
              exclusive
              onChange={handleCurrencyChange}
              size="small"
              color="primary"
            >
              {['NGN', 'USD', 'GBP'].map((lib) => (
                <ToggleButton key={lib} value={lib} sx={{ fontWeight: 'bold', px: 2 }}>
                  {lib}
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
              Export Excel
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
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Total Net Settled"
              amount={formatValue(totalNet)}
              variant="primary"
              icon={<Iconify icon="solar:wallet-money-bold-duotone" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Total Fees"
              amount={formatValue(totalFees)}
              variant="warning"
              icon={<Iconify icon="solar:ticket-sale-bold-duotone" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Settlement Volume"
              amount={dataFiltered.length}
              variant="info"
              icon={<Iconify icon="solar:reorder-bold-duotone" width={32} />}
            />
          </Grid>
        </Grid>

        <Card>
          <TransactionTableToolbar
            filterName={filterName}
            startDate={filterStartDate}
            endDate={filterEndDate}
            onFilterName={(e) => {
              setPage(0);
              setFilterName(e.target.value);
            }}
            onChangeStartDate={(e) => {
              setPage(0);
              setFilterStartDate(e.target.value);
            }}
            onChangeEndDate={(e) => {
              setPage(0);
              setFilterEndDate(e.target.value);
            }}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 1000 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={onSort}
                />
                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow
                        hover
                        key={row.id}
                        onClick={() => {
                          setSelectedSettlement(row);
                          setOpenDrawer(true);
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {row.id}
                        </TableCell>
                        <TableCell sx={{ typography: 'caption', color: 'text.secondary' }}>
                          {row.transactionId}
                        </TableCell>
                        <TableCell>{formatValue(row.grossAmount)}</TableCell>
                        <TableCell sx={{ color: 'error.main' }}>-{formatValue(row.fee)}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {formatValue(row.netSettled)}
                        </TableCell>
                        <TableCell>{row.paymentType}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.75,
                              typography: 'caption',
                              fontWeight: 'bold',
                              textTransform: 'capitalize',
                              bgcolor: (theme) =>
                                row.status === 'settled'
                                  ? theme.palette.success.lighter
                                  : theme.palette.warning.lighter,
                              color: (theme) =>
                                row.status === 'settled'
                                  ? theme.palette.success.darker
                                  : theme.palette.warning.darker,
                            }}
                          >
                            {row.status}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{fDate(row.date)}</TableCell>
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

      {/* Detail Drawer */}
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
                  Net Settled
                </Typography>
                <Typography variant="h3" sx={{ color: 'success.main' }}>
                  {formatValue(selectedSettlement.netSettled)}
                </Typography>
              </Box>
              <Stack spacing={2}>
                <DetailRow label="Batch ID" value={selectedSettlement.id} />
                <DetailRow label="Transaction ID" value={selectedSettlement.transactionId} />
                <DetailRow
                  label="Gross Amount"
                  value={formatValue(selectedSettlement.grossAmount)}
                />
                <DetailRow label="Total Fees" value={`-${formatValue(selectedSettlement.fee)}`} />
                <Divider sx={{ borderStyle: 'dashed' }} />
                <DetailRow label="Channel" value={selectedSettlement.paymentType} />
                <DetailRow label="Status" value={selectedSettlement.status} isStatus />
              </Stack>
            </Stack>
          </Box>
        )}
      </Drawer>
    </>
  );
}

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

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterStartDate,
  filterEndDate,
}: {
  inputData: Settlement[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterStartDate: string;
  filterEndDate: string;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);
  if (filterName) {
    inputData = inputData.filter(
      (item) =>
        item.id.toLowerCase().includes(filterName.toLowerCase()) ||
        item.transactionId.toLowerCase().includes(filterName.toLowerCase())
    );
  }
  if (filterStartDate && filterEndDate) {
    inputData = inputData.filter(
      (item) =>
        new Date(item.date) >= new Date(filterStartDate) &&
        new Date(item.date) <= new Date(filterEndDate)
    );
  }
  return inputData;
}
