/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Divider,
  IconButton,
  Tooltip,
  Paper,
  alpha,
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
import FundCardModal from './bridgecomponent/FundCardModal';
import UpdateStatusModal from './bridgecomponent/UpdateStatusModal';
import UpdatePinModal from './bridgecomponent/UpdatePinModal';

// ----------------------------------------------------------------------

CardDetailsPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function CardDetailsPage() {
  const theme = useTheme();
  const { query, push } = useRouter();

  // Clean parameter routing handling matching Next.js Query context safely
  const { details: sn } = query; // Card Serial/ID from URL

  const { themeStretch } = useSettingsContext();

  // Data Engine States
  const [card, setCard] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Security Masking State
  const [showCardDetails, setShowCardDetails] = useState(false);

  // Modal Component States
  const [openFund, setOpenFund] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openPin, setOpenPin] = useState(false);

  const fetchData = useCallback(async () => {
    if (!sn) return;
    setLoading(true);
    try {
      const [detailsRes, transRes, balanceRes] = await Promise.all([
        axios.get(`/virtualcard/bridgecard/card/details/${sn}`),
        axios.get(`/virtualcard/bridgecard/card/transactions/${sn}`),
        axios.get(`/virtualcard/bridgecard/card/balance/${sn}`),
      ]);

      setCard(detailsRes.data?.data || null);
      setTransactions(transRes.data?.data?.transactions || []);
      setBalance(balanceRes.data?.data?.balance || '0.00');
    } catch (error) {
      console.error('Fetch Card Infrastructure Error:', error);
    } finally {
      setLoading(false);
    }
  }, [sn]);

  useEffect(() => {
    if (sn) {
      fetchData();
    }
  }, [sn, fetchData]);

  // Helper parsing for full card grouping display layout formatting
  const formatCardPan = (pan: string) => {
    if (!pan) return '•••• •••• •••• ••••';
    if (showCardDetails) {
      return pan.replace(/(.{4})/g, '$1 ').trim();
    }
    return `•••• •••• •••• ${pan.slice(-4)}`;
  };

  if (loading) {
    return (
      <Box
        sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  const isCardActive = card?.is_active === true;
  const cardCurrency = card?.card_currency?.toUpperCase() || 'NGN';

  return (
    <>
      <Head>
        <title>Card Details | CredDot</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* UPPER PANEL: Context Header & Trigger CTA actions */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
          sx={{ mb: 4 }}
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ color: 'text.disabled', cursor: 'pointer', mb: 1, width: 'fit-content' }}
              onClick={() => push('/dashboard/virtualcard/log')}
            >
              <Iconify icon="solar:alt-arrow-left-linear" width={16} />
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Back to Cards
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              Manage Card Details
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: 'flex-start', md: 'auto' } }}>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
              onClick={() => setOpenFund(true)}
              sx={{ fontWeight: 700 }}
            >
              Fund Card
            </Button>
            <Button
              variant="soft"
              color="warning"
              startIcon={<Iconify icon="solar:shield-cross-bold-duotone" />}
              onClick={() => setOpenStatus(true)}
              sx={{ fontWeight: 700 }}
            >
              Freeze/Status
            </Button>
            <Button
              variant="soft"
              color="info"
              startIcon={<Iconify icon="solar:key-bold-duotone" />}
              onClick={() => setOpenPin(true)}
              sx={{ fontWeight: 700 }}
            >
              Update PIN
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={4}>
          {/* LEFT PANEL COLUMN: Credit Visual Frame and Complete KYC parameters metadata */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* HIGH END GLASSMORPHISM DIGITAL CARD DESIGN LAYOUT */}
              <Card
                sx={{
                  p: 3,
                  background:
                    card?.card_currency === 'USD'
                      ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.darker} 0%, ${theme.palette.primary.main} 100%)`,
                  color: 'common.white',
                  borderRadius: 2.5,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: theme.customShadows.z12,
                  minHeight: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Header Track */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack spacing={0.5}>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.6,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                      }}
                    >
                      Available Card Balance
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {fCurrency(balance, cardCurrency)}
                      <small>{cardCurrency}</small>
                    </Typography>
                  </Stack>
                  <Iconify
                    icon={
                      String(card?.brand).toLowerCase() === 'visa'
                        ? 'logos:visa'
                        : 'logos:mastercard'
                    }
                    width={45}
                  />
                </Stack>

                {/* PAN Core Target Block */}
                <Box
                  sx={{
                    my: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ letterSpacing: 3, fontFamily: 'monospace', fontWeight: 600 }}
                  >
                    {formatCardPan(card?.card_number)}
                  </Typography>

                  <Tooltip title={showCardDetails ? 'Hide Card Details' : 'Show Card Details'}>
                    <IconButton
                      onClick={() => setShowCardDetails(!showCardDetails)}
                      sx={{
                        color: 'common.white',
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.2) },
                      }}
                    >
                      <Iconify
                        icon={showCardDetails ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                        width={18}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Footer Meta Row */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.5,
                        display: 'block',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      Card Holder Name
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {card?.card_name || 'Verification Pending'}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.5,
                          display: 'block',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        Expiry
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                      >
                        {card?.expiry_month ? String(card.expiry_month).padStart(2, '0') : 'XX'}/
                        {card?.expiry_year ? String(card.expiry_year).slice(-2) : 'XX'}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.5,
                          display: 'block',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        CVV
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                      >
                        {showCardDetails ? card?.cvv : '•••'}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Card>

              {/* METADATA TECHNICAL PARAMETERS PROPERTIES CARD */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                  Technical Parameters
                </Typography>
                <Stack spacing={2}>
                  <DetailRow label="Settlement Core" value={cardCurrency} />
                  <DetailRow label="Card Instance ID" value={card?.card_id} isCode />
                  <DetailRow
                    label="Operational Status"
                    value={isCardActive ? 'ACTIVE / RUNNING' : 'FROZEN / LOCKED'}
                    statusColor={isCardActive ? 'success.main' : 'error.main'}
                  />
                  <DetailRow
                    label="Fraud Lock Standard"
                    value={card?.blocked_due_to_fraud ? 'BLOCKED' : 'CLEARED'}
                    statusColor={card?.blocked_due_to_fraud ? 'error.main' : 'success.main'}
                  />
                </Stack>
              </Card>

              {/* CARD BILLING RECONCILIATION ADDRESS DATA */}
              {card?.billing_address && (
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                    AVS Billing Address
                  </Typography>
                  <Stack spacing={1.5}>
                    <DetailRow label="Street Line" value={card.billing_address.billing_address1} />
                    <DetailRow label="City Region" value={card.billing_address.billing_city} />
                    <DetailRow
                      label="State / Code"
                      value={`${card.billing_address.state} (${card.billing_address.state_code})`}
                    />
                    <DetailRow
                      label="Postal ZIP"
                      value={card.billing_address.billing_zip_code}
                      isCode
                    />
                    <DetailRow label="ISO Country" value={card.billing_address.billing_country} />
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* RIGHT PANEL COLUMN: Unified Account Transaction History Ledger Ledger */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Transaction History Ledger
                </Typography>
              </Box>

              <TableContainer sx={{ flexGrow: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date / Timestamp</TableCell>
                      <TableCell>Description Narrative</TableCell>
                      <TableCell>Amount Axis</TableCell>
                      <TableCell align="right">Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((trx, idx) => {
                      const isCredit = trx.transaction_type === 'CREDIT';
                      return (
                        <TableRow key={trx.transaction_reference || idx} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {fDateTime(trx.transaction_timestamp * 1000)}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="subtitle2"
                              // sx={{ fontWeight: 600, maxWidth: 320, isTruncated: true }}
                            >
                              {trx.narration}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ fontFamily: 'monospace' }}
                            >
                              Ref: {trx.transaction_reference}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: isCredit ? 'success.main' : 'error.main',
                              }}
                            >
                              {isCredit ? '+' : '-'}
                              {fCurrency(trx.transaction_amount, cardCurrency)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              component="span"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 0.75,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                bgcolor: isCredit
                                  ? alpha(theme.palette.success.main, 0.08)
                                  : alpha(theme.palette.error.main, 0.08),
                                color: isCredit ? 'success.main' : 'error.main',
                              }}
                            >
                              {trx.transaction_type}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                          <Paper
                            sx={{ textAlign: 'center', bgcolor: 'transparent', boxShadow: 'none' }}
                          >
                            <Iconify
                              icon="solar:document-text-bold-duotone"
                              width={48}
                              sx={{ color: 'text.disabled', mb: 1.5 }}
                            />
                            <Typography variant="subtitle2" color="text.secondary">
                              No transactional execution logs record found
                            </Typography>
                          </Paper>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Modal Modals Controls Components Wrapper Tree */}
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

interface DetailRowProps {
  label: string;
  value: string | null | undefined;
  isCode?: boolean;
  statusColor?: string;
}

function DetailRow({ label, value, isCode = false, statusColor }: DetailRowProps) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          fontFamily: isCode ? 'monospace' : 'inherit',
          color: statusColor || 'text.primary',
          fontSize: isCode ? '0.8rem' : '0.875rem',
          textAlign: 'right',
          wordBreak: 'break-all',
        }}
      >
        {value || '---'}
      </Typography>
    </Stack>
  );
}
