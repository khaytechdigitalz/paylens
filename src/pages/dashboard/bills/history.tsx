/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable import/extensions */
import { useState, useEffect, useCallback } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
import { fDate, fDateTime } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
import { TransactionTableToolbar } from './billstabletoolbar';
import TransactionReceipt from './receipt';
// axios instance
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'date', label: 'Date', align: 'left' },
  { id: 'type', label: 'Service', align: 'left' },
  { id: 'beneficiary', label: 'Beneficiary', align: 'left' },
  { id: 'network', label: 'Provider', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'action', label: '', align: 'right' },
];

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: 'All' },
  { label: 'Airtime', value: 'airtime' },
  { label: 'Internet', value: 'internet' },
  { label: 'Cable TV', value: 'cabletv' },
  { label: 'Electricity', value: 'electricity' },
];

const BILL_SERVICES = [
  { title: 'Airtime', icon: 'solar:phone-calling-bold-duotone', path: 'airtime', color: '#007BFF' },
  {
    title: 'Internet',
    icon: 'solar:wi-fi-router-bold-duotone',
    path: 'internet',
    color: '#28A745',
  },
  { title: 'Cable TV', icon: 'solar:tv-bold-duotone', path: 'cabletv', color: '#FFC107' },
  {
    title: 'Electricity',
    icon: 'solar:plug-circle-bold-duotone',
    path: 'electricity',
    color: '#FD7E14',
  },
];

// ----------------------------------------------------------------------

BillsHistoryPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function BillsHistoryPage() {
  const { push } = useRouter();
  const { themeStretch } = useSettingsContext();

  const { page, order, orderBy, rowsPerPage, setPage, onSort, onChangeRowsPerPage } = useTable();

  // States
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [openDetailsDrawer, setOpenDetailsDrawer] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [openReceipt, setOpenReceipt] = useState(false);

  // Fetch Data from API
  const getBills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/bills/history', {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          category: filterCategory !== 'All' ? filterCategory : undefined,
          search: filterName || undefined,
        },
      });
      setBills(response.data.bills.data);
      setStats(response.data.statistics);
      setTotalItems(response.data.bills.total);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterCategory, filterName]);

  useEffect(() => {
    getBills();
  }, [getBills]);

  const handleOpenDetails = (row: any) => {
    setSelectedBill(row);
    setOpenDetailsDrawer(true);
  };

  const handlePrintReceipt = (row: any) => {
    setSelectedBill(row);
    setOpenReceipt(true);
  };

  const handleExportXLS = () => {
    const ws = XLSX.utils.json_to_sheet(bills);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bills');
    XLSX.writeFile(wb, `Bills_Export_${new Date().getTime()}.xlsx`);
  };

  return (
    <>
      <Head>
        <title>Bills History | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3">Bills History</Typography>
            <Typography variant="body2" color="text.secondary">
              Managing utility payments and history.
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

        {/* Statistics Section */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {BILL_SERVICES.map((service) => {
            const apiType = service.path === 'cable' ? 'cabletv' : service.path;
            const categoryData = stats?.categories?.[apiType];

            return (
              <Grid item xs={12} sm={6} md={3} key={service.title}>
                <StatWidget
                  title={service.title}
                  amount={fCurrency(categoryData?.total_amount || 0, 'NGN')}
                  icon={<Iconify icon={service.icon} width={32} />}
                  
                />
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, display: 'block', color: 'text.secondary', textAlign: 'center' }}
                >
                  {categoryData?.total_count || 0} Transactions
                </Typography>
              </Grid>
            );
          })}
        </Grid>

        <Card>
          {loading && <LinearProgress />}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2.5 }}>
            <TextField
              select
              label="Service Category"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 200 }}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TransactionTableToolbar
              filterName={filterName}
              onFilterName={(e) => {
                setFilterName(e.target.value);
                setPage(0);
              }}
              startDate={''}
              endDate={''}
              onChangeStartDate={() => {}}
              onChangeEndDate={() => {}}
            />

            <Button
              variant="soft"
              color="info"
              startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
              onClick={handleExportXLS}
              sx={{ height: 56, px: 3 }}
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
                  {bills.map((row: any) => (
                    <TableRow
                      hover
                      key={row.id}
                      onClick={() => handleOpenDetails(row)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{fDate(row.created_at)}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                          {row.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.plan || 'Standard'}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.beneficiary}</TableCell>
                      <TableCell sx={{ textTransform: 'uppercase' }}>{row.network}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {fCurrency(row.amount, 'NGN')}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 0.5,
                            display: 'inline-flex',
                            typography: 'caption',
                            fontWeight: 'bold',
                            bgcolor:
                              row.status === 'delivered'
                                ? alpha('#22C55E', 0.16)
                                : alpha('#FFAB00', 0.16),
                            color: row.status === 'delivered' ? '#118D57' : '#B76E00',
                          }}
                        >
                          {row.status.toUpperCase()}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
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
                  <TableNoData isNotFound={!loading && !bills.length} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalItems}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, p) => setPage(p)}
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
            boxShadow: 24,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>
            Select Service Type
          </Typography>
          <Grid container spacing={2}>
            {BILL_SERVICES.map((s) => (
              <Grid item xs={6} sm={3} key={s.title}>
                <Card
                  variant="outlined"
                  sx={{ '&:hover': { borderColor: 'primary.main', bgcolor: alpha(s.color, 0.04) } }}
                >
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
            <Stack spacing={2.5}>
              <Box
                sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5, textAlign: 'center' }}
              >
                <Typography variant="h4">{fCurrency(selectedBill.amount, 'NGN')}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 'bold',
                    color: selectedBill.status === 'delivered' ? 'success.main' : 'warning.main',
                  }}
                >
                  {selectedBill.status.toUpperCase()}
                </Typography>
              </Box>

              <DetailItem label="Reference ID" value={selectedBill.transaction_id} />
              <DetailItem label="Date" value={fDateTime(selectedBill.created_at)} />
              <DetailItem label="Service" value={selectedBill.type.toUpperCase()} />
              <DetailItem label="Provider" value={selectedBill.network.toUpperCase()} />
              <DetailItem label="Beneficiary" value={selectedBill.beneficiary} />

              {selectedBill.val_1 && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'primary.lighter',
                    borderRadius: 1,
                    color: 'primary.darker',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                    SUPPLEMENTARY INFO
                  </Typography>
                  <Typography variant="body2">{selectedBill.val_1}</Typography>
                </Box>
              )}

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
                onClick={() => setOpenReceipt(true)}
              >
                Generate Receipt
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* RECEIPT COMPONENT */}
      {selectedBill && (
        <TransactionReceipt
          open={openReceipt}
          onClose={() => setOpenReceipt(false)}
          transaction={{
            type: (selectedBill.type.charAt(0).toUpperCase() + selectedBill.type.slice(1)) as any,
            amount: Number(selectedBill.amount),
            beneficiary: selectedBill.beneficiary,
            provider: selectedBill.network.toUpperCase(),
            reference: selectedBill.transaction_id,
            date: selectedBill.created_at,
            token: selectedBill.val_1?.includes('Token')
              ? selectedBill.val_1.split(': ')[1]
              : undefined,
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
      <Typography variant="subtitle2" sx={{ textAlign: 'right', pl: 2 }}>
        {value}
      </Typography>
    </Stack>
  );
}
