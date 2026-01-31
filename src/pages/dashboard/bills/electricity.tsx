/* eslint-disable no-nested-ternary */
/* eslint-disable no-alert */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Container,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  CardActionArea,
  Avatar,
  Paper,
  Dialog,
  DialogContent,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

ElectricityPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function ElectricityPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  // Data States
  const [providers, setProviders] = useState<any[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'input' | 'auth'>('input');

  // Verification States
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [authType, setAuthType] = useState<'pin' | 'otp' | null>(null);
  const [authMessage, setAuthMessage] = useState('');

  // Feedback States
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    meter: '',
    type: 'prepaid',
    customer: '',
    amount: '',
    pin: '',
  });
  const [result, setResult] = useState<any>(null);

  // 1. Fetch Electricity Providers (Discos)
  const fetchProviders = useCallback(async () => {
    try {
      const response = await axios.get('/bills/electricity/providers');
      setProviders(response.data.data);
    } catch (error) {
      setErrorMessage('Failed to load electricity providers.');
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // 2. Verify Meter Number
  const handleVerifyCustomer = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const response = await axios.post('/bills/electricity/verify', {
        meter: form.meter,
        type: form.type,
        customer: form.customer,
      });
      setVerifiedName(response.data.customer);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'Meter verification failed. Please check the number.'
      );
      setVerifiedName(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // 3. Security Auth Check
  const handleCheckAuth = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/payouts/check_auth');
      setAuthType(response.data.status === 'pin_required' ? 'pin' : 'otp');
      setAuthMessage(response.data.message);
      setStep('auth');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Security verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Final Process Purchase
  const handleFinalPurchase = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.post('/bills/electricity/buy', {
        meter: form.meter,
        customer: form.customer,
        amount: form.amount,
        type: form.type,
        pin: form.pin,
      });
      setResult(response.data);
      setShowSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Transaction could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDisco = providers.find((p) => p.networkid === form.meter);

  return (
    <>
      <Head>
        <title>Electricity Bills | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3">Electricity Bill</Typography>
          <Typography variant="body2" color="text.secondary">
            Pay your Disco bills and get tokens instantly.
          </Typography>
        </Box>

        {errorMessage && (
          <Alert
            severity="error"
            variant="filled"
            sx={{ mb: 4 }}
            onClose={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              {/* Step 1: Provider Selection */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  1. Select Distribution Company (Disco)
                </Typography>
                <Grid container spacing={2}>
                  {providers.map((p) => (
                    <Grid item xs={6} sm={4} key={p.networkid}>
                      <CardActionArea
                        onClick={() => {
                          setForm({ ...form, meter: p.networkid });
                          setVerifiedName(null);
                        }}
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          textAlign: 'center',
                          border: `2px solid ${
                            form.meter === p.networkid
                              ? theme.palette.primary.main
                              : alpha(theme.palette.divider, 0.1)
                          }`,
                          bgcolor:
                            form.meter === p.networkid
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'transparent',
                        }}
                      >
                        <Avatar
                          src={p.logo}
                          sx={{
                            width: 56,
                            height: 56,
                            mx: 'auto',
                            mb: 1,
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {p.name}
                        </Typography>
                      </CardActionArea>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              {/* Step 2: Meter Details */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 3 }}>
                  2. Meter Details & Amount
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', mb: 1, display: 'block' }}
                    >
                      Meter Type
                    </Typography>
                    <ToggleButtonGroup
                      fullWidth
                      value={form.type}
                      exclusive
                      onChange={(e, val) => {
                        if (val) setForm({ ...form, type: val });
                        setVerifiedName(null);
                      }}
                    >
                      <ToggleButton value="prepaid">Prepaid</ToggleButton>
                      <ToggleButton value="postpaid">Postpaid</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <TextField
                    fullWidth
                    label="Meter Number"
                    value={form.customer}
                    onChange={(e) => {
                      setForm({ ...form, customer: e.target.value });
                      setVerifiedName(null);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleVerifyCustomer}
                            disabled={!form.meter || !form.customer || isVerifying}
                          >
                            {isVerifying ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {verifiedName && (
                    <Alert icon={<Iconify icon="solar:user-check-bold" />} severity="success">
                      Meter Registered to: <strong>{verifiedName}</strong>
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Amount to Pay"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    }}
                  />

                  {step === 'auth' && (
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: 'background.neutral',
                        border: `1px dashed ${theme.palette.primary.main}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        {authMessage}
                      </Typography>
                      <TextField
                        fullWidth
                        autoFocus
                        type={authType === 'pin' ? 'password' : 'text'}
                        label={authType === 'pin' ? 'Transaction PIN' : 'OTP Code'}
                        value={form.pin}
                        onChange={(e) => setForm({ ...form, pin: e.target.value })}
                        inputProps={{
                          maxLength: authType === 'pin' ? 4 : 6,
                          style: { textAlign: 'center', letterSpacing: 10, fontWeight: 'bold' },
                        }}
                      />
                    </Paper>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Review Sidebar */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Payment Summary
              </Typography>
              <Stack spacing={2.5}>
                <ReviewRow label="Disco" value={selectedDisco?.name || '---'} />
                <ReviewRow label="Meter Type" value={form.type.toUpperCase()} />
                <ReviewRow label="Meter Number" value={form.customer || '---'} />
                <ReviewRow label="Customer" value={verifiedName || '---'} />

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Total Amount</Typography>
                  <Typography variant="h4" color="primary">
                    {fCurrency(form.amount || 0, 'NGN')}
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={!verifiedName || !form.amount || loading}
                  onClick={step === 'input' ? handleCheckAuth : handleFinalPurchase}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : step === 'input' ? (
                    'Proceed'
                  ) : (
                    'Purchase Token'
                  )}
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Success Modal */}
      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)} fullWidth maxWidth="xs">
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <Iconify icon="solar:bolt-circle-bold" width={72} color="warning.main" sx={{ mb: 2 }} />
          <Typography variant="h4">Payment Successful</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {result?.message}
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'background.neutral' }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">Total Paid</Typography>
                <Typography variant="subtitle2">
                  {fCurrency(result?.data?.total || 0, 'NGN')}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">Reference</Typography>
                <Typography variant="subtitle2" sx={{ fontSize: 11 }}>
                  {result?.payout_ref}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">New Wallet Balance</Typography>
                <Typography variant="h6" color="primary">
                  {fCurrency(result?.data?.balance_after || 0, 'NGN')}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => window.location.reload()}
          >
            Download Receipt
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textAlign: 'right', pl: 2 }}>
        {value}
      </Typography>
    </Stack>
  );
}
