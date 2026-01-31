/* eslint-disable import/no-named-as-default */
/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
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
  Skeleton,
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
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../../components/table';
// utils
import axios from '../../../utils/axios';
import { fDate } from '../../../utils/formatTime';
// Internal Component
import RefundTableToolbar from './RefundTableToolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'refund_ref', label: 'Refund ID', align: 'left' },
  { id: 'transaction_ref', label: 'Original ID', align: 'left' },
  { id: 'created_at', label: 'Date', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: '' },
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

  // API State
  const [tableData, setTableData] = useState([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [currency, setCurrency] = useState('NGN');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // 1. Core Fetch Function
  const getRefunds = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get('/refunds', {
        params: {
          currency,
          search: filterName || undefined,
          status: filterStatus === 'all' ? undefined : filterStatus,
          start_date: filterStartDate || undefined,
          end_date: filterEndDate || undefined,
        },
      });

      setTableData(response.data.data.data || []);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Filter Error:', error);
    } finally {
      setLoading(false);
    }
  }, [currency, filterName, filterStatus, filterStartDate, filterEndDate]);

  // Initial load and currency switch reload
  useEffect(() => {
    getRefunds();
  }, [currency]); // Only auto-reload on currency. Other filters wait for "Search" click.

  // 2. Handlers
  const handleCurrencyChange = (_: React.MouseEvent<HTMLElement>, newCurrency: string | null) => {
    if (newCurrency) {
      setPage(0);
      setCurrency(newCurrency);
    }
  };

  const handleFilterSubmit = () => {
    setPage(0);
    getRefunds();
  };

  const formatValue = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    const symbols: Record<string, string> = { USD: '$', NGN: '₦', GBP: '£' };
    return `${symbols[currency] || '₦'}${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;
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
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[
            {
              title: 'Total Volume',
              val: summary?.total_refund_volume,
              var: 'error',
              icon: 'eva:undo-fill',
            },
            {
              title: 'Pending',
              val: summary?.pending_amount,
              var: 'warning',
              icon: 'eva:clock-fill',
            },
            {
              title: 'Successful',
              val: summary?.successful_amount,
              var: 'success',
              icon: 'eva:checkmark-circle-2-fill',
            },
            {
              title: 'Count',
              val: summary?.total_count,
              var: 'info',
              icon: 'eva:list-fill',
              noFormat: true,
            },
          ].map((stat, i) => (
            <Grid item xs={12} md={3} key={i}>
              <StatWidget
                title={stat.title}
                amount={
                  loading ? (
                    <Skeleton width={80} />
                  ) : stat.noFormat ? (
                    stat.val
                  ) : (
                    formatValue(stat.val || 0)
                  )
                }
                variant={stat.var as any}
                icon={<Iconify icon={stat.icon} width={32} />}
              />
            </Grid>
          ))}
        </Grid>

        <Card>
          {/* Integrated RefundTableToolbar */}
          <RefundTableToolbar
            filterName={filterName}
            onFilterName={(e) => setFilterName(e.target.value)}
            filterStatus={filterStatus}
            onFilterStatus={(e) => setFilterStatus(e.target.value)}
            startDate={filterStartDate}
            onChangeStartDate={(e) => setFilterStartDate(e.target.value)}
            endDate={filterEndDate}
            onChangeEndDate={(e) => setFilterEndDate(e.target.value)}
            onSubmit={handleFilterSubmit}
            filterType="" // Included for prop compliance
            onFilterType={() => {}}
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
                  {loading ? (
                    [...Array(rowsPerPage)].map((_, index) => <TableSkeleton key={index} />)
                  ) : (
                    <>
                      {tableData
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row: any) => (
                          <TableRow hover key={row.id}>
                            <TableCell sx={{ typography: 'subtitle2' }}>{row.refund_ref}</TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'primary.main',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                                onClick={() =>
                                  push(`/dashboard/transactions/${row.transaction.id}/details`)
                                }
                              >
                                {row.transaction_ref}
                              </Typography>
                            </TableCell>
                            <TableCell>{fDate(row.created_at)}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                              {formatValue(row.amount)}
                            </TableCell>
                            <TableCell>
                              <RefundStatusLabel status={row.status} />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={() =>
                                  push(`/dashboard/transactions/${row.refund_ref}/refund`)
                                }
                              >
                                <Iconify icon="eva:chevron-right-fill" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      <TableNoData isNotFound={!tableData.length} />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={tableData.length}
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

// TableSkeleton and RefundStatusLabel components stay same as previous...
function TableSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton variant="text" width={100} height={20} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={120} height={20} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={80} height={20} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={60} height={20} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rounded" width={70} height={24} />
      </TableCell>
      <TableCell align="right">
        <Skeleton variant="circular" width={32} height={32} />
      </TableCell>
    </TableRow>
  );
}

function RefundStatusLabel({ status }: { status: string }) {
  const isPending = status === 'pending';
  const isSuccess = status === 'success' || status === 'completed';
  return (
    <Typography
      variant="caption"
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 0.75,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: (theme) =>
          isSuccess
            ? theme.palette.success.dark
            : isPending
            ? theme.palette.warning.dark
            : theme.palette.error.dark,
        bgcolor: (theme) =>
          alpha(
            isSuccess
              ? theme.palette.success.main
              : isPending
              ? theme.palette.warning.main
              : theme.palette.error.main,
            0.16
          ),
      }}
    >
      {status}
    </Typography>
  );
}
