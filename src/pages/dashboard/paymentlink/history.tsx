/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
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
  IconButton,
  TableContainer,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  CircularProgress,
  alpha,
  useTheme,
  Modal,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
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
  { id: 'title', label: 'Link Name', align: 'left' },
  { id: 'type', label: 'Type', align: 'left' },
  { id: 'is_active', label: 'Status', align: 'left' },
  { id: 'successful_payments_count', label: 'Sales', align: 'center' },
  { id: 'amount', label: 'Price', align: 'left' },
  { id: 'created_at', label: 'Created', align: 'right' },
  { id: 'action', label: '', align: 'right' },
];

PaymentLinkPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PaymentLinkPage() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { themeStretch } = useSettingsContext();

  const { page, order, orderBy, rowsPerPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable();

  const isTestMode = user?.mode === 'test';

  // States
  const [tableData, setTableData] = useState([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('NGN');
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // --- API FETCH ---
  const getLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/paymentlinks', {
        params: {
          currency,
          mode: user?.mode || 'live',
          search: filterName || undefined,
          start_date: filterStartDate || undefined,
          end_date: filterEndDate || undefined,
        },
      });
      setTableData(response.data.data.data || []);
      setSummary(response.data.summary);
    } catch (error) {
      enqueueSnackbar('Failed to fetch payment links', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currency, user?.mode, filterName, filterStartDate, filterEndDate, enqueueSnackbar]);

  useEffect(() => {
    getLinks();
  }, [currency, user?.mode]);

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStartDate('');
    setFilterEndDate('');
    setTimeout(() => getLinks(), 50);
  };

  const handleCopy = (e: React.MouseEvent, linkId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://paylens.me/${linkId}`);
    enqueueSnackbar('Link copied to clipboard');
  };

  return (
    <>
      <Head>
        <title> Payment Links | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3">Payment Links</Typography>
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

          <Stack direction="row" spacing={2}>
            <ToggleButtonGroup
              value={currency}
              exclusive
              onChange={(e, val) => val && setCurrency(val)}
              size="small"
              color="primary"
            >
              {['NGN', 'USD', 'GBP'].map((curr) => (
                <ToggleButton key={curr} value={curr} sx={{ px: 2, fontWeight: 'bold' }}>
                  {curr}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Button
              variant="contained"
              color={isTestMode ? 'warning' : 'primary'}
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setOpenCreateModal(true)}
            >
              New Link
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={3}>
            <StatWidget
              title="Link Revenue"
              icon={<Iconify icon="eva:trending-up-fill" width={32} />}
              amount={loading ? <Skeleton /> : summary?.total_revenue}
              variant="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatWidget
              title="Total Sales"
              icon={<Iconify icon="eva:shopping-cart-fill" width={32} />}
              amount={loading ? <Skeleton /> : summary?.total_sales || 0}
              variant="info"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatWidget
              title="Active Links"
              icon={<Iconify icon="eva:link-2-fill" width={32} />}
              amount={loading ? <Skeleton /> : summary?.active_links || 0}
              variant="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatWidget
              title="Inactive"
              icon={<Iconify icon="eva:link-2-outline" width={32} />}
              amount={loading ? <Skeleton /> : summary?.inactive_links || 0}
              variant="warning"
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
            onApplyFilter={getLinks}
            onResetFilter={handleResetFilter}
          />

          <TableContainer sx={{ position: 'relative', minHeight: 400 }}>
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
              <Table sx={{ minWidth: 900 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} onSort={onSort} />
                <TableBody>
                  {tableData.map((row: any) => (
                    <TableRow hover key={row.id} sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Typography variant="subtitle2">{row.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          paylens.me/{row.link_id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{row.type}</TableCell>
                      <TableCell>
                        <Iconify
                          icon={
                            row.is_active === 1
                              ? 'eva:checkmark-circle-2-fill'
                              : 'eva:close-circle-fill'
                          }
                          sx={{
                            color: row.is_active === 1 ? 'success.main' : 'error.main',
                            width: 24,
                            height: 24,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">{row.successful_payments_count || 0}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {fCurrency(row.amount || 0, row.currency)}
                      </TableCell>
                      <TableCell align="right">{fDate(row.created_at)}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleCopy(e, row.link_id)} color="primary">
                          <Iconify icon="solar:copy-bold-duotone" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableNoData isNotFound={!tableData.length && !loading} />
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

      <CreateLinkModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        currentCurrency={currency}
        isTest={isTestMode}
        onRefresh={getLinks}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function CreateLinkModal({ open, onClose, currentCurrency, isTest, onRefresh }: any) {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    currency: currentCurrency,
    type: 'professional',
    usage_limit: '',
    payment_action: 'message',
    redirect_url: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, currency: currentCurrency }));
  }, [currentCurrency]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await axios.post('/paymentlinks/create', {
        ...form,
        mode: isTest ? 'test' : 'live',
        amount: parseFloat(form.amount),
        usage_limit: form.usage_limit ? parseInt(form.usage_limit, 10) : null,
      });
      enqueueSnackbar('Link created successfully!', { variant: 'success' });
      onRefresh();
      onClose();
      setForm({
        title: '',
        description: '',
        amount: '',
        currency: currentCurrency,
        type: 'professional',
        usage_limit: '',
        payment_action: 'message',
        redirect_url: '',
      });
    } catch (error) {
      enqueueSnackbar('Failed to create link', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', md: 600 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 4,
          boxShadow: 24,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Create {isTest ? 'Test' : 'Live'} Payment Link
        </Typography>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Link Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">{currentCurrency}</InputAdornment>,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Link Type</InputLabel>
              <Select
                value={form.type}
                label="Link Type"
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TextField
            fullWidth
            label="Usage Limit"
            type="number"
            value={form.usage_limit}
            onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Payment Action</InputLabel>
            <Select
              value={form.payment_action}
              label="Payment Action"
              onChange={(e) => setForm({ ...form, payment_action: e.target.value })}
            >
              <MenuItem value="message">Show Success Message</MenuItem>
              <MenuItem value="redirect">Redirect to URL</MenuItem>
            </Select>
          </FormControl>

          <Collapse in={form.payment_action === 'redirect'}>
            <TextField
              fullWidth
              label="Redirect URL"
              value={form.redirect_url}
              onChange={(e) => setForm({ ...form, redirect_url: e.target.value })}
            />
          </Collapse>

          <Button
            fullWidth
            variant="contained"
            size="large"
            color={isTest ? 'warning' : 'primary'}
            onClick={handleSubmit}
            disabled={submitting || !form.title || !form.amount}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Generate Payment Link'}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
