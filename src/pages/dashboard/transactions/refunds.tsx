import { useState } from 'react';
import * as XLSX from 'xlsx';
import Head from 'next/head';
// next
import { useRouter } from 'next/router';
// @mui
import { alpha } from '@mui/material/styles';
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
  IconButton,
  TableContainer,
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

interface RefundTransaction {
  id: string;
  originalId: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  reason: string;
}

const TABLE_HEAD = [
  { id: 'id', label: 'Refund ID', align: 'left' },
  { id: 'originalId', label: 'Original ID', align: 'left' },
  { id: 'date', label: 'Refund Date', align: 'left' },
  { id: 'amount', label: 'Refund Amount', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: '' },
];

const TABLE_DATA: RefundTransaction[] = [
  {
    id: 'RF-9901',
    originalId: 'TX-1234',
    date: '2026-01-15',
    amount: 1250.0,
    status: 'completed',
    reason: 'Customer Request',
  },
  {
    id: 'RF-9902',
    originalId: 'TX-5678',
    date: '2026-01-16',
    amount: 45.0,
    status: 'pending',
    reason: 'Duplicate Payment',
  },
  {
    id: 'RF-9903',
    originalId: 'TX-9012',
    date: '2026-01-17',
    amount: 450.0,
    status: 'rejected',
    reason: 'Policy Violation',
  },
];

// ----------------------------------------------------------------------

RefundHistoryPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function RefundHistoryPage() {
  const { push } = useRouter();
  const { themeStretch } = useSettingsContext();
  const { page, order, orderBy, rowsPerPage, setPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable();

  // Filters & State
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleCurrencyChange = (_: React.MouseEvent<HTMLElement>, newCurrency: string | null) => {
    if (newCurrency) setCurrency(newCurrency);
  };

  const dataFiltered = applyFilter({
    inputData: TABLE_DATA,
    comparator: getComparator(order, orderBy),
    filterName,
    filterStartDate,
    filterEndDate,
  });

  const formatValue = (val: number) => {
    const symbols: Record<string, string> = { USD: '$', NGN: '₦', GBP: '£' };
    return `${symbols[currency]}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  // Stats logic
  const totalRefunded = dataFiltered
    .filter((item: { status: string; }) => item.status === 'completed')
    .reduce((acc: any, curr: { amount: any; }) => acc + curr.amount, 0);

  const pendingRefunds = dataFiltered.filter((item: { status: string; }) => item.status === 'pending').length;

  const handleExport = () => {
    const exportData = dataFiltered.map((row: { id: any; originalId: any; date: any; amount: any; status: any; reason: any; }) => ({
      'Refund ID': row.id,
      'Original Transaction ID': row.originalId,
      Date: row.date,
      Amount: row.amount,
      Currency: currency,
      Status: row.status,
      Reason: row.reason,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Refunds');
    XLSX.writeFile(wb, `PayLens_Refunds_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <>
      <Head>
        <title> Refund History | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 5 }}
        >
          <Typography variant="h3">Refund History</Typography>

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

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Total Refunded"
              amount={formatValue(totalRefunded)}
              variant="error"
              icon={<Iconify icon="eva:undo-fill" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Pending Refunds"
              amount={pendingRefunds}
              variant="warning"
              icon={<Iconify icon="eva:clock-fill" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Success Rate"
              amount="94.2%"
              variant="success"
              icon={<Iconify icon="eva:checkmark-circle-2-fill" width={32} />}
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
                  {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                    (
                      row: RefundTransaction // Use the interface instead of inline types
                    ) => (
                      <TableRow hover key={row.id}>
                        <TableCell sx={{ typography: 'subtitle2' }}>{row.id}</TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'primary.main',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontWeight: 'medium',
                            }}
                            onClick={() =>
                              push(`/dashboard/transactions/${row.originalId}/details`)
                            }
                          >
                            {row.originalId}
                          </Typography>
                        </TableCell>

                        <TableCell>{fDate(row.date)}</TableCell>

                        <TableCell>{formatValue(row.amount)}</TableCell>

                        <TableCell>
                          <RefundStatusLabel status={row.status} />
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            onClick={() =>
                              push(`/dashboard/transactions/${row.originalId}/refund`)
                            }
                            color="primary"
                          >
                            <Iconify icon="eva:arrow-forward-fill" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  )}
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

// ----------------------------------------------------------------------

function RefundStatusLabel({ status }: { status: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 0.75,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        color: (theme) => {
          if (status === 'completed') return theme.palette.success.dark;
          if (status === 'pending') return theme.palette.warning.dark;
          return theme.palette.error.dark;
        },
        bgcolor: (theme) => {
          if (status === 'completed') return alpha(theme.palette.success.main, 0.16);
          if (status === 'pending') return alpha(theme.palette.warning.main, 0.16);
          return alpha(theme.palette.error.main, 0.16);
        },
      }}
    >
      {status}
    </Typography>
  );
}

function applyFilter({ inputData, comparator, filterName, filterStartDate, filterEndDate }: any) {
  const stabilizedThis = inputData.map((el: any, index: number) => [el, index]);
  stabilizedThis.sort((a: any, b: any) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el: any) => el[0]);
  if (filterName) {
    inputData = inputData.filter(
      (item: any) =>
        item.id.toLowerCase().includes(filterName.toLowerCase()) ||
        item.originalId.toLowerCase().includes(filterName.toLowerCase())
    );
  }
  if (filterStartDate && filterEndDate) {
    inputData = inputData.filter(
      (item: any) =>
        new Date(item.date) >= new Date(filterStartDate) &&
        new Date(item.date) <= new Date(filterEndDate)
    );
  }
  return inputData;
}
