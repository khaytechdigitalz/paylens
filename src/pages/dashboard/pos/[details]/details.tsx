/* eslint-disable no-alert */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Container,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  CircularProgress,
  alpha,
  useTheme,
  Divider,
  Paper,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import { useSettingsContext } from '../../../../components/settings';
import axios from '../../../../utils/axios';
import { fCurrency } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';

// ----------------------------------------------------------------------

TerminalDetailsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function TerminalDetailsPage() {
  const theme = useTheme();
  const { query, push } = useRouter();

  // Capturing 'details' from the URL: /dashboard/pos/[details]/details
  const { details: sn } = query;
  const { themeStretch } = useSettingsContext();

  const [terminal, setTerminal] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: (query.search as string) || '',
    from: (query.from as string) || '',
    to: (query.to as string) || '',
    page: Number(query.page) || 1,
  });

  const fetchDetails = useCallback(async () => {
    if (!sn) return;
    setLoading(true);
    try {
      const response = await axios.get(`/terminals/${sn}/transactions`, {
        params: {
          search: filters.search,
          from: filters.from,
          to: filters.to,
          page: filters.page,
        },
      });
      setTerminal(response.data.terminal);
      setTransactions(response.data.data.data);
      setMeta(response.data.data);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, [sn, filters]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleFilter = () => {
    push({
      pathname: `/dashboard/pos/${sn}/details`,
      query: { ...filters, page: 1 },
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters({ ...filters, page: value });
    push({
      pathname: `/dashboard/pos/${sn}/details`,
      query: { ...filters, page: value },
    });
  };

  const handleExportExcel = () => {
    if (!transactions.length) return;
    const exportData = transactions.map((trx) => ({
      Date: fDateTime(trx.created_at),
      Reference: trx.reference,
      Description: trx.description,
      Category: trx.category,
      Amount: trx.amount,
      Fee: trx.fee,
      'Balance Before': trx.balance_before,
      'Balance After': trx.balance_after,
      Status: trx.status,
      'IP Address': trx.ip_address,
      Method: trx.payment_method,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Terminal_Logs');
    XLSX.writeFile(wb, `POS_Report_${sn}.xlsx`);
  };

  return (
    <>
      <Head>
        <title>Terminal Command Center | {sn}</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* Superior Navigation Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 4 }}
        >
          <Stack spacing={0.5}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                color: 'text.disabled',
                cursor: 'pointer',
                mb: 1,
                '&:hover': { color: 'primary.main' },
              }}
              onClick={() => push('/dashboard/pos/history')}
            >
              <Iconify icon="solar:alt-arrow-left-linear" width={16} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}
              >
                Back to Terminals
              </Typography>
            </Stack>
            <Typography variant="h3">POS Details</Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive transaction forensics and hardware monitoring.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="soft"
              color="primary"
              startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
            <IconButton
              onClick={fetchDetails}
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
            >
              <Iconify icon="solar:restart-bold-duotone" />
            </IconButton>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Hardware Profile Sidebar */}
          <Grid item xs={12} md={3}>
            <Stack spacing={3}>
              <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      boxShadow: theme.customShadows.primary,
                    }}
                  >
                    <Iconify icon="solar:smartphone-bold-duotone" width={32} />
                  </Avatar>
                  <Typography variant="subtitle1">
                    {terminal?.terminal_id || 'TID-000000'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    SN: {terminal?.serial_number || '---'}
                  </Typography>
                </Box>

                <Divider />

                <Stack spacing={2} sx={{ p: 3 }}>
                  <InfoItem label="Status" value={terminal?.status || '---'} isStatus />
                  <InfoItem label="OS" value="Android 11 (PayLens Core)" />
                  <InfoItem label="Network" value={terminal?.brand || '---'} />
                  <InfoItem label="Battery" value="98% (Healthy)" />
                </Stack>
              </Card>

              <Card
                sx={{
                  p: 3,
                  color: 'primary.contrastText',
                  bgcolor: 'primary.main',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Iconify
                  icon="solar:chart-2-bold-duotone"
                  sx={{
                    position: 'absolute',
                    right: -20,
                    bottom: -20,
                    width: 120,
                    height: 120,
                    opacity: 0.1,
                  }}
                />
                <Typography variant="overline" sx={{ opacity: 0.8 }}>
                  Total Requests
                </Typography>
                <Typography variant="h2">{meta?.total || 0}</Typography>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                  Historical transaction throughput.
                </Typography>
              </Card>
            </Stack>
          </Grid>

          {/* Transaction History Section */}
          <Grid item xs={12} md={9}>
            <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
              {/* Filter Bar */}
              <Box
                sx={{
                  p: 2.5,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.grey[500], 0.02),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search Reference or IP..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <Iconify
                        icon="solar:magnifer-linear"
                        sx={{ color: 'text.disabled', mr: 1 }}
                      />
                    ),
                  }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="From"
                  InputLabelProps={{ shrink: true }}
                  value={filters.from}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                  sx={{ width: 220 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  InputLabelProps={{ shrink: true }}
                  value={filters.to}
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                  sx={{ width: 220 }}
                />
                <Button variant="contained" onClick={handleFilter} sx={{ px: 4, height: 40 }}>
                  Apply
                </Button>
              </Box>

              <TableContainer sx={{ minHeight: 480, position: 'relative' }}>
                {loading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      bgcolor: alpha(theme.palette.background.paper, 0.7),
                    }}
                  >
                    <CircularProgress color="primary" />
                  </Box>
                )}

                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ledger Details</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Amount / Fee</TableCell>
                      <TableCell>Wallet Post</TableCell>
                      <TableCell align="center">Source & IP</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" color="primary.main">
                            {row.reference}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {fDateTime(row.created_at)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: 'info.main',
                              }}
                            >
                              <Iconify
                                icon={
                                  row.category === 'electricity'
                                    ? 'solar:bolt-bold-duotone'
                                    : 'solar:globus-bold-duotone'
                                }
                                width={18}
                              />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                              >
                                {row.category}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{ maxWidth: 180, display: 'block' }}
                              >
                                {row.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: row.type === 'debit' ? 'error.main' : 'success.main' }}
                          >
                            {row.type === 'debit' ? '-' : '+'}
                            {fCurrency(row.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            Fee: {fCurrency(row.fee)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="subtitle2">
                            {fCurrency(row.balance_after)}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            Before: {fCurrency(row.balance_before)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Tooltip title={`Network Mode: ${row.mode}`}>
                            <Box
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 0.5,
                                bgcolor: alpha(theme.palette.grey[500], 0.08),
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <Iconify icon="solar:point-on-map-bold-duotone" width={14} />
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                {row.payment_method.toUpperCase()}
                              </Typography>
                            </Box>
                          </Tooltip>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', color: 'text.disabled', mt: 0.5 }}
                          >
                            {row.ip_address || '0.0.0.0'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Paper
                            elevation={0}
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 0.5,
                              display: 'inline-block',
                              fontSize: 11,
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              bgcolor:
                                row.status === 'success'
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : alpha(theme.palette.error.main, 0.1),
                              color: row.status === 'success' ? 'success.main' : 'error.main',
                              border: `1px solid ${
                                row.status === 'success'
                                  ? alpha(theme.palette.success.main, 0.2)
                                  : alpha(theme.palette.error.main, 0.2)
                              }`,
                            }}
                          >
                            {row.status}
                          </Paper>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!loading && transactions.length === 0 && (
                  <Box sx={{ p: 10, textAlign: 'center' }}>
                    <Iconify
                      icon="solar:document-add-linear"
                      width={64}
                      sx={{ color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="h6" color="text.disabled">
                      No forensic data found for this terminal.
                    </Typography>
                  </Box>
                )}
              </TableContainer>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 3 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Terminal ID: <b>{sn}</b> | Total Entries: <b>{meta?.total || 0}</b>
                </Typography>
                {meta && (
                  <Pagination
                    count={meta.last_page}
                    page={filters.page}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    size="small"
                  />
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

// Reusable Detail Item for Sidebar
function InfoItem({
  label,
  value,
  isStatus = false,
}: {
  label: string;
  value: any;
  isStatus?: boolean;
}) {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
        {label}
      </Typography>
      {isStatus ? (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
          <Typography
            variant="subtitle2"
            sx={{ color: 'success.main', textTransform: 'capitalize' }}
          >
            {value}
          </Typography>
        </Stack>
      ) : (
        <Typography variant="subtitle2">{value}</Typography>
      )}
    </Stack>
  );
}
