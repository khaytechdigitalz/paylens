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

interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
}

const TABLE_HEAD = [
  { id: 'id', label: 'Reference ID', align: 'left' },
  { id: 'date', label: 'Date', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: '' },
];

const TABLE_DATA: Transaction[] = [
  {
    id: 'TX-1234',
    date: '2026-01-10',
    amount: 1250.0,
    status: 'completed',
    method: 'Visa **** 4242',
  },
  { id: 'TX-5678', date: '2026-01-12', amount: 85.5, status: 'pending', method: 'Bank Transfer' },
  {
    id: 'TX-9012',
    date: '2026-01-15',
    amount: 450.0,
    status: 'failed',
    method: 'Mastercard **** 8888',
  },
  {
    id: 'TX-3456',
    date: '2026-01-16',
    amount: 2300.0,
    status: 'completed',
    method: 'Visa **** 1111',
  },
];

// ----------------------------------------------------------------------

PageFive.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PageFive() {
  const { push } = useRouter();
  const { themeStretch } = useSettingsContext();
  const { page, order, orderBy, rowsPerPage, setPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable();

  // States
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Handlers
  const handleGoToDetails = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    push(`/dashboard/transactions/${id}/details`);
  };

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

  // Calculate stats based on filtered data
  const totalValue = dataFiltered.reduce((acc, curr) => acc + curr.amount, 0);
  const totalVolume = dataFiltered.length;
  const totalFees = totalValue * 0.01;

  const formatValue = (val: number) => {
    const symbols: Record<string, string> = { USD: '$', NGN: '₦', GBP: '£' };
    return `${symbols[currency]}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  // RESTORED EXCEL EXPORT LOGIC
  const handleExport = () => {
    const exportData = dataFiltered.map((row) => ({
      'Reference ID': row.id,
      Date: row.date,
      Amount: row.amount,
      Currency: currency,
      Status: row.status,
      Method: row.method,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `PayLens_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <>
      <Head>
        <title> Transaction History | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 5 }}
        >
          <Typography variant="h3">Transaction History</Typography>

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
              title="Transaction Value"
              amount={formatValue(totalValue)}
              variant="primary"
              icon={<Iconify icon="eva:diagonal-arrow-left-down-fill" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Transaction Volume"
              amount={totalVolume}
              variant="info"
              icon={<Iconify icon="eva:layers-fill" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Total Fees"
              amount={formatValue(totalFees)}
              variant="warning"
              icon={<Iconify icon="eva:pie-chart-2-fill" width={32} />}
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
              <Table sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={onSort}
                />
                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row: Transaction) => (
                      <TableRow
                        hover
                        key={row.id}
                        component="tr"
                        onClick={() => {
                          setSelectedTransaction(row);
                          setOpenDrawer(true);
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ typography: 'subtitle2' }}>{row.id}</TableCell>
                        <TableCell>{fDate(row.date)}</TableCell>
                        <TableCell>{formatValue(row.amount)}</TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.75,
                              fontWeight: 'bold',
                              textTransform: 'capitalize',
                              bgcolor: (theme) =>
                                row.status === 'completed'
                                  ? theme.palette.success.lighter
                                  : theme.palette.warning.lighter,
                              color: (theme) =>
                                row.status === 'completed'
                                  ? theme.palette.success.darker
                                  : theme.palette.warning.darker,
                            }}
                          >
                            {row.status}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(e) => handleGoToDetails(e, row.id)} color="primary">
                            <Iconify icon="eva:arrow-forward-fill" />
                          </IconButton>
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

      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: { xs: 1, sm: 400 } } }}
      >
        {selectedTransaction && (
          <Box sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6">Quick View</Typography>
              <IconButton onClick={() => setOpenDrawer(false)}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>
            <Stack spacing={3}>
              <Box
                sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, textAlign: 'center' }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Amount
                </Typography>
                <Typography variant="h3" sx={{ color: 'primary.main' }}>
                  {formatValue(selectedTransaction.amount)}
                </Typography>
              </Box>
              <Stack spacing={2}>
                <DetailRow label="Reference ID" value={selectedTransaction.id} />
                <DetailRow label="Date" value={fDate(selectedTransaction.date)} />
                <DetailRow label="Status" value={selectedTransaction.status} isStatus />
                <Divider sx={{ borderStyle: 'dashed' }} />
                <DetailRow label="Payment Method" value={selectedTransaction.method} />
              </Stack>
              <Button
                fullWidth
                variant="contained"
                onClick={() => push(`/dashboard/transactions/${selectedTransaction.id}/details`)}
              >
                View Full Details
              </Button>
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
  inputData: Transaction[];
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
    inputData = inputData.filter((item) =>
      item.id.toLowerCase().includes(filterName.toLowerCase())
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
