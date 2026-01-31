/* eslint-disable import/no-named-as-default */
/* eslint-disable @typescript-eslint/no-shadow */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
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
  Drawer,
  Box,
  alpha,
  useTheme,
  Pagination,
  Skeleton,
  Divider,
  IconButton,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import StatWidget from '../../../components/widgets/StatWidget';
import { useSettingsContext } from '../../../components/settings';
import { TableNoData, TableHeadCustom } from '../../../components/table';
import TransactionTableToolbar from './TransactionTableToolbar';
// Internal Component
import PayoutModal from './PayoutModal';
// utils
import { fDateTime } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'created_at', label: 'Date/Time', align: 'left' },
  { id: 'transaction_id', label: 'Reference', align: 'left' },
  { id: 'destination', label: 'Beneficiary', align: 'left' },
  { id: 'narration', label: 'Narration', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'left' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'action', label: '', align: 'right' },
];

// ----------------------------------------------------------------------

PayoutsPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PayoutsPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  // Data & Pagination States
  const [payouts, setPayouts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // UI Control States
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [openPayoutModal, setOpenPayoutModal] = useState(false);

  const glassStyle = {
    backdropFilter: 'blur(10px)',
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    boxShadow: theme.customShadows.z20,
  };

  // FETCH DATA
  const fetchPayouts = useCallback(
    async (targetPage = currentPage) => {
      setLoading(true);
      try {
        const params: any = { page: targetPage };
        if (filterName) params.search = filterName;
        if (filterStatus !== 'all') params.status = filterStatus;
        if (filterStartDate) params.start_date = filterStartDate;
        if (filterEndDate) params.end_date = filterEndDate;

        const response = await axios.get('/payouts', { params });

        if (response.data.status === 'success') {
          setPayouts(response.data.data.data);
          setStats(response.data.stats);
          setTotalPages(response.data.data.last_page || 1);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, filterName, filterStatus, filterStartDate, filterEndDate]
  );

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts, currentPage]);

  const handleFilterSubmit = () => {
    setCurrentPage(1);
    fetchPayouts(1);
  };

  const handleClearFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
    setTimeout(() => fetchPayouts(1), 0);
  };

  return (
    <>
      <Head>
        <title> Payout History | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              NGN Payouts
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage your business disbursements and real-time tracking.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => setOpenPayoutModal(true)}
            sx={{ height: 48, px: 3, boxShadow: (theme) => theme.customShadows.primary }}
          >
            New Payout
          </Button>
        </Stack>

        {/* STATS RIBBON */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={2.4}>
            <StatWidget
              title="Total Payouts"
              amount={loading ? '...' : (stats?.total_payouts || 0).toString()}
              variant="primary"
              icon={<Iconify icon="solar:list-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatWidget
              title="Successful"
              amount={loading ? '...' : (stats?.successful_payouts || 0).toString()}
              variant="success"
              icon={<Iconify icon="solar:check-circle-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatWidget
              title="Pending"
              amount={loading ? '...' : (stats?.pending_payouts || 0).toString()}
              variant="warning"
              icon={<Iconify icon="solar:clock-circle-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatWidget
              title="Total Volume"
              amount={loading ? '...' : fCurrency(stats?.total_volume || 0, 'NGN')}
              variant="info"
              icon={<Iconify icon="solar:wad-of-money-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatWidget
              title="Total Fees"
              amount={loading ? '...' : fCurrency(stats?.total_fees || 0, 'NGN')}
              variant="error"
              icon={<Iconify icon="solar:ticket-sale-bold-duotone" />}
            />
          </Grid>
        </Grid>

        <Card sx={{ ...glassStyle, p: 0 }}>
          <TransactionTableToolbar
            filterName={filterName}
            filterStatus={filterStatus}
            startDate={filterStartDate}
            endDate={filterEndDate}
            onFilterName={(e) => setFilterName(e.target.value)}
            onFilterStatus={(e) => setFilterStatus(e.target.value)}
            onChangeStartDate={(e) => setFilterStartDate(e.target.value)}
            onChangeEndDate={(e) => setFilterEndDate(e.target.value)}
            onFilterClick={handleFilterSubmit}
            onClearFilter={handleClearFilter}
            loading={loading}
          />

          <TableContainer>
            <Scrollbar>
              <Table sx={{ minWidth: 1000 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />
                <TableBody>
                  {loading
                    ? [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={7}>
                            <Skeleton height={60} />
                          </TableCell>
                        </TableRow>
                      ))
                    : payouts.map((row) => (
                        <TableRow
                          key={row.id}
                          hover
                          onClick={() => {
                            setSelectedPayout(row);
                            setOpenDrawer(true);
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant="subtitle2">{fDateTime(row.created_at)}</Typography>
                          </TableCell>
                          <TableCell sx={{ typography: 'caption', fontFamily: 'monospace' }}>
                            {row.transaction_id}
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">{row.account_name || 'N/A'}</Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              {row.bank_name} • {row.account_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                              {row.narration || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {fCurrency(row.amount, 'NGN')}
                            </Typography>
                            <Typography variant="caption" color="error">
                              Fee: {fCurrency(row.fee, 'NGN')}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                px: 1.2,
                                py: 0.5,
                                borderRadius: 1,
                                typography: 'caption',
                                fontWeight: 'bold',
                                bgcolor:
                                  row.status === 'success'
                                    ? alpha(theme.palette.success.main, 0.12)
                                    : alpha(theme.palette.warning.main, 0.12),
                                color: row.status === 'success' ? 'success.dark' : 'warning.dark',
                                textTransform: 'uppercase',
                              }}
                            >
                              {row.status}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton>
                              <Iconify icon="solar:eye-bold-duotone" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  <TableNoData isNotFound={!loading && payouts.length === 0} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Page {currentPage} of {totalPages}
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, value) => setCurrentPage(value)}
              color="primary"
              shape="rounded"
            />
          </Stack>
        </Card>
      </Container>

      {/* THE UPDATED BEAUTIFUL PAYOUT MODAL */}
      <PayoutModal
        open={openPayoutModal}
        onClose={() => setOpenPayoutModal(false)}
        onSuccess={() => {
          fetchPayouts(1); // Refresh data on success
        }}
      />

      {/* SIDE DRAWER FOR DETAILS */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: { width: 420, ...glassStyle, borderLeft: `1px solid ${theme.palette.divider}` },
        }}
      >
        {selectedPayout && (
          <Box sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 4 }}
            >
              <Typography variant="h6">Payout Details</Typography>
              <IconButton onClick={() => setOpenDrawer(false)}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>
            <Stack spacing={3}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  textAlign: 'center',
                  border: `1px dashed ${theme.palette.primary.main}`,
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  Amount Paid
                </Typography>
                <Typography variant="h3">{fCurrency(selectedPayout.amount, 'NGN')}</Typography>
              </Box>
              <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
                <DetailItem label="Status" value={selectedPayout.status.toUpperCase()} />
                <DetailItem label="Reference" value={selectedPayout.transaction_id} />
                <DetailItem label="Narration" value={selectedPayout.narration || 'N/A'} />
                <Divider />
                <DetailItem label="Beneficiary" value={selectedPayout.account_name || 'N/A'} />
                <DetailItem label="Bank" value={selectedPayout.bank_name || 'N/A'} />
                <DetailItem label="Account No." value={selectedPayout.account_number || 'N/A'} />
                <Divider />
                <DetailItem label="Fee Charged" value={fCurrency(selectedPayout.fee, 'NGN')} />
                <DetailItem label="Date" value={fDateTime(selectedPayout.created_at)} />
              </Stack>
              <Button fullWidth size="large" variant="contained">
                Download Receipt
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}
