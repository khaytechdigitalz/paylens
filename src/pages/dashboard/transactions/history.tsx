/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable no-nested-ternary */
import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Head from 'next/head';
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
  TableSkeleton,
} from '../../../components/table';
// utils
import axios from '../../../utils/axios';
import { fDate } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
// Internal Component
import { TransactionTableToolbar } from './TransactionTableToolbar';

// ----------------------------------------------------------------------

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  fee: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  category: string;
  status: string;
  reference: string;
  type: string;
}

interface Stats {
  transaction_value: number;
  transaction_fee: number;
  transaction_volume: number;
}

const TABLE_HEAD = [
  { id: 'reference', label: 'Reference', align: 'left' },
  { id: 'category', label: 'Category', align: 'left' },
  { id: 'created_at', label: 'Date', align: 'left' },
  { id: 'currency', label: 'Currency', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'left' },
  { id: 'fee', label: 'Fee', align: 'left' },
  { id: 'balance_before', label: 'Prev. Balance', align: 'left' },
  { id: 'balance_after', label: 'New Balance', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

PageFive.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PageFive() {
  const { push, query, pathname } = useRouter();
  const { themeStretch } = useSettingsContext();

  const { page, order, orderBy, rowsPerPage, setPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable({ defaultRowsPerPage: 10 });

  // 1. URL Source of Truth
  const activeCurrency = (query.currency as string) || '';
  const activeStatus = (query.status as string) || '';
  const activeType = (query.type as string) || '';
  const activeStartDate = (query.start_date as string) || '';
  const activeEndDate = (query.end_date as string) || '';

  // 2. Local State for UI Inputs
  const [localFilters, setLocalFilters] = useState({
    name: '',
    currency:'',
    status: activeStatus,
    type: activeType,
    startDate: activeStartDate,
    endDate: activeEndDate,
  });

  const [tableData, setTableData] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // 3. Fetch Function
  const getTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/transactions', {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search: localFilters.name,
          status: activeStatus,
          currency: activeCurrency,
          start_date: activeStartDate,
          end_date: activeEndDate,
          type: activeType,
        },
      });

      const { transactions, stats: apiStats } = response.data;
      setTableData(transactions.data || []);
      setTotalRecords(transactions.total || 0);
      setStats(apiStats);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    query,
    activeStatus,
    activeCurrency,
    activeStartDate,
    activeEndDate,
    activeType,
    localFilters.name,
  ]);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  // 4. Handlers
  const handleFilterSubmit = () => {
    setPage(0);

    // Helper to convert 'all' to empty string
    const cleanValue = (value: string) => (value === 'all' ? '' : value);

    push(
      {
        pathname,
        query: {
          ...query,
          currency: cleanValue(localFilters.currency),
          status: cleanValue(localFilters.status),
          type: cleanValue(localFilters.type),
          start_date: localFilters.startDate,
          end_date: localFilters.endDate,
          search: localFilters.name,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleCurrencyChange = (
    event: React.MouseEvent<HTMLElement>,
    newCurrency: string | null
  ) => {
    if (newCurrency) {
      setPage(0);
      push({ pathname, query: { ...query, currency: newCurrency } }, undefined, { shallow: true });
    }
  };

  // RESTORED: Export Handler
  const handleExport = () => {
    const exportData = tableData.map((row) => ({
      Reference: row.reference,
      Category: row.category,
      Date: fDate(row.created_at),
      Amount: row.amount,
      Fee: row.fee,
      Currency: row.currency,
      'Balance Before': row.balance_before,
      'Balance After': row.balance_after,
      Status: row.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(
      wb,
      `PayLens_Export_${activeCurrency}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
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
          sx={{ mb: 5 }}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
        >
          <Typography variant="h3">Transaction History</Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={activeCurrency}
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

            {/* RESTORED: Export Button */}
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="eva:download-outline" />}
              onClick={handleExport}
              disabled={loading || tableData.length === 0}
            >
              Export Excel
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            {loading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <StatWidget
                title="Total Value"
                amount={fCurrency(stats?.transaction_value || 0, activeCurrency)}
                variant="primary"
                icon={<Iconify icon="eva:diagonal-arrow-left-down-fill" width={32} />}
              />
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            {loading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <StatWidget
                title="Total Volume"
                amount={stats?.transaction_volume || 0}
                variant="info"
                icon={<Iconify icon="eva:layers-fill" width={32} />}
              />
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            {loading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <StatWidget
                title="Total Fees"
                amount={fCurrency(stats?.transaction_fee || 0, activeCurrency)}
                variant="warning"
                icon={<Iconify icon="eva:pie-chart-2-fill" width={32} />}
              />
            )}
          </Grid>
        </Grid>

        <Card>
          <TransactionTableToolbar
            filterName={localFilters.name}
            startDate={localFilters.startDate}
            endDate={localFilters.endDate}
            filterStatus={localFilters.status}
            filterType={localFilters.type}
            onFilterName={(e) => setLocalFilters({ ...localFilters, name: e.target.value })}
            onChangeStartDate={(e) =>
              setLocalFilters({ ...localFilters, startDate: e.target.value })
            }
            onChangeEndDate={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
            onFilterStatus={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
            onFilterType={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
            onSubmit={handleFilterSubmit}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 1100 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={onSort}
                />
                <TableBody>
                  {loading ? (
                    [...Array(rowsPerPage)].map((_, i) => (
                      <TableSkeleton key={i} sx={{ height: 72 }} />
                    ))
                  ) : (
                    <>
                      {tableData.map((row) => (
                        <TableRow
                          key={row.id}
                          hover
                          onClick={() => {
                            setSelectedTransaction(row);
                            setOpenDrawer(true);
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ typography: 'subtitle2' }}>{row.reference}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            {row.category?.replace('_', ' ')}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {fDate(row.created_at)}
                          </TableCell>

                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {row.currency}
                          </TableCell>

                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {fCurrency(row.amount, row.currency)}
                          </TableCell>
                          <TableCell sx={{ color: 'error.main' }}>
                            {fCurrency(row.fee, row.currency)}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', typography: 'caption' }}>
                            {fCurrency(row.balance_before, row.currency)}
                          </TableCell>
                          <TableCell sx={{ typography: 'subtitle2', color: 'primary.main' }}>
                            {fCurrency(row.balance_after, row.currency)}
                          </TableCell>
                          <TableCell>
                            <Label
                              color={
                                row.status === 'success' || row.status === 'completed'
                                  ? 'success'
                                  : row.status === 'pending'
                                  ? 'warning'
                                  : 'error'
                              }
                            >
                              {row.status}
                            </Label>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                push(`/dashboard/transactions/${row.id}/details`);
                              }}
                              color="primary"
                            >
                              <Iconify icon="eva:arrow-forward-fill" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableNoData isNotFound={!tableData.length && !loading} />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalRecords}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Card>
      </Container>

      {/* Drawer and Helper Components remain the same as previous step */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: { xs: 1, sm: 450 } } }}
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
                sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2, textAlign: 'center' }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Amount ({selectedTransaction.currency})
                </Typography>
                <Typography variant="h3" sx={{ color: 'primary.main' }}>
                  {fCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                </Typography>
              </Box>
              <Stack spacing={2}>
                <DetailRow label="Reference" value={selectedTransaction.reference} />
                <DetailRow
                  label="Category"
                  value={selectedTransaction.category?.replace('_', ' ')}
                />
                <DetailRow label="Date" value={fDate(selectedTransaction.created_at)} />
                <DetailRow
                  label="Fee"
                  value={fCurrency(selectedTransaction.fee, selectedTransaction.currency)}
                />
                <Divider sx={{ borderStyle: 'dashed' }} />
                <DetailRow
                  label="Balance Before"
                  value={fCurrency(
                    selectedTransaction.balance_before,
                    selectedTransaction.currency
                  )}
                />
                <DetailRow
                  label="Balance After"
                  value={fCurrency(selectedTransaction.balance_after, selectedTransaction.currency)}
                />
                <DetailRow label="Status" value={selectedTransaction.status} />
              </Stack>
              <Button
                fullWidth
                variant="contained"
                size="large"
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

// ----------------------------------------------------------------------

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function Label({ children, color }: { children: React.ReactNode; color: any }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 0.75,
        typography: 'caption',
        fontWeight: 'bold',
        textTransform: 'capitalize',
        display: 'inline-flex',
        bgcolor: (theme: any) => theme.palette[color].lighter,
        color: (theme: any) => theme.palette[color].darker,
      }}
    >
      {children}
    </Box>
  );
}
