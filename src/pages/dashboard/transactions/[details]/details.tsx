/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import {
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  Button,
  Divider,
  Box,
  alpha,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  IconButton,
  useTheme,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import { useSettingsContext } from '../../../../components/settings';
import LoadingScreen from '../../../../components/loading-screen';
import EmptyContent from '../../../../components/empty-content';
import { useSnackbar } from '../../../../components/snackbar';
// utils
import axios from '../../../../utils/axios';
import { fCurrency } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';

// ----------------------------------------------------------------------

TransactionDetailsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function TransactionDetailsPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { query, isReady, push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { details } = query;
  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal & Submission States
  const [openRefund, setOpenRefund] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [openWebhook, setOpenWebhook] = useState(false);

  const getTransaction = useCallback(async () => {
    if (!details) return;
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(`/transaction/${details}`);
      setTransactionData(response.data.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [details]);

  useEffect(() => {
    if (isReady) getTransaction();
  }, [isReady, getTransaction]);

  // Handle Refund API Call
  const handleRefundSubmit = async () => {
    try {
      setIsSubmittingRefund(true);
      // Adjusting endpoint based on your pattern /transaction/{id}/refund
      await axios.post(`/refunds/request`, {
        reason: refundReason,
        transaction_ref: details,
      });

      enqueueSnackbar('Refund processed successfully', { variant: 'success' });
      setOpenRefund(false);
      setRefundReason('');
      // Refresh data to show updated status (e.g. "refunded")
      getTransaction();
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err.message || 'Failed to process refund', { variant: 'error' });
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  if (loading && !transactionData) return <LoadingScreen />;

  if (error || !transactionData) {
    return (
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <EmptyContent
          title="Transaction Not Found"
          description="The reference provided is invalid or the transaction has been archived."
        />
      </Container>
    );
  }

  const { transaction, total_deducted } = transactionData;
  const isSuccess = transaction.status === 'success';

  return (
    <>
      <Head>
        <title>TX: {transaction.reference} | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => push('/dashboard/transactions')}
              sx={{ bgcolor: 'action.hover' }}
            >
              <Iconify icon="eva:arrow-back-fill" />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ mb: 0 }}>
                Transaction Overview
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                ID: {transaction.id} • {transaction.reference}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button variant="soft" color="inherit" startIcon={<Iconify icon="eva:printer-fill" />}>
              Receipt
            </Button>
            {isSuccess && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenWebhook(true)}
                startIcon={<Iconify icon="eva:paper-plane-fill" />}
              >
                Resend Webhook
              </Button>
            )}
          </Stack>
        </Stack>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                position: 'relative',
                bgcolor: 'background.neutral',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 40,
                  height: 20,
                  bgcolor: 'background.default',
                  borderRadius: '0 0 50px 50px',
                }}
              />

              <Stack alignItems="center" sx={{ mb: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette[isSuccess ? 'success' : 'warning'].main, 0.1),
                    color: theme.palette[isSuccess ? 'success' : 'warning'].main,
                  }}
                >
                  <Iconify
                    icon={isSuccess ? 'eva:checkmark-circle-2-fill' : 'eva:clock-fill'}
                    width={48}
                  />
                </Box>
                <Typography variant="h2">
                  {fCurrency(transaction.amount, transaction.currency)}
                </Typography>
                <Label status={transaction.status} />
              </Stack>

              <Stack spacing={2.5}>
                <ReceiptItem label="Category" value={transaction.category} />
                <ReceiptItem label="Type" value={transaction.type} />
                <ReceiptItem
                  label="Payment Method"
                  value={transaction.payment_method || 'Digital Wallet'}
                />
                <ReceiptItem label="Initiated At" value={fDateTime(transaction.created_at)} />
                <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Subtotal
                  </Typography>
                  <Typography variant="subtitle2">
                    {fCurrency(transaction.amount, transaction.currency)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Platform Fee
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'error.main' }}>
                    -{fCurrency(transaction.fee, transaction.currency)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Settled Amount</Typography>
                  <Typography variant="h6" sx={{ color: 'primary.main' }}>
                    {fCurrency(total_deducted, transaction.currency)}
                  </Typography>
                </Stack>
              </Stack>

              {isSuccess && (
                <Button
                  fullWidth
                  variant="soft"
                  color="error"
                  sx={{ mt: 4 }}
                  onClick={() => setOpenRefund(true)}
                >
                  Initiate Refund
                </Button>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              <Card
                sx={{
                  p: 0,
                  overflow: 'hidden',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'background.neutral',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1">Ledger Summary</Typography>
                  <Iconify icon="eva:shield-fill" sx={{ color: 'success.main' }} />
                </Box>
                <Grid container>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    sx={{
                      p: 3,
                      borderRight: (theme) => ({ sm: `1px solid ${theme.palette.divider}` }),
                    }}
                  >
                    <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                      Balance Before
                    </Typography>
                    <Typography variant="h4">
                      {fCurrency(transaction.balance_before, transaction.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ p: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                      Balance After
                    </Typography>
                    <Typography variant="h4">
                      {fCurrency(transaction.balance_after, transaction.currency)}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              <Card sx={{ p: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  Network & Metadata
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <InfoItem
                    label="IP Address"
                    value={transaction.ip_address || 'Not Recorded'}
                    icon="eva:globe-fill"
                  />
                  <InfoItem
                    label="Location"
                    value={transaction.location || 'Encrypted'}
                    icon="eva:pin-fill"
                  />
                  <InfoItem label="Mode" value={transaction.mode} icon="eva:settings-2-fill" />
                  <InfoItem
                    label="Wallet Address"
                    value={transaction.wallet?.wallet_address || 'N/A'}
                    icon="eva:hash-fill"
                    isAddress
                  />
                </Grid>
                <Typography
                  variant="overline"
                  sx={{ color: 'text.disabled', display: 'block', mb: 1.5 }}
                >
                  System Payload (JSON)
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: '#1e2125',
                    color: '#71f1a1',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    maxHeight: '300px',
                    overflow: 'auto',
                  }}
                >
                  {transaction.metadata ? (
                    <pre>{JSON.stringify(transaction.metadata, null, 2)}</pre>
                  ) : (
                    '// No metadata'
                  )}
                </Box>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* --- REFUND MODAL --- */}
      <Dialog
        open={openRefund}
        onClose={() => !isSubmittingRefund && setOpenRefund(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="eva:alert-triangle-fill" sx={{ color: 'error.main' }} />
          Confirm Refund
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <DialogContentText sx={{ mb: 3 }}>
            You are about to reverse{' '}
            <strong>{fCurrency(transaction.amount, transaction.currency)}</strong>. This action will
            return funds to the user and cannot be undone.
          </DialogContentText>

          <TextField
            fullWidth
            label="Reason for refund"
            placeholder="e.g., Customer request, Duplicate payment..."
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            color="inherit"
            variant="outlined"
            onClick={() => setOpenRefund(false)}
            disabled={isSubmittingRefund}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            loading={isSubmittingRefund}
            onClick={handleRefundSubmit}
          >
            Confirm Refund
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* WEBHOOK MODAL */}
      <Dialog open={openWebhook} onClose={() => setOpenWebhook(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pb: 1 }}>Trigger Webhook</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Attempting to resend the callback for <strong>{transaction.reference}</strong>. Make
            sure your listener is online.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="outlined" color="inherit" onClick={() => setOpenWebhook(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenWebhook(false);
              enqueueSnackbar('Process Started');
            }}
          >
            Confirm Dispatch
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

function Label({ status }: { status: string }) {
  const isSuccess = status === 'success';
  return (
    <Typography
      variant="caption"
      sx={{
        mt: 1,
        px: 1.5,
        py: 0.5,
        borderRadius: 10,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: 1,
        bgcolor: (theme: any) => alpha(theme.palette[isSuccess ? 'success' : 'warning'].main, 0.15),
        color: (theme: any) => theme.palette[isSuccess ? 'success' : 'warning'].main,
      }}
    >
      {status}
    </Typography>
  );
}

function ReceiptItem({ label, value }: any) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textAlign: 'right', fontWeight: 700 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function InfoItem({ label, value, icon, isAddress }: any) {
  return (
    <Grid item xs={12} sm={6}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          <Iconify icon={icon} sx={{ width: 20, color: 'text.secondary' }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', fontWeight: 800, display: 'block' }}
          >
            {label}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              textTransform: isAddress ? 'none' : 'capitalize',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Grid>
  );
}
