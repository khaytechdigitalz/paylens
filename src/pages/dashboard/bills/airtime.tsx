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

const PRESETS = [200, 500, 1000, 2000, 5000];

AirtimePage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function AirtimePage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  // Data States
  const [networks, setNetworks] = useState<any[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'auth'>('input');
  const [authType, setAuthType] = useState<'pin' | 'otp' | null>(null);
  const [authMessage, setAuthMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({ network: '', phone: '', amount: '', pin: '' });
  const [result, setResult] = useState<{ message: string; balance: number; ref: string } | null>(
    null
  );

  // 1. Fetch Networks on Load
  const fetchNetworks = useCallback(async () => {
    try {
      const response = await axios.get('/bills/airtime/networks');
      setNetworks(response.data.data);
    } catch (error) {
      setErrorMessage('Failed to load network providers.');
    }
  }, []);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  const selectedNetwork = networks.find((n) => n.networkid === form.network);

  // 2. Step One: Check Auth (PIN or OTP)
  const handleCheckAuth = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.get('/payouts/check_auth');
      setAuthType(response.data.status === 'pin_required' ? 'pin' : 'otp');
      setAuthMessage(response.data.message);
      setStep('auth');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Authentication check failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Step Two: Execute Purchase
  const handleFinalPurchase = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.post('/bills/airtime/buy', {
        amount: form.amount,
        number: form.phone,
        network: form.network,
        pin: form.pin,
      });

      setResult({
        message: response.data.message,
        balance: response.data.balance_after,
        ref: response.data.payout_ref,
      });
      setShowSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Airtime purchase failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setStep('input');
    setForm({ network: '', phone: '', amount: '', pin: '' });
    setResult(null);
  };

  return (
    <>
      <Head>
        <title>Airtime Top-up | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3">Airtime Top-up</Typography>
          <Typography variant="body2" color="text.secondary">
            Recharge any phone number instantly.
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
              {/* Network Provider Selection */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  1. Select Provider
                </Typography>
                <Grid container spacing={2}>
                  {networks.map((net) => (
                    <Grid item xs={6} sm={3} key={net.networkid}>
                      <CardActionArea
                        onClick={() => setForm({ ...form, network: net.networkid })}
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          textAlign: 'center',
                          border: `2px solid ${
                            form.network === net.networkid
                              ? theme.palette.primary.main
                              : alpha(theme.palette.divider, 0.1)
                          }`,
                          bgcolor:
                            form.network === net.networkid
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'transparent',
                        }}
                      >
                        <Avatar
                          src={net.logo}
                          sx={{
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 1,
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {net.name}
                        </Typography>
                      </CardActionArea>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              {/* Amount and Phone Form */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 3 }}>
                  2. Recharge Details
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 08012345678"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:phone-bold" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box>
                    <TextField
                      fullWidth
                      label="Amount"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                      }}
                    />
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                      {PRESETS.map((amt) => (
                        <Button
                          key={amt}
                          variant={form.amount === amt.toString() ? 'contained' : 'soft'}
                          onClick={() => setForm({ ...form, amount: amt.toString() })}
                        >
                          ₦{amt.toLocaleString()}
                        </Button>
                      ))}
                    </Stack>
                  </Box>

                  {step === 'auth' && (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: 'background.neutral',
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.primary.main}`,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Iconify icon="solar:lock-password-bold" color="primary.main" />{' '}
                        {authMessage}
                      </Typography>
                      <TextField
                        fullWidth
                        autoFocus
                        type={authType === 'pin' ? 'password' : 'text'}
                        placeholder={authType === 'pin' ? '****' : 'Enter OTP'}
                        value={form.pin}
                        onChange={(e) => setForm({ ...form, pin: e.target.value })}
                        inputProps={{
                          maxLength: authType === 'pin' ? 4 : 6,
                          style: {
                            textAlign: 'center',
                            letterSpacing: authType === 'pin' ? 12 : 4,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                          },
                        }}
                      />
                    </Box>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Checkout Review */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Review Order
              </Typography>

              <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Network
                  </Typography>
                  <Typography variant="subtitle2">{selectedNetwork?.name || '---'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="subtitle2">{form.phone || '---'}</Typography>
                </Stack>

                <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Amount</Typography>
                  <Typography variant="h4" color="primary">
                    {fCurrency(form.amount || 0, 'NGN')}
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={!form.network || !form.amount || form.phone.length < 10 || loading}
                  onClick={step === 'input' ? handleCheckAuth : handleFinalPurchase}
                  sx={{ py: 1.5 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : step === 'input' ? (
                    'Proceed to Pay'
                  ) : (
                    'Confirm Recharge'
                  )}
                </Button>

                {step === 'auth' && (
                  <Button
                    fullWidth
                    color="inherit"
                    onClick={() => setStep('input')}
                    disabled={loading}
                  >
                    Change Details
                  </Button>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Success Receipt Modal */}
      <Dialog open={showSuccess} onClose={handleCloseSuccess} fullWidth maxWidth="xs">
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <Box
            sx={{
              mb: 3,
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.success.main, 0.1),
            }}
          >
            <Iconify icon="solar:check-circle-bold" width={64} color="success.main" />
          </Box>
          <Typography variant="h4" gutterBottom>
            Success!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {result?.message}
          </Typography>

          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 4, bgcolor: 'background.neutral', borderStyle: 'dashed' }}
          >
            <Stack spacing={1}>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 'bold' }}>
                TRANSACTION REFERENCE
              </Typography>
              <Typography variant="subtitle2">{result?.ref}</Typography>
              <Divider />
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 'bold' }}>
                REMAINING BALANCE
              </Typography>
              <Typography variant="h6" color="primary.main">
                {fCurrency(result?.balance || 0, 'NGN')}
              </Typography>
            </Stack>
          </Paper>

          <Button fullWidth variant="contained" size="large" onClick={handleCloseSuccess}>
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
