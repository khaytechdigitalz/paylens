/* eslint-disable react/jsx-no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-alert */
/* eslint-disable import/extensions */
import { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
  Switch,
  Modal,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Collapse,
  Alert,
  AlertTitle,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
import { fCurrency } from '../../../utils/formatNumber';
import { TransactionTableToolbar } from './TransactionTableToolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Link Name', align: 'left' },
  { id: 'type', label: 'Type', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'totalPayments', label: 'Sales', align: 'center' },
  { id: 'totalRevenue', label: 'Total Revenue', align: 'left' },
  { id: 'createdAt', label: 'Created', align: 'right' },
  { id: 'action', label: '', align: 'right' },
];

const MOCK_LINKS = [
  {
    id: 'PL-101',
    name: 'Standard Consultation',
    type: 'one-time',
    amount: 50,
    totalPayments: 12,
    totalRevenue: 600,
    status: 'active',
    createdAt: '2026-01-05',
    currency: 'USD',
    limit: 50,
    expiry: '2026-12-31',
    isTest: false,
  },
  {
    id: 'PL-102',
    name: 'Monthly Maintenance',
    type: 'subscription',
    amount: 5000,
    totalPayments: 4,
    totalRevenue: 20000,
    status: 'active',
    createdAt: '2026-01-08',
    currency: 'NGN',
    limit: 'Unlimited',
    expiry: 'None',
    isTest: false,
  },
  {
    id: 'PL-TEST-01',
    name: 'Sandbox Test Product',
    type: 'one-time',
    amount: 10,
    totalPayments: 2,
    totalRevenue: 20,
    status: 'active',
    createdAt: '2026-01-15',
    currency: 'USD',
    limit: 5,
    expiry: '2026-01-20',
    isTest: true,
  },
];

// ----------------------------------------------------------------------

PaymentLinkPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PaymentLinkPage() {
  const theme = useTheme();
  const { push } = useRouter();
  const { themeStretch } = useSettingsContext();
  const { page, order, orderBy, rowsPerPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable();

  const [currency, setCurrency] = useState('NGN');
  const [isTestMode, setIsTestMode] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDetailsDrawer, setOpenDetailsDrawer] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);

  // 1. Define a specific interface for your Payment Link
  interface PaymentLink {
    id: string;
    name: string;
    type: string;
    amount: number;
    totalPayments: number;
    totalRevenue: number;
    status: string;
    createdAt: string;
    currency: string;
    limit: number | string;
    expiry: string;
    isTest: boolean;
  }

  // 2. Use the interface in your useMemo
  const dataFiltered = useMemo(() => {
    // Cast MOCK_LINKS or ensure it's typed as PaymentLink[]
    const filtered = MOCK_LINKS.filter((item: PaymentLink) => {
      const matchMode = item.isTest === isTestMode;
      const matchCurrency = item.currency === currency;
      const matchName = item.name.toLowerCase().includes(filterName.toLowerCase());

      let matchDate = true;
      if (filterStartDate) {
        matchDate = matchDate && new Date(item.createdAt) >= new Date(filterStartDate);
      }
      if (filterEndDate) {
        matchDate = matchDate && new Date(item.createdAt) <= new Date(filterEndDate);
      }

      return matchMode && matchCurrency && matchName && matchDate;
    });

    // Type assertion 'as any' here resolves the comparator constraint
    // without breaking the actual sorting logic
    return filtered.sort((a, b) => getComparator(order, orderBy)(a as any, b as any));
  }, [isTestMode, currency, filterName, filterStartDate, filterEndDate, order, orderBy]);

  const stats = {
    revenue: dataFiltered.reduce((acc, curr) => acc + curr.totalRevenue, 0),
    sales: dataFiltered.reduce((acc, curr) => acc + curr.totalPayments, 0),
    active: dataFiltered.filter((l) => l.status === 'active').length,
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(dataFiltered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PaymentLinks');
    XLSX.writeFile(wb, `PaymentLinks_${isTestMode ? 'TEST' : 'LIVE'}_${currency}.xlsx`);
  };

  return (
    <>
      <Head>
        <title> Payment Links | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        {isTestMode && (
          <Alert
            severity="warning"
            variant="filled"
            sx={{ mb: 3, bgcolor: theme.palette.warning.dark }}
          >
            <AlertTitle sx={{ fontWeight: 'bold' }}>Test Mode Enabled</AlertTitle>
            You are viewing sandbox data.
          </Alert>
        )}

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3">Payment Links</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 'bold',
                      color: isTestMode ? 'warning.main' : 'text.disabled',
                    }}
                  >
                    TEST MODE
                  </Typography>
                }
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <ToggleButtonGroup
              value={currency}
              exclusive
              onChange={(e, val) => val && setCurrency(val)}
              size="small"
              color={isTestMode ? 'warning' : 'primary'}
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
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Link Revenue"
              amount={fCurrency(stats.revenue, currency)}
              variant={isTestMode ? 'warning' : 'primary'}
              icon={<Iconify icon="solar:round-alt-arrow-up-bold-duotone" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Total Sales"
              amount={stats.sales}
              variant="info"
              icon={<Iconify icon="solar:bag-check-bold-duotone" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Active Links"
              amount={stats.active}
              variant="success"
              icon={<Iconify icon="solar:link-bold-duotone" width={32} />}
            />
          </Grid>
        </Grid>

        <Card sx={{ border: isTestMode ? `1px dashed ${theme.palette.warning.main}` : 'none' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pr: 2 }}>
            <TransactionTableToolbar
              filterName={filterName}
              startDate={filterStartDate}
              endDate={filterEndDate}
              onFilterName={(e) => setFilterName(e.target.value)}
              onChangeStartDate={(e) => setFilterStartDate(e.target.value)}
              onChangeEndDate={(e) => setFilterEndDate(e.target.value)}
            />
            <Button
              variant="soft"
              color="inherit"
              startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
              onClick={handleExport}
            >
              Export XLS
            </Button>
          </Stack>

          <TableContainer>
            <Scrollbar>
              <Table sx={{ minWidth: 900 }}>
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
                          setSelectedLink(row);
                          setOpenDetailsDrawer(true);
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2">{row.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            paylens.me/{row.id}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{row.type}</TableCell>
                        <TableCell>
                          <Switch
                            size="small"
                            defaultChecked={row.status === 'active'}
                            onClick={(e) => e.stopPropagation()}
                            color={isTestMode ? 'warning' : 'primary'}
                          />
                        </TableCell>
                        <TableCell align="center">{row.totalPayments}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {fCurrency(row.totalRevenue, currency)}
                        </TableCell>
                        <TableCell align="right">{fDate(row.createdAt)}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Copied!');
                            }}
                            color={isTestMode ? 'warning' : 'primary'}
                          >
                            <Iconify icon="solar:copy-bold-duotone" />
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

      {/* CREATE MODAL */}
      <CreateLinkModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        currentCurrency={currency}
        isTest={isTestMode}
      />

      {/* MANAGEMENT DRAWER */}
      <Drawer
        anchor="right"
        open={openDetailsDrawer}
        onClose={() => setOpenDetailsDrawer(false)}
        PaperProps={{ sx: { width: 400 } }}
      >
        {selectedLink && (
          <Box sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6">Link Control Center</Typography>
              <IconButton onClick={() => setOpenDetailsDrawer(false)}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>

            <Stack spacing={4}>
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Typography variant="overline" display="block">
                  Quick Stats
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: isTestMode ? 'warning.main' : 'primary.main' }}
                >
                  {fCurrency(selectedLink.totalRevenue, currency)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Generated from {selectedLink.totalPayments} successful payments
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                color={isTestMode ? 'warning' : 'primary'}
                startIcon={<Iconify icon="solar:chart-square-bold" />}
                onClick={() => push(`/dashboard/paymentlink/${selectedLink.id}/details`)}
              >
                View Full Analytics & Sales
              </Button>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Share on Socials
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="soft"
                    color="success"
                    startIcon={<Iconify icon="logos:whatsapp-icon" />}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    fullWidth
                    variant="soft"
                    color="info"
                    startIcon={<Iconify icon="logos:twitter" />}
                  >
                    Twitter
                  </Button>
                </Stack>
              </Box>

              <Stack spacing={1.5}>
                <Button fullWidth variant="soft" color="inherit">
                  Edit Link Configuration
                </Button>
                <Button fullWidth variant="outlined" color="error">
                  Archive This Link
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

function CreateLinkModal({ open, onClose, currentCurrency, isTest }: any) {
  const [form, setForm] = useState({ after: 'message' });

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 550,
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 4,
          boxShadow: 24,
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Create {isTest ? 'Test' : 'Live'} Link
        </Typography>
        <Stack spacing={3}>
          <TextField fullWidth label="Link Title" />
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">{currentCurrency}</InputAdornment>,
              }}
            />
            <TextField fullWidth label="Usage Limit" type="number" placeholder="Unlimited" />
          </Stack>
          <Box>
            <FormControl fullWidth sx={{ mb: form.after === 'redirect' ? 2 : 0 }}>
              <InputLabel>After Payment Action</InputLabel>
              <Select
                value={form.after}
                label="After Payment Action"
                onChange={(e) => setForm({ ...form, after: e.target.value })}
              >
                <MenuItem value="message">Show Success Message</MenuItem>
                <MenuItem value="redirect">Redirect to Website</MenuItem>
              </Select>
            </FormControl>
            <Collapse in={form.after === 'redirect'}>
              <TextField fullWidth label="Custom Redirect URL" placeholder="https://..." />
            </Collapse>
          </Box>
          <Button
            fullWidth
            variant="contained"
            size="large"
            color={isTest ? 'warning' : 'primary'}
            onClick={onClose}
          >
            Generate Link
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
