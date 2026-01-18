/* eslint-disable no-alert */
import { useState, useMemo, SetStateAction } from 'react';
import Head from 'next/head';
import * as XLSX from 'xlsx';
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
  Modal,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
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
import { fDate, fDateTime } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
import { TransactionTableToolbar } from './TransactionTableToolbar';

// ----------------------------------------------------------------------

type Payout = {
  id: string;
  reference: string;
  amount: number;
  currency: 'NGN';
  status: 'paid' | 'pending' | 'in_transit' | 'failed';
  arrivalDate: string;
  bankName: string;
  accountNumber: string;
};

const TABLE_HEAD = [
  { id: 'arrivalDate', label: 'Date', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'bank', label: 'Destination', align: 'left' },
  { id: 'reference', label: 'Reference', align: 'right' },
];

const MOCK_PAYOUTS: Payout[] = [
  {
    id: 'PO-991',
    reference: 'SETTL-88210',
    amount: 45000,
    currency: 'NGN',
    status: 'paid',
    arrivalDate: '2026-01-15T10:00:00Z',
    bankName: 'Access Bank',
    accountNumber: '0123456789',
  },
  {
    id: 'PO-992',
    reference: 'SETTL-88215',
    amount: 125000,
    currency: 'NGN',
    status: 'in_transit',
    arrivalDate: '2026-01-17T14:20:00Z',
    bankName: 'Zenith Bank',
    accountNumber: '9876543210',
  },
  {
    id: 'PO-993',
    reference: 'SETTL-88220',
    amount: 15000,
    currency: 'NGN',
    status: 'pending',
    arrivalDate: '2026-01-18T08:00:00Z',
    bankName: 'Kuda Bank',
    accountNumber: '1122334455',
  },
];

const BANKS = ['Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA', 'Kuda Bank'];

// ----------------------------------------------------------------------

PayoutHistoryPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function PayoutHistoryPage() {
  const { themeStretch } = useSettingsContext();
  const { page, order, orderBy, rowsPerPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable();

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // UI States
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const dataFiltered = useMemo(() => {
    const filtered = MOCK_PAYOUTS.filter((item) => {
      const matchRef = item.reference.toLowerCase().includes(filterName.toLowerCase());
      let matchDate = true;
      if (filterStartDate)
        matchDate = matchDate && new Date(item.arrivalDate) >= new Date(filterStartDate);
      if (filterEndDate)
        matchDate = matchDate && new Date(item.arrivalDate) <= new Date(filterEndDate);
      return matchRef && matchDate;
    });
    return filtered.sort((a, b) => getComparator(order, orderBy)(a as any, b as any));
  }, [filterName, filterStartDate, filterEndDate, order, orderBy]);

  // FUNCTIONAL EXPORT LOGIC
  const handleExportXLS = () => {
    // 1. Map data to human-readable format for Excel
    const exportData = dataFiltered.map((payout) => ({
      'Arrival Date': fDateTime(payout.arrivalDate),
      'Amount (NGN)': payout.amount,
      Status: payout.status.toUpperCase(),
      'Bank Name': payout.bankName,
      'Account Number': payout.accountNumber,
      Reference: payout.reference,
    }));

    // 2. Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payout History');

    // 3. Trigger download
    XLSX.writeFile(workbook, `PayLens_Payouts_NGN_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <>
      <Head>
        <title> Payout History | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3">NGN Payouts</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage your settlements and manual withdrawals.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:card-send-bold" />}
            onClick={() => setOpenModal(true)}
          >
            Initiate Payout
          </Button>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Total Paid Out"
              amount={fCurrency(170000, 'NGN')}
              variant="primary"
              icon={<Iconify icon="solar:safe-square-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Available Balance"
              amount={fCurrency(85400, 'NGN')}
              variant="success"
              icon={<Iconify icon="solar:wallet-bold-duotone" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Pending Settlement"
              amount={fCurrency(125000, 'NGN')}
              variant="warning"
              icon={<Iconify icon="solar:clock-circle-bold-duotone" />}
            />
          </Grid>
        </Grid>

        <Card>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pr: 2 }}>
            <TransactionTableToolbar
              filterName={filterName}
              startDate={filterStartDate}
              endDate={filterEndDate}
              onFilterName={(e: { target: { value: SetStateAction<string>; }; }) => setFilterName(e.target.value)}
              onChangeStartDate={(e: { target: { value: SetStateAction<string>; }; }) => setFilterStartDate(e.target.value)}
              onChangeEndDate={(e: { target: { value: SetStateAction<string>; }; }) => setFilterEndDate(e.target.value)}
            />
            <Button
              variant="soft"
              color="info"
              startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
              onClick={handleExportXLS}
            >
              Export XLS
            </Button>
          </Stack>

          <TableContainer>
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
                    .map((row) => (
                      <TableRow
                        hover
                        key={row.id}
                        onClick={() => {
                          setSelectedPayout(row);
                          setOpenDrawer(true);
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{fDate(row.arrivalDate)}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {fCurrency(row.amount, 'NGN')}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.75,
                              typography: 'caption',
                              fontWeight: 'bold',
                              bgcolor:
                                row.status === 'paid' ? 'success.lighter' : 'warning.lighter',
                              color: row.status === 'paid' ? 'success.darker' : 'warning.darker',
                              textTransform: 'capitalize',
                            }}
                          >
                            {row.status.replace('_', ' ')}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.bankName}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            ****{row.accountNumber.slice(-4)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          {row.reference}
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

      <InitiatePayoutModal open={openModal} onClose={() => setOpenModal(false)} />

      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: 350 } }}
      >
        {selectedPayout && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Payout Details
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="h4">{fCurrency(selectedPayout.amount, 'NGN')}</Typography>
              </Box>
              <Typography variant="body2">
                <strong>Bank:</strong> {selectedPayout.bankName}
              </Typography>
              <Typography variant="body2">
                <strong>Account:</strong> {selectedPayout.accountNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Ref:</strong> {selectedPayout.reference}
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
              >
                Download Receipt
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

function InitiatePayoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [form, setForm] = useState({ bank: '', account: '', amount: '', pin: '' });

  const handleValidate = () => {
    if (form.account.length !== 10) return;
    setLoading(true);
    setTimeout(() => {
      setAccountName('CHUKWUMA ADESINA O.');
      setLoading(false);
      setStep(1);
    }, 1200);
  };

  const handleFinalSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Payout Initiated Successfully!');
      onClose();
      setStep(0);
      setForm({ bank: '', account: '', amount: '', pin: '' });
      setAccountName('');
    }, 1800);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 450,
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h5" sx={{ mb: 1 }}>
          Withdraw Funds
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Available for withdrawal: <strong>₦85,400.00</strong>
        </Typography>

        <Stepper activeStep={step} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Bank Info</StepLabel>
          </Step>
          <Step>
            <StepLabel>Authorize</StepLabel>
          </Step>
        </Stepper>

        {step === 0 ? (
          <Stack spacing={3}>
            <TextField
              select
              fullWidth
              label="Destination Bank"
              value={form.bank}
              onChange={(e) => setForm({ ...form, bank: e.target.value })}
            >
              {BANKS.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Account Number"
              value={form.account}
              onChange={(e) => setForm({ ...form, account: e.target.value })}
              inputProps={{ maxLength: 10 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!form.bank || form.account.length < 10 || loading}
              onClick={handleValidate}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Account'}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Alert severity="info">
              Account: <strong>{accountName}</strong>
            </Alert>
            <TextField
              fullWidth
              label="Amount to Withdraw"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
            />
            <TextField
              fullWidth
              label="Security PIN"
              type="password"
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
              inputProps={{ maxLength: 4, style: { textAlign: 'center', letterSpacing: '8px' } }}
            />
            <Stack direction="row" spacing={2}>
              <Button fullWidth variant="outlined" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                fullWidth
                variant="contained"
                disabled={!form.amount || form.pin.length < 4 || loading}
                onClick={handleFinalSubmit}
              >
                {loading ? <CircularProgress size={24} /> : 'Complete Transfer'}
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Modal>
  );
}
