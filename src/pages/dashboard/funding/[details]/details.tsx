import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme, 
} from '@mui/material';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import { useSettingsContext } from '../../../../components/settings';
import axios from '../../../../utils/axios';
import { fCurrency } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';
// Local Components
import FundCardModal from './FundCardModal';
import UpdateStatusModal from './UpdateStatusModal';
import UpdatePinModal from './UpdatePinModal';

// ----------------------------------------------------------------------

CardDetailsPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function CardDetailsPage() {
  const theme = useTheme();
  const { query, push } = useRouter();
  const { details: sn } = query; // Card Serial/ID from URL
  const { themeStretch } = useSettingsContext();

  const [card, setCard] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [openFund, setOpenFund] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openPin, setOpenPin] = useState(false);

  const fetchData = useCallback(async () => {
    if (!sn) return;
    setLoading(true);
    try {
      const [detailsRes, transRes] = await Promise.all([
        axios.get(`/virtualcard/details/${sn}`),
        axios.get(`/virtualcard/transactions/${sn}`),
      ]);
      setCard(detailsRes.data.data);
      setTransactions(transRes.data.data);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, [sn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Head>
        <title>Card Details | {card?.card_id || 'Virtual Card'}</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
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
              sx={{ color: 'text.disabled', cursor: 'pointer', mb: 1 }}
              onClick={() => push('/dashboard/virtualcard/log')}
            >
              <Iconify icon="solar:alt-arrow-left-linear" width={16} />
              <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                Back to Cards
              </Typography>
            </Stack>
            <Typography variant="h3">Card Management</Typography>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
              onClick={() => setOpenFund(true)}
            >
              Fund Card
            </Button>
            <Button
              variant="soft"
              color="warning"
              startIcon={<Iconify icon="solar:shield-cross-bold-duotone" />}
              onClick={() => setOpenStatus(true)}
            >
              Update Status
            </Button>
            <Button
              variant="soft"
              color="info"
              startIcon={<Iconify icon="solar:key-bold-duotone" />}
              onClick={() => setOpenPin(true)}
            >
              Change PIN
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Card Visual & Summary */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card
                sx={{
                  p: 3,
                  bgcolor: 'grey.900',
                  color: 'common.white',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                  <Iconify icon="solar:plain-2-bold-duotone" width={160} />
                </Box>
                <Typography variant="overline" sx={{ opacity: 0.6 }}>
                  {card?.brand || 'VISA'} VIRTUAL
                </Typography>
                <Typography variant="h4" sx={{ my: 3, letterSpacing: 4, fontFamily: 'monospace' }}>
                  {card?.pan ? `**** **** **** ${card.pan.slice(-4)}` : '**** **** **** ****'}
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>
                      CARD HOLDER
                    </Typography>
                    <Typography variant="subtitle1">
                      {JSON.parse(card?.api || '{}').name_on_card || 'Customer'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>
                      EXPIRES
                    </Typography>
                    <Typography variant="subtitle1">
                      {card?.expiry_month || 'XX'}/{card?.expiry_year || 'XX'}
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Card Properties
                </Typography>
                <Stack spacing={2}>
                  <DetailRow label="Currency" value={card?.currency} />
                  <DetailRow label="Environment" value={card?.environment} />
                  <DetailRow label="Status" value={card?.status} isStatus />
                  <DetailRow label="Reference" value={card?.reference} />
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Transaction History */}
          <Grid item xs={12} md={8}>
            <Card>
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6">Transaction History</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((trx) => (
                      <TableRow key={trx.id} hover>
                        <TableCell>{fDateTime(trx.createdAt)}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{trx.narrative}</Typography>
                          <Typography variant="caption" color="text.disabled">
                            {trx.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            color={trx.status === 'success' ? 'success.main' : 'error.main'}
                          >
                            {fCurrency(trx.amount, trx.currency.toUpperCase())}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              color: trx.status === 'success' ? 'success.main' : 'error.main',
                            }}
                          >
                            {trx.status}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Modal Components */}
        <FundCardModal
          open={openFund}
          onClose={() => setOpenFund(false)}
          sn={sn}
          onRefresh={fetchData}
        />
        <UpdateStatusModal
          open={openStatus}
          onClose={() => setOpenStatus(false)}
          sn={sn}
          onRefresh={fetchData}
        />
        <UpdatePinModal
          open={openPin}
          onClose={() => setOpenPin(false)}
          sn={sn}
          onRefresh={fetchData}
        />
      </Container>
    </>
  );
}

function DetailRow({ label, value, isStatus = false }: any) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ color: isStatus && value === 'active' ? 'success.main' : 'inherit' }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
