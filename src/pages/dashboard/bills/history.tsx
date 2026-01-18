/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable func-names */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-alert */
import { useState, useMemo, SetStateAction } from 'react';
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
  TableBody,
  Container,
  TableRow,
  TableCell,
  Typography,
  TableContainer,
  Drawer,
  Box,
  Divider,
  Modal,
  CardActionArea,
  MenuItem,
  TextField,
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
import { fCurrency } from '../../../utils/formatNumber';
import { TransactionTableToolbar } from './TransactionTableToolbar';

// IMPORT YOUR CUSTOM RECEIPT COMPONENT
import TransactionReceipt from './TransactionReceipt';

// ----------------------------------------------------------------------

type BillPayment = {
  id: string;
  ref: string;
  amount: number;
  beneficiary: string;
  company: string;
  plan: string;
  date: string;
  status: 'successful' | 'failed' | 'pending';
  category: 'Airtime' | 'Data' | 'Cable TV' | 'Electricity';
};

const TABLE_HEAD = [
  { id: 'date', label: 'Date', align: 'left' },
  { id: 'company', label: 'Company', align: 'left' },
  { id: 'beneficiary', label: 'Beneficiary', align: 'left' },
  { id: 'plan', label: 'Plan', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'left' },
  { id: 'ref', label: 'Reference', align: 'right' },
];

const CATEGORY_OPTIONS = ['All', 'Airtime', 'Data', 'Cable TV', 'Electricity'];

const BILL_SERVICES = [
  { title: 'Airtime', icon: 'solar:phone-calling-bold-duotone', path: 'airtime', color: '#007BFF' },
  {
    title: 'Internet',
    icon: 'solar:wi-fi-router-bold-duotone',
    path: 'internet',
    color: '#28A745',
  },
  { title: 'Cable TV', icon: 'solar:tv-bold-duotone', path: 'cable', color: '#FFC107' },
  {
    title: 'Electricity',
    icon: 'solar:plug-circle-bold-duotone',
    path: 'electricity',
    color: '#FD7E14',
  },
];

const MOCK_BILLS: BillPayment[] = [
  {
    id: 'B-001',
    ref: 'BILL-7721',
    amount: 5000,
    beneficiary: '08012345678',
    company: 'MTN',
    plan: '6GB Data Monthly',
    date: '2026-01-16T10:00:00Z',
    status: 'successful',
    category: 'Data',
  },
  {
    id: 'B-002',
    ref: 'BILL-7725',
    amount: 18500,
    beneficiary: '4421009921',
    company: 'DSTV',
    plan: 'Premium Bouquet',
    date: '2026-01-16T14:30:00Z',
    status: 'successful',
    category: 'Cable TV',
  },
  {
    id: 'B-003',
    ref: 'BILL-7730',
    amount: 10000,
    beneficiary: '01012293844',
    company: 'Ikeja Electric',
    plan: 'Prepaid Token',
    date: '2026-01-17T09:15:00Z',
    status: 'pending',
    category: 'Electricity',
  },
];

// ----------------------------------------------------------------------

BillsHistoryPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function BillsHistoryPage() {
  const { push } = useRouter();
  const { themeStretch } = useSettingsContext();
  const { page, order, orderBy, rowsPerPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable();

  // States
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [openDetailsDrawer, setOpenDetailsDrawer] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillPayment | null>(null);
  const [openReceipt, setOpenReceipt] = useState(false);

  // Filter Logic
  const dataFiltered = useMemo(() => {
    let filtered = MOCK_BILLS;

    if (filterCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    if (filterName) {
      filtered = filtered.filter(
        (item) =>
          item.ref.toLowerCase().includes(filterName.toLowerCase()) ||
          item.beneficiary.toLowerCase().includes(filterName.toLowerCase()) ||
          item.company.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    return filtered.sort((a, b) => getComparator(order, orderBy)(a as any, b as any));
  }, [filterName, filterCategory, order, orderBy]);

  const handleOpenDetails = (row: BillPayment) => {
    setSelectedBill(row);
    setOpenDetailsDrawer(true);
  };

  const handlePrintReceipt = (row: BillPayment) => {
    setSelectedBill(row);
    setOpenReceipt(true);
  };

  const handleExportXLS = () => {
    const ws = XLSX.utils.json_to_sheet(dataFiltered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bills');
    XLSX.writeFile(wb, `Bills_History_${fDate(new Date())}.xlsx`);
  };

  return (
    <>
      <Head>
        <title> Bills History | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3">Bills History</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Filter and manage your utility payments.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => setOpenServiceModal(true)}
          >
            New Bill Payment
          </Button>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Total Spent"
              amount={fCurrency(33500, 'NGN')}
              variant="primary"
              icon={<Iconify icon="solar:bill-list-bold-duotone" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Success Rate"
              amount="98%"
              variant="success"
              icon={<Iconify icon="solar:check-circle-bold-duotone" width={32} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget
              title="Pending"
              amount={fCurrency(10000, 'NGN')}
              variant="warning"
              icon={<Iconify icon="solar:clock-circle-bold-duotone" width={32} />}
            />
          </Grid>
        </Grid>

        <Card>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2.5 }}>
            <TextField
              select
              label="Service Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TransactionTableToolbar
              filterName={filterName}
              onFilterName={(e: { target: { value: SetStateAction<string>; }; }) => setFilterName(e.target.value)} startDate={''} endDate={''} onChangeStartDate={function (_event: React.ChangeEvent<HTMLInputElement>): void {
                throw new Error('Function not implemented.');
              } } onChangeEndDate={function (event: React.ChangeEvent<HTMLInputElement>): void {
                throw new Error('Function not implemented.');
              } }            />

            <Button
              variant="soft"
              color="info"
              startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
              onClick={handleExportXLS}
              sx={{ height: 56 }}
            >
              Export
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
                        onClick={() => handleOpenDetails(row)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{fDate(row.date)}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{row.company}</Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'primary.main', fontWeight: 'bold' }}
                          >
                            {row.category}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.beneficiary}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{row.plan}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {fCurrency(row.amount, 'NGN')}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintReceipt(row);
                            }}
                          >
                            Receipt
                          </Button>
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

      {/* MODAL: SERVICE SELECTION */}
      <Modal open={openServiceModal} onClose={() => setOpenServiceModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', md: 600 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>
            Select Service Type
          </Typography>
          <Grid container spacing={2}>
            {BILL_SERVICES.map((s) => (
              <Grid item xs={6} sm={3} key={s.title}>
                <Card variant="outlined" sx={{ '&:hover': { borderColor: 'primary.main' } }}>
                  <CardActionArea
                    onClick={() => push(`/dashboard/bills/${s.path}`)}
                    sx={{ p: 3, textAlign: 'center' }}
                  >
                    <Iconify icon={s.icon} width={40} sx={{ color: s.color, mb: 1 }} />
                    <Typography variant="subtitle2">{s.title}</Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Modal>

      {/* DRAWER: QUICK DETAILS */}
      <Drawer
        anchor="right"
        open={openDetailsDrawer}
        onClose={() => setOpenDetailsDrawer(false)}
        PaperProps={{ sx: { width: 350 } }}
      >
        {selectedBill && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Transaction Details
            </Typography>
            <Stack spacing={2}>
              <Box
                sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1, textAlign: 'center' }}
              >
                <Typography variant="h4">{fCurrency(selectedBill.amount, 'NGN')}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  STATUS: {selectedBill.status.toUpperCase()}
                </Typography>
              </Box>
              <DetailItem label="Reference" value={selectedBill.ref} />
              <DetailItem label="Service" value={selectedBill.category} />
              <DetailItem label="Provider" value={selectedBill.company} />
              <DetailItem label="Recipient" value={selectedBill.beneficiary} />
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Button
                fullWidth
                variant="contained"
                startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
                onClick={() => setOpenReceipt(true)}
              >
                Print Receipt
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* EXTERNAL COMPONENT: TRANSACTION RECEIPT */}
      {selectedBill && (
        <TransactionReceipt
          open={openReceipt}
          onClose={() => setOpenReceipt(false)}
          transaction={{
            type: selectedBill.category,
            amount: selectedBill.amount,
            beneficiary: selectedBill.beneficiary,
            provider: selectedBill.company,
            reference: selectedBill.ref,
            date: selectedBill.date,
          }}
        />
      )}
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  );
}
