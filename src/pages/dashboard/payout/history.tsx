/* eslint-disable new-cap */
/* eslint-disable import/no-named-as-default */
/* eslint-disable @typescript-eslint/no-shadow */
import { useState, useEffect, useCallback, useRef } from 'react';
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
  CircularProgress,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import StatWidget from '../../../components/widgets/StatWidget';
import CountWidget from '../../../components/widgets/CountWidget';
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
  const receiptRef = useRef<HTMLDivElement>(null);

  // Data & Pagination States
  const [payouts, setPayouts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
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

  // High-Fidelity PDF Generation Engine via Isolation Clones
  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !selectedPayout) return;
    setPdfLoading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const originalElement = receiptRef.current;
      const clonedElement = originalElement.cloneNode(true) as HTMLDivElement;

      // Inject isolated full width styling specifications to prevent compression artifacting
      clonedElement.style.width = '400px';
      clonedElement.style.position = 'absolute';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.height = 'auto';
      clonedElement.style.backgroundColor = theme.palette.background.paper;
      document.body.appendChild(clonedElement);

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: theme.palette.background.paper,
      });

      document.body.removeChild(clonedElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const marginX = 20;
      const imgWidth = pdfWidth - marginX * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const topPosition = (pdfHeight - imgHeight) / 2 > 15 ? (pdfHeight - imgHeight) / 2 : 15;

      pdf.addImage(imgData, 'PNG', marginX, topPosition, imgWidth, imgHeight);
      pdf.save(`CredDot_Payout_${selectedPayout.transaction_id || 'Receipt'}.pdf`);
    } catch (error) {
      console.error('PDF Engine failure:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  // Web Share Integration Block
  const handleShare = async () => {
    if (!selectedPayout) return;

    const shareData = {
      title: 'Transaction Receipt',
      text: `Receipt for NGN Payout of ${fCurrency(selectedPayout.amount, 'NGN')} to ${
        selectedPayout.account_name || 'Beneficiary'
      }. Ref: ${selectedPayout.transaction_id}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') console.error(err);
      }
    } else {
      // Fallback pasteboards mechanism
      navigator.clipboard.writeText(shareData.text);
      alert('Receipt info copied to clipboard!');
    }
  };

  return (
    <>
      <Head>
        <title> Payout History | CredDot</title>
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
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <CountWidget
              title="Total Payouts"
              amount={loading ? '...' : (stats?.total_payouts || 0).toString()}
              variant="primary"
              icon={<Iconify icon="solar:list-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CountWidget
              title="Successful"
              amount={loading ? '...' : (stats?.successful_payouts || 0).toString()}
              variant="primary"
              icon={<Iconify icon="solar:check-circle-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CountWidget
              title="Pending"
              amount={loading ? '...' : (stats?.pending_payouts || 0).toString()}
              variant="primary"
              icon={<Iconify icon="solar:clock-circle-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatWidget
              title="Total Volume"
              amount={loading ? '...' : fCurrency(stats?.total_volume || 0, 'NGN')}
              variant="primary"
              icon={<Iconify icon="solar:wad-of-money-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatWidget
              title="Total Fees"
              amount={loading ? '...' : fCurrency(stats?.total_fees || 0, 'NGN')}
              variant="primary"
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
                              <small>{row.currency}</small>
                            </Typography>
                            <Typography variant="caption" color="error">
                              Fee: {fCurrency(row.fee, 'NGN')}
                              <small>{row.currency}</small>
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

      <PayoutModal
        open={openPayoutModal}
        onClose={() => setOpenPayoutModal(false)}
        onSuccess={() => {
          fetchPayouts(1);
        }}
      />

      {/* SIDE DRAWER WITH EXPORT CAPABILITIES */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: { width: 420, ...glassStyle, borderLeft: `1px solid ${theme.palette.divider}` },
        }}
      >
        {selectedPayout && (
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
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

            <Scrollbar sx={{ flexGrow: 1, mb: 2 }}>
              {/* TARGET GENERATION WRAPPER FOR PDF CAPTURE */}
              <Box ref={receiptRef} sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 2 }}>
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
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Amount Paid
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {fCurrency(selectedPayout.amount, 'NGN')}<small>{selectedPayout.currency}</small>
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <DetailItem label="Status" value={selectedPayout.status.toUpperCase()} />
                    <DetailItem label="Reference" value={selectedPayout.transaction_id} />
                    <DetailItem label="Narration" value={selectedPayout.narration || 'N/A'} />
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <DetailItem label="Beneficiary" value={selectedPayout.account_name || 'N/A'} />
                    <DetailItem label="Bank" value={selectedPayout.bank_name || 'N/A'} />
                    <DetailItem
                      label="Account No."
                      value={selectedPayout.account_number || 'N/A'}
                    />
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <DetailItem label="Fee Charged" value={fCurrency(selectedPayout.fee, 'NGN')+selectedPayout.currency} />
                    <DetailItem label="Date" value={fDateTime(selectedPayout.created_at)} />
                  </Stack>
                </Stack>
              </Box>
            </Scrollbar>

            {/* ACTION TRIGGERS ROW */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}
            >
              <Button
                fullWidth
                size="large"
                variant="contained"
                disabled={pdfLoading}
                onClick={handleDownloadPDF}
                startIcon={
                  pdfLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Iconify icon="solar:file-download-bold-duotone" />
                  )
                }
                sx={{
                  bgcolor: 'grey.900',
                  color: 'common.white',
                  '&:hover': { bgcolor: 'grey.800' },
                }}
              >
                {pdfLoading ? 'Building...' : 'Download PDF'}
              </Button>

              <Button
                size="large"
                variant="soft"
                color="primary"
                onClick={handleShare}
                sx={{ px: 2.5 }}
              >
                <Iconify icon="solar:share-bold-duotone" width={22} />
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
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', flexShrink: 0, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ textAlign: 'right', fontWeight: 600, wordBreak: 'break-all' }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
